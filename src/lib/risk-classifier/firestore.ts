// src/lib/risk-classifier/firestore.ts
//
// Firestore persistence for the Risk Classifier.
// Sprint 1 scope: startSession only. Sprint 2 adds writeAttempt and
// completeSession as real implementations.
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
import type { FirebaseApp } from "firebase/app";

declare global {
  interface Window {
    MSM_APP?: FirebaseApp;
  }
}

export interface SessionHandle {
  id: string;
}

/**
 * Start a Risk Classifier session for the current authenticated user.
 * Returns a SessionHandle if persistence succeeded, null if there is no
 * authenticated user (in which case the game runs in ephemeral mode).
 */
export async function startSession(): Promise<SessionHandle | null> {
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
      totalScenarios: null, // set by completeSession in sprint 2
      score: 0,
      mode: "first-attempt",
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
 * Record a single classification attempt. Sprint 2 implementation.
 * Defined as a stub here so the import graph is stable for Sprint 1.
 */
export async function writeAttempt(input: WriteAttemptInput): Promise<null> {
  console.log("[risk-classifier] writeAttempt (sprint 2 stub):", input);
  return null;
}

export interface CompleteSessionInput {
  sessionId: string;
  score: number;
}

/**
 * Mark a session as complete with its final score. Sprint 2 implementation.
 * Defined as a stub here so the import graph is stable for Sprint 1.
 */
export async function completeSession(input: CompleteSessionInput): Promise<null> {
  console.log("[risk-classifier] completeSession (sprint 2 stub):", input);
  return null;
}
