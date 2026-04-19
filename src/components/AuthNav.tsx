// src/components/AuthNav.tsx
//
// The right-hand side of the top navigation. Shows:
//   - "Sign In" link when the user is not signed in
//   - User's email (or display name) + Sign Out button when signed in
//
// Rendered as a client island with `client:load` so it hydrates as
// soon as possible. The brief flash of "Sign In" before the auth
// state resolves is acceptable; we could suppress it with a loading
// placeholder but it adds complexity for little gain on a static
// site.

import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';

export default function AuthNav() {
  const { user, loading } = useAuth();

  if (loading) {
    // Brief loading state. Invisible span keeps the nav from jumping
    // when auth resolves.
    return <span className="auth-nav auth-nav--loading">&nbsp;</span>;
  }

  if (!user) {
    // Encode the current path so signin can redirect back afterwards.
    const next = typeof window !== 'undefined'
      ? encodeURIComponent(window.location.pathname + window.location.search)
      : '/';
    return (
      <a href={`/signin?next=${next}`} className="auth-nav auth-nav--signin">
        Sign In
      </a>
    );
  }

  // Prefer displayName if Firebase has one, otherwise show the email
  // local part (before the @). Keeps the nav short.
  const label = user.displayName || user.email?.split('@')[0] || 'Signed in';

  async function handleSignOut() {
    await signOut(auth);
    // Reload so that any page currently showing signed-in-only content
    // re-renders in the signed-out state. On the current site no page
    // shows such content, but this protects us once they do.
    window.location.href = '/';
  }

  return (
    <span className="auth-nav auth-nav--signed-in">
      <span className="auth-nav__user">{label}</span>
      <button
        type="button"
        onClick={handleSignOut}
        className="auth-nav__signout"
      >
        Sign Out
      </button>
    </span>
  );
}
