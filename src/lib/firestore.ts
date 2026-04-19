// src/lib/firestore.ts
//
// Firestore read/write helpers for Signal.
//
// Only the write surface is built so far (saving a submission).
// Read helpers come in a later PR when we render progress.

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { app } from './firebase';
import type { Submission } from './types';

let cached: Firestore | null = null;

function db(): Firestore {
  if (cached) return cached;
  cached = getFirestore(app);
  return cached;
}

/**
 * Write a submission to users/{uid}/submissions/. Returns the new
 * document ID. Throws if Firestore rejects the write (most commonly
 * a security rules denial, which presents as a permission-denied
 * FirebaseError).
 *
 * The Firestore server timestamp is used for `submittedAt` on the
 * server-side document; the client-side Submission type keeps
 * Date.now() as a fallback for immediate UI rendering. The two may
 * disagree by milliseconds; that's fine.
 */
export async function saveSubmission(
  uid: string,
  submission: Submission,
): Promise<string> {
  const submissionsRef = collection(db(), 'users', uid, 'submissions');
  const docRef = await addDoc(submissionsRef, {
    ...submission,
    // Replace the client Date.now() with the server timestamp so the
    // canonical value is set by Firestore, not the client clock.
    submittedAt: serverTimestamp(),
  });
  return docRef.id;
}
