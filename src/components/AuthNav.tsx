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
//
// Two visual variants:
//   - default: used by BaseLayout on topic pages and signin page.
//     Plain styling via `.auth-nav--*` classes.
//   - landingVariant: used by the cyberpunk landing at / only.
//     Matches the landing's nav-link / nav-cta styling so the
//     button looks like the rest of the landing nav.

import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';

interface AuthNavProps {
  landingVariant?: boolean;
}

export default function AuthNav({ landingVariant = false }: AuthNavProps) {
  const { user, loading } = useAuth();

  // Class prefix swaps based on variant. Kept as a local constant so
  // the two variants stay close in the code and style changes to one
  // are easy to mirror to the other if needed.
  const cls = landingVariant
    ? {
        root: 'landing-auth',
        loading: 'landing-auth landing-auth--loading',
        signin: 'nav-cta landing-auth__signin',
        signedInRoot: 'landing-auth landing-auth--signed-in',
        userLabel: 'landing-auth__user',
        signout: 'nav-link landing-auth__signout',
      }
    : {
        root: 'auth-nav',
        loading: 'auth-nav auth-nav--loading',
        signin: 'auth-nav auth-nav--signin',
        signedInRoot: 'auth-nav auth-nav--signed-in',
        userLabel: 'auth-nav__user',
        signout: 'auth-nav__signout',
      };

  if (loading) {
    // Brief loading state. Invisible span keeps the nav from jumping
    // when auth resolves.
    return <span className={cls.loading}>&nbsp;</span>;
  }

  if (!user) {
    // Encode the current path so signin can redirect back afterwards.
    const next = typeof window !== 'undefined'
      ? encodeURIComponent(window.location.pathname + window.location.search)
      : '/';
    return (
      <a href={`/signin?next=${next}`} className={cls.signin}>
        {landingVariant ? 'SIGN IN' : 'Sign In'}
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
    <span className={cls.signedInRoot}>
      <span className={cls.userLabel}>{label}</span>
      <button
        type="button"
        onClick={handleSignOut}
        className={cls.signout}
      >
        {landingVariant ? 'SIGN OUT' : 'Sign Out'}
      </button>
    </span>
  );
}
