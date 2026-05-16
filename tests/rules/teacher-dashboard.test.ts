// tests/rules/teacher-dashboard.test.ts
//
// Adversarial tests for the Sprint 7A Inc 7.0 teacher allowlist
// extension to the Firestore security rules.
//
// The teacher allowlist grants cross-user READ on a strict subset of
// student data: profile doc, drillRatings, activity sessions and
// activity attempts. Teachers do NOT get read access on
// users/{uid}/submissions (NEI prose body) or write access anywhere.
// All student rules continue to work unchanged.
//
// Groups:
//   T1. Teacher reads on drillRatings (cross-user)
//   T2. Teacher reads on user profile doc
//   T3. Teacher reads on activity sessions and attempts
//   T4. Submissions prose-body boundary (the v1 security line)
//   T5. Non-teacher users still cannot read across users
//   T6. Student writes unaffected (no regression)
//   T7. Teachers cannot write anywhere

import { describe, it, beforeAll, beforeEach, afterAll } from "vitest";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { readFileSync } from "node:fs";

const STUDENT_A_UID = "student-a";
const STUDENT_B_UID = "student-b";
const TEACHER_UID = "teacher-uid-1";
const TEACHER_EMAIL = "teacher-pilot-placeholder@example.com";
const NON_TEACHER_UID = "non-teacher-uid-1";
const NON_TEACHER_EMAIL = "not-on-allowlist@example.com";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-signal-teacher-dashboard-rules",
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

const teacherCtx = () =>
  testEnv.authenticatedContext(TEACHER_UID, { email: TEACHER_EMAIL });

const nonTeacherCtx = () =>
  testEnv.authenticatedContext(NON_TEACHER_UID, { email: NON_TEACHER_EMAIL });

const studentCtx = (uid: string) => testEnv.authenticatedContext(uid);

const drillPath = (uid: string) =>
  `users/${uid}/drillRatings/4-1-1-data-protection__dpa-2018`;

const submissionPath = (uid: string, id = "sub-1") =>
  `users/${uid}/submissions/${id}`;

const sessionPath = (uid: string, dataKey: string, id = "session-1") =>
  `users/${uid}/data/${dataKey}/sessions/${id}`;

const attemptPath = (
  uid: string,
  dataKey: string,
  sessionId = "session-1",
  attemptId = "attempt-1"
) => `users/${uid}/data/${dataKey}/sessions/${sessionId}/attempts/${attemptId}`;

async function seedDrillRatingFor(uid: string) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), drillPath(uid)), {
      topicId: "4-1-1-data-protection",
      termId: "dpa-2018",
      outcome: "got",
      ratedAt: serverTimestamp(),
      source: "signal",
    });
  });
}

async function seedSubmissionFor(uid: string) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), submissionPath(uid)), {
      topicId: "4-1-1-data-protection",
      questionId: "411-nei-01",
      answerText: "Confidential prose body that teachers must not read.",
      submittedAt: serverTimestamp(),
      marking: { total: 4 },
      source: "signal",
    });
  });
}

async function seedSessionFor(uid: string, dataKey: string) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), sessionPath(uid, dataKey)), {
      startedAt: serverTimestamp(),
      completedAt: null,
      totalScenarios: null,
      score: 0,
      mode: "first-attempt",
      source: "signal",
    });
  });
}

async function seedAttemptFor(uid: string, dataKey: string) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), attemptPath(uid, dataKey)), {
      scenarioId: "scenario-1",
      tierChosen: "data-protection",
      correctTier: "data-protection",
      isCorrect: true,
      timeToAnswerMs: 1234,
      viewedReasoning: false,
      attemptedAt: serverTimestamp(),
      source: "signal",
    });
  });
}

async function seedUserProfile(uid: string) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `users/${uid}`), {
      displayName: `Student ${uid}`,
    });
  });
}

// T1: Teacher reads on drillRatings (cross-user)

describe("T1: teacher reads on drillRatings", () => {
  it("T1.1: allowlisted teacher can read another student's drill rating", async () => {
    await seedDrillRatingFor(STUDENT_A_UID);
    await assertSucceeds(
      getDoc(doc(teacherCtx().firestore(), drillPath(STUDENT_A_UID)))
    );
  });

  it("T1.2: allowlisted teacher can read drill ratings for any student", async () => {
    await seedDrillRatingFor(STUDENT_B_UID);
    await assertSucceeds(
      getDoc(doc(teacherCtx().firestore(), drillPath(STUDENT_B_UID)))
    );
  });
});

