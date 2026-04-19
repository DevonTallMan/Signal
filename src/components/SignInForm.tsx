// src/components/SignInForm.tsx
//
// Client-side React island for email/password sign-in.
//
// Mounted on the /signin page. Handles the form submission, calls
// Firebase Auth, and on success redirects the user back to wherever
// they came from (via the `next` query parameter, defaulting to /).
//
// This is intentionally a small, standard form. No validation beyond
// what the browser gives us and what Firebase returns. No password-
// strength hints; students use pre-existing accounts from Edtech.

import { useState, type FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Read the `next` query param to decide where to send the user.
      // This lets a page say "sign in, then come back here." Default
      // to the homepage if no `next` is set.
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next') || '/';
      window.location.href = next;
    } catch (err) {
      // Firebase error codes are strings like 'auth/invalid-credential'.
      // The messages are technical. We translate the common ones into
      // plain language.
      const code = (err as { code?: string }).code ?? 'unknown';
      setError(translateAuthError(code));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="signin-form">
      <label className="signin-label">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
          disabled={submitting}
        />
      </label>

      <label className="signin-label">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={submitting}
        />
      </label>

      {error && <p className="signin-error">{error}</p>}

      <button type="submit" disabled={submitting} className="signin-submit">
        {submitting ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}

function translateAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    case 'auth/invalid-email':
      return 'That does not look like a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Try again in a few minutes.';
    case 'auth/network-request-failed':
      return 'Could not reach the sign-in service. Check your connection.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorised for sign-in. Contact support.';
    default:
      return 'Sign-in failed. Please try again.';
  }
}
