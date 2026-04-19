// src/lib/useAuth.ts
//
// React hook for consuming Firebase auth state in client-side islands.
//
// Usage:
//   const { user, loading } = useAuth();
//   if (loading) return <p>Loading...</p>;
//   if (!user) return <p>Not signed in.</p>;
//   return <p>Signed in as {user.email}</p>;
//
// `user` is Firebase's User object (email, uid, displayName, etc).
// `loading` is true only during the brief window between page load
// and Firebase resolving the initial auth state from the session.

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged fires once immediately with the current state
    // (signed in or not) and then again on every state change. The
    // returned function is the unsubscribe handle.
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
