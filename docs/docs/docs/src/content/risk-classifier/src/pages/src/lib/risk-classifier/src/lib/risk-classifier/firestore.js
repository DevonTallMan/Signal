// src/lib/risk-classifier/firestore.js
//
// Firestore persistence for the Risk Classifier.
// Sprint 1 scope: startSession only. Sprint 2 adds writeAttempt and
// completeSession.
//
// Uses Signal's existing Firebase setup. `window.MSM_APP` is exposed by
// firebase-config.js and is the shared app instance. We resolve Firestore and
// Auth from that, rather than re-initialising.

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Start a Risk Classifier session for the current authenticated user.
 * Returns { id } if persistence succeeded, null if there is no authenticated
 * user (in which case the game runs in ephemeral mode).
 */
export async function startSession() {
  const app = typeof window !== "undefined" ? window.MSM_APP : null;
  if (!app) {
    console.warn(
      "[risk-classifier] window.MSM_APP not available; running without persistence"
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
      totalScenarios: 12, // matches v1 scope; revisit if we change scenario count
      score: 0,
      mode: "first-attempt",
    });
    return { id: sessionId };
  } catch (err) {
    console.error("[risk-classifier] failed to write session start:", err);
    return null;
  }
}

/**
 * Record a single classification attempt. Called once per scenario answered.
 * No-op if persistence isn't available.
 *
 * Sprint 2 implementation — stub here so the import graph is stable.
 */
export async function writeAttempt({
  sessionId,
  scenarioId,
  tierChosen,
  correctTier,
  timeToAnswerMs,
  viewedReasoning,
}) {
  console.log("[risk-classifier] writeAttempt (sprint 2 stub):", {
    sessionId,
    scenarioId,
    tierChosen,
    correctTier,
    timeToAnswerMs,
    viewedReasoning,
  });
  return null;
}

/**
 * Mark a session as complete with its final score.
 * Sprint 2 implementation — stub here so the import graph is stable.
 */
export async function completeSession({ sessionId, score }) {
  console.log("[risk-classifier] completeSession (sprint 2 stub):", {
    sessionId,
    score,
  });
  return null;
}
