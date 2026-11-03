import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  inMemoryPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBADLaS3Pn_ng6qNVlkw0y3dMZ-4F05J4",
  authDomain: "flood-ledger.firebaseapp.com",
  projectId: "flood-ledger",
    storageBucket: "flood-ledger.firebasestorage.app",
  messagingSenderId: "362012435624",
  appId: "1:362012435624:web:57c22544520d2810fc8e9d",
};

const app =
  getApps().find((item) => item.name === "[DEFAULT]") ??
  initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Separate authentication instance for creating Authority accounts.
const secondaryApp =
  getApps().find(
    (item) => item.name === "authority-account-creator"
  ) ?? initializeApp(firebaseConfig, "authority-account-creator");

export const authorityCreationAuth = (() => {
  try {
    return initializeAuth(secondaryApp, {
      persistence: inMemoryPersistence,
    });
  } catch {
    // Reuse the existing instance during development hot reloads.
    return getAuth(secondaryApp);
  }
})();

export default app;