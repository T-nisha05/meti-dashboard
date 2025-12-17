import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Firebase automatically restores session next time
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="glass p-4 text-center">
        <h3 className="mb-3">Welcome to Internix</h3>
        <p className="text-muted mb-4">
          Sign in to continue managing your internships
        </p>
        <button className="btn btn-primary" onClick={handleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
