// src/lib/firebase.ts
//
// Central Firebase initialisation for Signal. This module is imported
// by any code that needs to call Firebase (auth, Firestore, etc).
//
// The config values below are public by design. Firebase enforces
// access through Firestore security rules and Authentication
// configuration, not through keeping these values secret. They are
// safe to commit to a public repo.
//
// Two projects are configured:
//
//   - Production: mark-scheme-method-3efe9, shared with MSM and the
//     legacy Edtech site. A student signed in on one site has an
//     account recognised on the other. This is intentional while we
//     migrate Edtech's interactive features onto Signal's architecture.
//
//   - Staging: signal-staging-26b3e, used during dev to test rule
//     changes and schema work without touching MSM's live data.
//
// The active config is selected via import.meta.env.DEV, which is
// true under `astro dev` and false in production builds.

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  browserSessionPersistence,
  setPersistence,
  type Auth,
} from 'firebase/auth';

const productionConfig = {
  apiKey: 'AIzaSyCVC9ao5TOZEbq-xqetOoP-pBy-k8HJ4Lk',
  authDomain: 'mark-scheme-method-3efe9.firebaseapp.com',
  projectId: 'mark-scheme-method-3efe9',
  storageBucket: 'mark-scheme-method-3efe9.firebasestorage.app',
  messagingSenderId: '148025025945',
  appId: '1:148025025945:web:dbc09dbd4ac2777f959f08',
};

const stagingConfig = {
  apiKey: 'AIzaSyAqec8HHrXRnwDTLcyM5Y9aLovWlFE77rc',
  authDomain: 'signal-staging-26b3e.firebaseapp.com',
  projectId: 'signal-staging-26b3e',
  storageBucket: 'signal-staging-26b3e.firebasestorage.app',
  messagingSenderId: '1074335579413',
  appId: '1:1074335579413:web:edafc2f4eaf0b58cd3bd1c',
};

const firebaseConfig = import.meta.env.DEV ? stagingConfig : productionConfig;

// getApps() guards against re-initialising Firebase if this module is
// imported multiple times (which happens during dev hot-reload and
// across different Astro islands on the same page).
export const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth: Auth = getAuth(app);

// Session persistence: the student stays signed in as long as the
// browser tab is open. Closing the browser signs them out. This is
// stricter than browserLocalPersistence (which persists across browser
// restarts) and matches the behaviour of the legacy Edtech site.
//
// setPersistence is a promise. We fire it without awaiting because
// Firebase queues auth operations until persistence is set.
void setPersistence(auth, browserSessionPersistence);