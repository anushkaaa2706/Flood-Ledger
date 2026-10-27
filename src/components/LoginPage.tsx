
import { useState, type FormEvent } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

type UserRole = 'citizen' | 'authority';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export function LoginPage({ onBack, onLoginSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;

      if (mode === 'signup') {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        user = credential.user;

        // Public sign-up can create only a Citizen role.
        await setDoc(doc(db, 'users', user.uid), {
          role: 'citizen',
        });

        onLoginSuccess('citizen');
        return;
      }

      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      user = credential.user;

      const userRef = doc(db, 'users', user.uid);
      let userSnapshot = await getDoc(userRef);

      // Existing accounts without a role record are initialized as Citizens.
      // Firestore rules must continue to restrict creation to role: citizen.
      if (!userSnapshot.exists()) {
        await setDoc(userRef, { role: 'citizen' });
        userSnapshot = await getDoc(userRef);
      }

      const role = userSnapshot.data()?.role;

      if (role !== 'citizen' && role !== 'authority') {
        await auth.signOut();
        setError('Your account role is invalid. Please contact an administrator.');
        return;
      }

      onLoginSuccess(role);
    } catch (err) {
      const code =
        err instanceof Error && 'code' in err
          ? String(err.code)
          : '';

      if (code.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists. Please sign in.');
      } else if (code.includes('auth/invalid-credential')) {
        setError('Email or password is incorrect.');
      } else if (code.includes('auth/weak-password')) {
        setError('Please choose a password with at least 6 characters.');
      } else if (code.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (code.includes('auth/too-many-requests')) {
        setError('Too many attempts. Please wait and try again.');
      } else if (code.includes('permission-denied')) {
        setError('Access was denied by database security rules.');
      } else {
        setError(
          'Could not complete your request. Check your connection and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <button className="login-back-button" onClick={onBack} type="button">
        ← Back
      </button>

      <section className="login-card">
        <div className="login-logo">≈</div>
        <p className="login-eyebrow">FLOOD LEDGER</p>

        <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="login-subtitle">
          {mode === 'signin'
            ? 'Sign in to access your Flood Ledger account.'
            : 'Create a citizen account to get started.'}
        </p>

        <div className="login-tabs">
          <button
            type="button"
            className={mode === 'signin' ? 'active' : ''}
            onClick={() => {
              setMode('signin');
              setError('');
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => {
              setMode('signup');
              setError('');
            }}
          >
            Citizen sign up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            placeholder="At least 6 characters"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button className="login-submit" type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'signin'
                ? 'Sign in →'
                : 'Create citizen account →'}
          </button>
        </form>

        <p className="login-security-note">
          Authority access is assigned separately by an authorized administrator.
        </p>
      </section>
    </div>
  );
}
