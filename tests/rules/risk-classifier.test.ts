// tests/rules/risk-classifier.test.ts
//
// Adversarial tests for the Risk Classifier Firestore security rules.
//
// Groups:
//   A. Student writes own data
//   C. Validation and immutability

import { describe, it, beforeAll, beforeEach, afterAll } from "vitest";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { readFileSync } from "node:fs";

const STUDENT_A_UID = "student-a";
const STUDENT_B_UID = "student-b";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-signal-rules",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

function validSessionData(overrides: Record<string, unknown> = {}) {
  return {
    startedAt: serverTimestamp(),
    completedAt: null,
    totalScenarios: null,
    score: 0,
    mode: "first-attempt",
    source: "signal",
    ...overrides,
  };
}

function validAttemptData(overrides: Record<string, unknown> = {}) {
  return {
    scenarioId: "uklaw-001",
    tierChosen: "data-protection",
    correctTier: "data-protection",
    isCorrect: true,
    timeToAnswerMs: 5000,
    viewedReasoning: true,
    attemptedAt: serverTimestamp(),
    source: "signal",
    ...overrides,
  };
}

const sessionPath = (uid: string, sessionId: string) =>
  `users/${uid}/data/risk-classifier/sessions/${sessionId}`;

const attemptPath = (uid: string, sessionId: string, attemptId: string) =>
  `users/${uid}/data/risk-classifier/sessions/${sessionId}/attempts/${attemptId}`;

// Group A: Student writes own data

describe("Group A: student writes own data", () => {
  it("A1: authenticated student writes a session under their own uid", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    await assertSucceeds(setDoc(ref, validSessionData()));
  });

  it("A2: authenticated student writes an attempt under their own session", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await setDoc(
        doc(adminCtx.firestore(), sessionPath(STUDENT_A_UID, "session-1")),
        validSessionData()
      );
    });
    const ref = doc(ctx, attemptPath(STUDENT_A_UID, "session-1", "attempt-1"));
    await assertSucceeds(setDoc(ref, validAttemptData()));
  });

  it("A3: authenticated student updates their own session with completedAt", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await setDoc(
        doc(adminCtx.firestore(), sessionPath(STUDENT_A_UID, "session-1")),
        validSessionData()
      );
    });
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    await assertSucceeds(
      updateDoc(ref, {
        completedAt: serverTimestamp(),
        score: 3,
        totalScenarios: 5,
      })
    );
  });

  it("A4: unauthenticated request writes a session under any uid", async () => {
    const ctx = testEnv.unauthenticatedContext().firestore();
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    await assertFails(setDoc(ref, validSessionData()));
  });

  it("A5: authenticated student writes a session under a different uid", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    const ref = doc(ctx, sessionPath(STUDENT_B_UID, "session-1"));
    await assertFails(setDoc(ref, validSessionData()));
  });

  it("A6: authenticated student writes an attempt under another student's session", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await setDoc(
        doc(adminCtx.firestore(), sessionPath(STUDENT_B_UID, "session-1")),
        validSessionData()
      );
    });
    const ref = doc(ctx, attemptPath(STUDENT_B_UID, "session-1", "attempt-1"));
    await assertFails(setDoc(ref, validAttemptData()));
  });
});

// Group C: Validation and immutability