// T2: Teacher reads on user profile doc

describe("T2: teacher reads on user profile", () => {
  it("T2.1: allowlisted teacher can read another student's profile", async () => {
    await seedUserProfile(STUDENT_A_UID);
    await assertSucceeds(
      getDoc(doc(teacherCtx().firestore(), `users/${STUDENT_A_UID}`))
    );
  });
});

// T3: Teacher reads on activity sessions and attempts

describe("T3: teacher reads on activity sessions and attempts", () => {
  it("T3.1: teacher reads a risk-classifier session of another student", async () => {
    await seedSessionFor(STUDENT_A_UID, "risk-classifier");
    await assertSucceeds(
      getDoc(
        doc(teacherCtx().firestore(), sessionPath(STUDENT_A_UID, "risk-classifier"))
      )
    );
  });

  it("T3.2: teacher reads a sort-and-match session of another student", async () => {
    await seedSessionFor(STUDENT_A_UID, "sort-and-match");
    await assertSucceeds(
      getDoc(
        doc(teacherCtx().firestore(), sessionPath(STUDENT_A_UID, "sort-and-match"))
      )
    );
  });

  it("T3.3: teacher reads a twin-tracks session of another student", async () => {
    await seedSessionFor(STUDENT_A_UID, "twin-tracks");
    await assertSucceeds(
      getDoc(
        doc(teacherCtx().firestore(), sessionPath(STUDENT_A_UID, "twin-tracks"))
      )
    );
  });

  it("T3.4: teacher reads a risk-classifier attempt of another student", async () => {
    await seedAttemptFor(STUDENT_A_UID, "risk-classifier");
    await assertSucceeds(
      getDoc(
        doc(teacherCtx().firestore(), attemptPath(STUDENT_A_UID, "risk-classifier"))
      )
    );
  });

  it("T3.5: teacher cannot read sessions under an unknown dataKey", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), sessionPath(STUDENT_A_UID, "rogue-key")), {
        startedAt: serverTimestamp(),
        completedAt: null,
        totalScenarios: null,
        score: 0,
        mode: "first-attempt",
        source: "signal",
      });
    });
    await assertFails(
      getDoc(
        doc(teacherCtx().firestore(), sessionPath(STUDENT_A_UID, "rogue-key"))
      )
    );
  });
});

// T4: Submissions prose-body boundary (the v1 security line)

describe("T4: submissions prose-body boundary", () => {
  it("T4.1: allowlisted teacher CANNOT read another student's submission doc", async () => {
    await seedSubmissionFor(STUDENT_A_UID);
    await assertFails(
      getDoc(doc(teacherCtx().firestore(), submissionPath(STUDENT_A_UID)))
    );
  });

  it("T4.2: teacher cannot read submissions even with a teacher email and exact UID match attempt", async () => {
    await seedSubmissionFor(STUDENT_B_UID);
    await assertFails(
      getDoc(doc(teacherCtx().firestore(), submissionPath(STUDENT_B_UID)))
    );
  });
});

// T5: Non-teacher users still cannot read across users

describe("T5: non-teacher cross-user reads denied", () => {
  it("T5.1: unallowlisted user cannot read another student's drill rating", async () => {
    await seedDrillRatingFor(STUDENT_A_UID);
    await assertFails(
      getDoc(doc(nonTeacherCtx().firestore(), drillPath(STUDENT_A_UID)))
    );
  });

  it("T5.2: unallowlisted user cannot read another student's profile", async () => {
    await seedUserProfile(STUDENT_A_UID);
    await assertFails(
      getDoc(doc(nonTeacherCtx().firestore(), `users/${STUDENT_A_UID}`))
    );
  });

  it("T5.3: unallowlisted user cannot read another student's session", async () => {
    await seedSessionFor(STUDENT_A_UID, "risk-classifier");
    await assertFails(
      getDoc(
        doc(nonTeacherCtx().firestore(), sessionPath(STUDENT_A_UID, "risk-classifier"))
      )
    );
  });

  it("T5.4: a regular student cannot read another student's drill rating", async () => {
    await seedDrillRatingFor(STUDENT_A_UID);
    await assertFails(
      getDoc(doc(studentCtx(STUDENT_B_UID).firestore(), drillPath(STUDENT_A_UID)))
    );
  });
});

