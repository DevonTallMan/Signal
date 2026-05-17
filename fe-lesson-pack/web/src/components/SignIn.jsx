import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase.js";

export default function SignIn() {
  async function handleSignIn() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Sign-in failed", err);
      alert("Sign-in failed: " + (err.message || "unknown error"));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">FE Lesson Pack</h1>
        <p className="text-slate-600 mb-6 text-sm">
          Personal lesson planning. Sign in with the Google account you set up
          this project under.
        </p>
        <button onClick={handleSignIn} className="btn-primary w-full">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
