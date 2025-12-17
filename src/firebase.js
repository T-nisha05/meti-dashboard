// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0xSqV5cVrVL4upAOFbBkGY_M8Go-CNCU",
  authDomain: "meti-dashboard.firebaseapp.com",
  projectId: "meti-dashboard",
  storageBucket: "meti-dashboard.firebasestorage.app",
  messagingSenderId: "634692128020",
  appId: "1:634692128020:web:0c129a8c5165fa19c68601",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
