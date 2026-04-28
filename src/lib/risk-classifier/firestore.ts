// src/lib/risk-classifier/firestore.ts
//
// Firestore persistence for the Risk Classifier.
// Sprint 1 scope: startSession.
// Sprint 2 Increment 4: writeAttempt implemented.
// Sprint 2 Increment 5: completeSession implemented.
//
// Uses Signal's existing Firebase setup. `window.MSM_APP` is exposed by
// firebase-config.js and is the shared app instance. We resolve Firestore and
// Auth from that, rather than re-initialising.

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import type { FirebaseApp } from "firebase/app";

declare global {
  interface Window {
    MSM_APP?: FirebaseApp;
  }
}

export interface SessionHandle {
  id: string;
}

export type SessionMode = "first-attempt" | "replay-wrong" | "challenge";

/**
 * Start a Risk Classifier session for the current authenticated user.
 * Returns a SessionHandle if persistence succeeded, null if there is no
 * authenticated user (in which case the game runs in ephemeral mode).
 */
export async function startSession(
  mode: SessionMode = "first-attempt"
): Promise<SessionHandle | null> {
  const app = window.MSM_APP;
  if (!app) {
    console.info(
      "[risk-classifier] Firebase app not initialised; running without persistence"
    );
    return null;
  }

  const auth = getAuth(app);
  const user = auth.currentUser;
  if (!user) {
    console.info(
      "[risk-classifier] no authenticated user; running without persistence"
    );
    return null;
  }

  const db = getFirestore(app);
  const sessionId = crypto.randomUUID();
  const sessionRef = doc(
    collection(db, "users", user.uid, "data", "risk-classifier", "sessions"),
    sessionId
  );

  try {
    await setDoc(sessionRef, {
      startedAt: serverTimestamp(),
      completedAt: null,
      totalScenarios: null,
      score: 0,
      mode,
    });
    return { id: sessionId };
  } catch (err) {
    console.error("[risk-classifier] failed to write session start:", err);
    return null;
  }
}

export interface WriteAttemptInput {
  sessionId: string;
  scenarioId: string;
  tierChosen: string;
  correctTier: string;
  timeToAnswerMs: number;
  viewedReasoning: boolean;
}

/**
 * Record a single classification attempt. Sprint 2 Increment 4 implementation.
 *
 * Writes to:
 *   users/{uid}/data/risk-classifier/sessions/{sessionId}/attempts/{attemptId}
 *
 * Returns null in all cases. Errors are logged but not thrown, so a Firestore
 * failure does not break the user-facing experience.
 */
export async function writeAttempt(input: WriteAttemptInput): Promise<null> {
  const app = window.MSM_APP;
  if (!app) {
    console.info(
      "[risk-classifier] Firebase app not initialised; attempt not persisted"
    );
    return null;
  }

  const auth = getAuth(app);
  const user = auth.currentUser;
  if (!user) {
    console.info(
      "[risk-classifier] no authenticated user; attempt not persisted"
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
      "risk-classifier",
      "sessions",
      input.sessionId,
      "attempts"
    ),
    attemptId
  );

  try {
    await setDoc(attemptRef, {
      scenarioId: input.scenarioId,
      tierChosen: input.tierChosen,
      correctTier: input.correctTier,
      isCorrect: input.tierChosen === input.correctTier,
      timeToAnswerMs: input.timeToAnswerMs,
      viewedReasoning: input.viewedReasoning,
      attemptedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[risk-classifier] failed to write attempt:", err);
  }

  return null;
}

export interface CompleteSessionInput {
  sessionId: string;
  score: number;
  totalScenarios: number;
}

/**
 * Mark a session as complete with its final score. Sprint 2 Increment 5
 * implementation. Updates the session document at:
 *   users/{uid}/data/risk-classifier/sessions/{sessionId}
 * Sets completedAt to serverTimestamp, score to the final correct count,
 * and totalScenarios to the count served in this session.
 */
export async function completeSession(
  input: CompleteSessionInput
): Promise<null> {
  const app = window.MSM_APP;
  if (!app) {
    console.info(
      "[risk-classifier] Firebase app not initialised; session completion not persisted"
    );
    return null;
  }

  const auth = getAuth(app);
  const user = auth.currentUser;
  if (!user) {
    console.info(
      "[risk-classifier] no authenticated user; session completion not persisted"
    );
    return null;
  }

  const db = getFirestore(app);
  const sessionRef = doc(
    collection(db, "users", user.uid, "data", "risk-classifier", "sessions"),
    input.sessionId
  );

  try {
    await updateDoc(sessionRef, {
      completedAt: serverTimestamp(),
      score: input.score,
      totalScenarios: input.totalScenarios,
    });
  } catch (err) {
    console.error("[risk-classifier] failed to write session completion:", err);
  }

  return null;
}

