// src/lib/drillStore.ts
//
// Firestore write helper for terminology drill ratings.
//
// A drill rating records that a student saw a specific drill prompt and
// rated their recall as 'got' (correct recall) or 'miss' (failed recall).
// Ratings are saved to users/{uid}/drillRatings/{compositeId}, where
// compositeId is `${topicId}__${termId}`. This is a simple upsert: the
// latest rating replaces any previous rating for the same term by the
// same user.
//
// Future PR will read these to build a spaced-review schedule. For now
// we just capture them so that data exists to build on.

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { app } from './firebase';

export type DrillOutcome = 'got' | 'miss';

let cached: Firestore | null = null;
function db(): Firestore {
  if (cached) return cached;
  cached = getFirestore(app);
  return cached;
}

export async function saveDrillRating(
  uid: string,
  topicId: string,
  termId: string,
  outcome: DrillOutcome,
): Promise<void> {
  const compositeId = `${topicId}__${termId}`;
  const ref = doc(db(), 'users', uid, 'drillRatings', compositeId);
  await setDoc(ref, {
    topicId,
    termId,
    outcome,
    ratedAt: serverTimestamp(),
    source: 'signal',
  });
}
