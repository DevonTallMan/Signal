// src/lib/sort-and-match/firestore.ts
//
// Firestore persistence for Sort & Match.
// Sprint 3 Increment 3.5: startSession, writeAttempt, completeSession.
//
// Mirrors the pattern of src/lib/risk-classifier/firestore.ts:
//   - Uses module imports from firebase.ts, NOT the legacy window.MSM_APP pattern
//   - Returns null if there is no authenticated user (graceful ephemeral mode)
//   - Errors are logged but never thrown; persistence failure does not break UX
//
// IMPORTANT — silent-failure pattern: When a Firestore write fails (auth missing,
// network down, rules deny, etc.) the user-facing UI continues as if everything
// worked. This matches the Risk Classifier pattern by design — UX continuity
// is prioritised over data completeness. The trade-off is that pilot data may
// have gaps that look like normal completions. Memory entry on
// "if (!app) return null" silent-failure pattern flags this as recurring risk.
// Mitigation in this file: every failure path logs via console.error/info with
// the [sort-and-match] tag so dropped writes can be diagnosed from browser logs.

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
const DATA_KEY = "sort-and-match" as const;

/**
 * Start a Sort & Match session for the current authenticated user.
 * Returns a SessionHandle if persistence succeeded, null if there is no
 * authenticated user (in which case the activity runs in ephemeral mode).
 */
export async function startSession(
  mode: SessionMode = "first-attempt"
): Promise<SessionHandle | null> {
  const user = auth.currentUser;
  if (!user) {
    console.info(
      "[sort-and-match] no authenticated user; running without persistence"
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
    console.error("[sort-and-match] failed to write session start:", err);
    return null;
  }
}

export interface WriteAttemptInput {
  sessionId: string;
  scenarioId: string;
  attemptNumber: number;
  placements: Record<string, string>;
  correctCount: number;
  totalPhrases: number;
  timeToCheckMs: number;
}

/**
 * Record a single Check-click attempt within a scenario. Fires on each click
 * of the "Check answers" button regardless of outcome.
 *
 * Writes to:
 *   users/{uid}/data/sort-and-match/sessions/{sessionId}/attempts/{attemptId}
 *
 * Returns null in all cases. Errors are logged but not thrown; a Firestore
 * failure does not break the user-facing experience.
 */
export async function writeAttempt(input: WriteAttemptInput): Promise<null> {
  const user = auth.currentUser;
  if (!user) {
    console.info(
      "[sort-and-match] no authenticated user; attempt not persisted"
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
      attemptNumber: input.attemptNumber,
      placements: input.placements,
      isCorrect: input.correctCount === input.totalPhrases,
      correctCount: input.correctCount,
      totalPhrases: input.totalPhrases,
      timeToCheckMs: input.timeToCheckMs,
      attemptedAt: serverTimestamp(),
      source: SOURCE,
    });
  } catch (err) {
    console.error("[sort-and-match] failed to write attempt:", err);
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
 *   users/{uid}/data/sort-and-match/sessions/{sessionId}
 * Sets completedAt to serverTimestamp, score to the final correct count
 * (correct-on-attempt outcomes only; with-help outcomes do not count), and
 * totalScenarios to the count served in this session.
 */
export async function completeSession(
  input: CompleteSessionInput
): Promise<null> {
  const user = auth.currentUser;
  if (!user) {
    console.info(
      "[sort-and-match] no authenticated user; session completion not persisted"
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
      "[sort-and-match] failed to write session completion:",
      err
    );
  }

  return null;
}
