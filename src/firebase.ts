import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBADLaS3Pn_ng6qNVlkw0y3dMZ-4F05J4",
  authDomain: "flood-ledger.firebaseapp.com",
  projectId: "flood-ledger",
    storageBucket: "flood-ledger.firebasestorage.app",
  messagingSenderId: "362012435624",
  appId: "1:362012435624:web:57c22544520d2810fc8e9d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;