// T6: Student writes unaffected (no regression)

describe("T6: student writes unaffected by allowlist changes", () => {
  it("T6.1: student writes own drill rating", async () => {
    await assertSucceeds(
      setDoc(doc(studentCtx(STUDENT_A_UID).firestore(), drillPath(STUDENT_A_UID)), {
        topicId: "4-1-1-data-protection",
        termId: "dpa-2018",
        outcome: "got",
        ratedAt: serverTimestamp(),
        source: "signal",
      })
    );
  });

  it("T6.2: student writes own submission", async () => {
    await assertSucceeds(
      setDoc(doc(studentCtx(STUDENT_A_UID).firestore(), submissionPath(STUDENT_A_UID)), {
        topicId: "4-1-1-data-protection",
        questionId: "411-nei-01",
        answerText: "My answer goes here.",
        submittedAt: serverTimestamp(),
        marking: { total: 4 },
        source: "signal",
      })
    );
  });

  it("T6.3: student reads own drill rating", async () => {
    await seedDrillRatingFor(STUDENT_A_UID);
    await assertSucceeds(
      getDoc(
        doc(studentCtx(STUDENT_A_UID).firestore(), drillPath(STUDENT_A_UID))
      )
    );
  });

  it("T6.4: student reads own submission", async () => {
    await seedSubmissionFor(STUDENT_A_UID);
    await assertSucceeds(
      getDoc(
        doc(studentCtx(STUDENT_A_UID).firestore(), submissionPath(STUDENT_A_UID))
      )
    );
  });
});

// T7: Teachers cannot write anywhere

describe("T7: teachers have no write access", () => {
  it("T7.1: teacher cannot create another student's drill rating", async () => {
    await assertFails(
      setDoc(doc(teacherCtx().firestore(), drillPath(STUDENT_A_UID)), {
        topicId: "4-1-1-data-protection",
        termId: "dpa-2018",
        outcome: "got",
        ratedAt: serverTimestamp(),
        source: "signal",
      })
    );
  });

  it("T7.2: teacher cannot create another student's submission", async () => {
    await assertFails(
      setDoc(doc(teacherCtx().firestore(), submissionPath(STUDENT_A_UID)), {
        topicId: "4-1-1-data-protection",
        questionId: "411-nei-01",
        answerText: "Teacher writing on behalf of student.",
        submittedAt: serverTimestamp(),
        marking: { total: 4 },
        source: "signal",
      })
    );
  });

  it("T7.3: teacher cannot create another student's session", async () => {
    await assertFails(
      setDoc(
        doc(teacherCtx().firestore(), sessionPath(STUDENT_A_UID, "risk-classifier")),
        {
          startedAt: serverTimestamp(),
          completedAt: null,
          totalScenarios: null,
          score: 0,
          mode: "first-attempt",
          source: "signal",
        }
      )
    );
  });

  it("T7.4: teacher cannot create their own drill rating using teacher allowlist privileges", async () => {
    // The teacher account is just an authenticated user from a write
    // perspective. They can only write under their own UID, with the
    // same schema constraints as any student. They cannot use the
    // teacher allowlist to escalate write privileges.
    await assertSucceeds(
      setDoc(
        doc(teacherCtx().firestore(), `users/${TEACHER_UID}/drillRatings/test-1`),
        {
          topicId: "4-1-1-data-protection",
          termId: "dpa-2018",
          outcome: "got",
          ratedAt: serverTimestamp(),
          source: "signal",
        }
      )
    );
    // But not under any other user's path:
    await assertFails(
      setDoc(doc(teacherCtx().firestore(), drillPath(STUDENT_B_UID)), {
        topicId: "4-1-1-data-protection",
        termId: "dpa-2018",
        outcome: "got",
        ratedAt: serverTimestamp(),
        source: "signal",
      })
    );
  });
});
