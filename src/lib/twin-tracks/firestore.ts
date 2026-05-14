// src/lib/twin-tracks/firestore.ts
//
// Firestore persistence for Twin Tracks.
// Sprint 4 Increment 4.5: startSession, writeAttempt, completeSession.
//
// Mirrors src/lib/sort-and-match/firestore.ts:
//   - Module imports from firebase.ts, NOT the legacy window.MSM_APP pattern
//   - Returns null if there is no authenticated user (graceful ephemeral mode)
//   - Errors are logged via console.error/info but never thrown; persistence
//     failure does not break the user-facing UX
//
// Schema design note (DIFFERS FROM SORT & MATCH):
//
// Sort & Match writes one attempt per "Check answers" click (1 to 3 per
// scenario). Twin Tracks has no Check button (per-drop validation per spec
// Section 6.4), so we choose a different attempt unit:
//
//   ONE ATTEMPT PER PHRASE-LOCK (exactly 6 attempt documents per scenario).
//
// Each attempt captures the lock event for one phrase: how many wrong drops
// happened on that phrase before locking, whether the stuck-mitigation hint
// fired, and elapsed time from scenario start to lock. This is granular
// enough for pilot analytics ("which phrases tripped students most often?")
// without writing per-drop documents (which could be 12 to 30 per scenario).
//
// Trade-off: per-drop diagnostic data (track-right-slot-wrong vs both-wrong)
// is not captured in the attempt doc. If pilot observation surfaces a need
// for that granularity, a separate "diagnosticEvents" subcollection could be
// added later without breaking the current schema.

import {
  collection,
  doc,
  getFirestore,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { app, auth } from "../firebase";

export interface SessionHandle {
  id: string;
}

export type SessionMode = "first-attempt";

const SOURCE = "signal" as const;
const DATA_KEY = "twin-tracks" as const;

/**
 * Start a Twin Tracks session for the current authenticated user.
 * Returns a SessionHandle if persistence succeeded, null if there is no
 * authenticated user (in which case the activity runs in ephemeral mode).
 */
export async function startSession(
  mode: SessionMode = "first-attempt"
): Promise<SessionHandle | null> {
  const user = auth.currentUser;
  if (!user) {
    console.info(
      "[twin-tracks] no authenticated user; running without persistence"
    );
    return null;
  }

  const db = getFirestore(app);
  const sessionId = crypto.randomUUID();
  const sessionRef = doc(
    collection(db, "users", user.uid, "data", DATA_KEY, "sessions"),
    sessionId
  );

  try {
    await setDoc(sessionRef, {
      startedAt: serverTimestamp(),
      completedAt: null,
      totalScenarios: null,
      score: 0,
      mode,
      source: SOURCE,
    });
    return { id: sessionId };
  } catch (err) {
    console.error("[twin-tracks] failed to write session start:", err);
    return null;
  }
}

export interface WriteAttemptInput {
  sessionId: string;
  scenarioId: string;
  phraseId: string;
  correctTrack: "positive" | "negative";
  correctSlot: "introduce" | "explain" | "develop";
  wrongDropCount: number;
  revealed: boolean;
  timeToLockMs: number;
}

/**
 * Record a single phrase-lock event. Called when a phrase is correctly
 * placed in its target cell (either on first attempt or after wrong drops).
 *
 * Writes to:
 *   users/{uid}/data/twin-tracks/sessions/{sessionId}/attempts/{attemptId}
 *
 * Schema invariants enforced by Firestore rules:
 *   - source == "signal"
 *   - correctTrack ∈ {"positive", "negative"}
 *   - correctSlot ∈ {"introduce", "explain", "develop"}
 *   - wrongDropCount is int in [0, 3]
 *   - revealed == (wrongDropCount >= 3)
 *   - timeToLockMs is int >= 0
 *
 * Returns null in all cases. Errors are logged but not thrown.
 */
export async function writeAttempt(input: WriteAttemptInput): Promise<null> {
  const user = auth.currentUser;
  if (!user) {
    console.info(
      "[twin-tracks] no authenticated user; attempt not persisted"
    );
    return null;
  }

  const db = getFirestore(app);
  const attemptId = crypto.randomUUID();
  const attemptRef = doc(
    collection(
      db,
      "users",
      user.uid,
      "data",
      DATA_KEY,
      "sessions",
      input.sessionId,
      "attempts"
    ),
    attemptId
  );

  try {
    await setDoc(attemptRef, {
      scenarioId: input.scenarioId,
      phraseId: input.phraseId,
      correctTrack: input.correctTrack,
      correctSlot: input.correctSlot,
      wrongDropCount: input.wrongDropCount,
      revealed: input.revealed,
      timeToLockMs: input.timeToLockMs,
      attemptedAt: serverTimestamp(),
      source: SOURCE,
    });
  } catch (err) {
    console.error("[twin-tracks] failed to write attempt:", err);
  }

  return null;
}

export interface CompleteSessionInput {
  sessionId: string;
  score: number;
  totalScenarios: number;
}

/**
 * Mark a session as complete with its final score. Updates the session
 * document at:
 *   users/{uid}/data/twin-tracks/sessions/{sessionId}
 *
 * score is the count of "correct" outcomes (locked on first attempt with no
 * stuck-mitigation reveal). "with-help" outcomes do not count toward the
 * score per spec design intent.
 */
export async function completeSession(
  input: CompleteSessionInput
): Promise<null> {
  const user = auth.currentUser;
  if (!user) {
    console.info(
      "[twin-tracks] no authenticated user; session completion not persisted"
    );
    return null;
  }

  const db = getFirestore(app);
  const sessionRef = doc(
    collection(db, "users", user.uid, "data", DATA_KEY, "sessions"),
    input.sessionId
  );

  try {
    await updateDoc(sessionRef, {
      completedAt: serverTimestamp(),
      score: input.score,
      totalScenarios: input.totalScenarios,
    });
  } catch (err) {
    console.error(
      "[twin-tracks] failed to write session completion:",
      err
    );
  }

  return null;
}
