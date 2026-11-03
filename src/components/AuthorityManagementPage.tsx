import { useState, type FormEvent } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { authorityCreationAuth, db } from '../firebase';

interface AuthorityManagementPageProps {
  isDemoMode?: boolean;
}

export function AuthorityManagementPage({
  isDemoMode = false,
}: AuthorityManagementPageProps) {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (isDemoMode) {
        setMessage(`Demo: Authority account for ${email} simulated successfully.`);
        setName('');
        setDesignation('');
        setEmail('');
        setPhone('');
        setPassword('');
        return;
      }

      const credential = await createUserWithEmailAndPassword(
        authorityCreationAuth,
        email.trim(),
        password
      );

      await setDoc(doc(db, 'users', credential.user.uid), {
        role: 'authority',
        name: name.trim(),
        designation: designation.trim(),
        phone: phone.trim(),
      });

      setMessage(`Authority account created successfully for ${email}.`);

      await authorityCreationAuth.signOut();

      setName('');
      setDesignation('');
      setEmail('');
      setPhone('');
      setPassword('');
    } catch (error) {
      console.error('Authority account creation failed:', error);
      setMessage(
        'Account creation failed. Check the Firebase rules and Authentication settings.'
      );
    } finally {
      setLoading(false);
    }
  }

    return (
    <div className="page-container authority-management-page">
      <div className="authority-page-header">
        <div>
          <p className="authority-eyebrow">ADMINISTRATION</p>
          <h1>Authority Management</h1>
          <p>
            Create and register new Authority Officers for Flood Ledger.
          </p>
        </div>

        <div className="authority-header-icon">♙</div>
      </div>

      <section className="authority-form-card">
        <div className="authority-card-heading">
          <div>
            <h2>Create New Officer</h2>
            <p>Enter the officer's details to create an account.</p>
          </div>
          <span className="authority-status">AUTHORITY ACCESS</span>
        </div>

        <form onSubmit={handleSubmit} className="authority-form">
          <div className="authority-form-grid">
            <label>
              Officer Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter full name"
                required
              />
            </label>

            <label>
              Designation
              <input
                value={designation}
                onChange={(event) => setDesignation(event.target.value)}
                placeholder="e.g. District Officer"
                required
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="officer@example.com"
                required
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter phone number"
              />
            </label>

            <label className="authority-full-width">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
              <span className="authority-input-hint">
                The officer can use this password to sign in.
              </span>
            </label>
          </div>

          {message && (
            <div className="authority-message" role="status">
              {message}
            </div>
          )}

          <div className="authority-form-footer">
            <p>All required fields must be completed.</p>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating account...' : '+ Create Authority Account'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}