describe("Group C: validation and immutability", () => {
  it("C1: session create with score != 0 is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    await assertFails(setDoc(ref, validSessionData({ score: 5 })));
  });

  it("C2: session create with non-null completedAt is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    await assertFails(
      setDoc(ref, validSessionData({ completedAt: serverTimestamp() }))
    );
  });

  it("C3: session create with non-null totalScenarios is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    await assertFails(
      setDoc(ref, validSessionData({ totalScenarios: 5 }))
    );
  });

  it("C4: session create with invalid mode is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    await assertFails(
      setDoc(ref, validSessionData({ mode: "invalid-mode" }))
    );
  });

  it("C5: session create with wrong source value is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    await assertFails(
      setDoc(ref, validSessionData({ source: "msm" }))
    );
  });

  it("C6: session create missing required field is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    const incomplete = {
      startedAt: serverTimestamp(),
      completedAt: null,
      totalScenarios: null,
      score: 0,
      source: "signal",
    };
    await assertFails(setDoc(ref, incomplete));
  });

  it("C7: session update changing mode is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await setDoc(
      doc(ctx, sessionPath(STUDENT_A_UID, "session-1")),
      validSessionData()
    );
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    await assertFails(
      updateDoc(ref, {
        mode: "challenge",
        totalScenarios: 5,
        score: 3,
      })
    );
  });

  it("C8: session update changing source is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await setDoc(
      doc(ctx, sessionPath(STUDENT_A_UID, "session-1")),
      validSessionData()
    );
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    await assertFails(
      updateDoc(ref, {
        source: "msm",
        totalScenarios: 5,
        score: 3,
      })
    );
  });

  it("C9: session update with score > totalScenarios is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await setDoc(
      doc(ctx, sessionPath(STUDENT_A_UID, "session-1")),
      validSessionData()
    );
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    await assertFails(
      updateDoc(ref, {
        totalScenarios: 5,
        score: 6,
      })
    );
  });

  it("C10: session update with totalScenarios out of range is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await setDoc(
      doc(ctx, sessionPath(STUDENT_A_UID, "session-1")),
      validSessionData()
    );
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    await assertFails(
      updateDoc(ref, {
        totalScenarios: 25,
        score: 10,
      })
    );
  });

  it("C11: session delete is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await setDoc(
      doc(ctx, sessionPath(STUDENT_A_UID, "session-1")),
      validSessionData()
    );
    const ref = doc(ctx, sessionPath(STUDENT_A_UID, "session-1"));
    await assertFails(deleteDoc(ref));
  });

  it("C12: attempt create with isCorrect mismatching tier choice is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await setDoc(
      doc(ctx, sessionPath(STUDENT_A_UID, "session-1")),
      validSessionData()
    );
    const ref = doc(ctx, attemptPath(STUDENT_A_UID, "session-1", "attempt-1"));
    await assertFails(
      setDoc(ref, validAttemptData({
        tierChosen: "data-protection",
        correctTier: "computer-misuse",
        isCorrect: true,
      }))
    );
  });

  it("C13: attempt create with wrong source value is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await setDoc(
      doc(ctx, sessionPath(STUDENT_A_UID, "session-1")),
      validSessionData()
    );
    const ref = doc(ctx, attemptPath(STUDENT_A_UID, "session-1", "attempt-1"));
    await assertFails(
      setDoc(ref, validAttemptData({ source: "msm" }))
    );
  });

  it("C14: attempt create missing required field is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await setDoc(
      doc(ctx, sessionPath(STUDENT_A_UID, "session-1")),
      validSessionData()
    );
    const ref = doc(ctx, attemptPath(STUDENT_A_UID, "session-1", "attempt-1"));
    const incomplete = {
      scenarioId: "uklaw-001",
      tierChosen: "data-protection",
      correctTier: "data-protection",
      isCorrect: true,
      timeToAnswerMs: 5000,
      attemptedAt: serverTimestamp(),
      source: "signal",
    };
    await assertFails(setDoc(ref, incomplete));
  });

  it("C15: attempt update is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await setDoc(
      doc(ctx, sessionPath(STUDENT_A_UID, "session-1")),
      validSessionData()
    );
    await setDoc(
      doc(ctx, attemptPath(STUDENT_A_UID, "session-1", "attempt-1")),
      validAttemptData()
    );
    const ref = doc(ctx, attemptPath(STUDENT_A_UID, "session-1", "attempt-1"));
    await assertFails(
      updateDoc(ref, { isCorrect: false })
    );
  });

  it("C16: attempt delete is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await setDoc(
      doc(ctx, sessionPath(STUDENT_A_UID, "session-1")),
      validSessionData()
    );
    await setDoc(
      doc(ctx, attemptPath(STUDENT_A_UID, "session-1", "attempt-1")),
      validAttemptData()
    );
    const ref = doc(ctx, attemptPath(STUDENT_A_UID, "session-1", "attempt-1"));
    await assertFails(deleteDoc(ref));
  });
});
