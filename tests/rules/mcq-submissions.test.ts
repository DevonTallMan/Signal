// tests/rules/mcq-submissions.test.ts
//
// Adversarial tests for the Sprint 7B Inc 7B.0 mcqSubmissions
// Firestore rules block.
//
// Schema (per docs/sprint-7b-scope.md §3.3):
//   topicId        string
//   questionId     string
//   selectedIndex  int 0..10
//   correctIndex   int 0..10
//   isCorrect      bool (must equal selectedIndex == correctIndex)
//   submittedAt    timestamp
//   source         'signal'
//
// Boundaries:
//   - Student-only on read and write
//   - Teachers explicitly NOT granted cross-user read (v1; mirrors
//     the NEI prose boundary at /submissions)
//   - Upsert: create and update both allowed under the same predicates
//   - Delete denied
//
// Groups:
//   A. Ownership and authentication
//   B. Required-field enforcement
//   C. Type and bound enforcement
//   D. isCorrect derivation invariant
//   E. Upsert semantics
//   F. Read paths
//   G. Teacher cross-user read denied
//   H. Delete denied

import { describe, it, beforeAll, beforeEach, afterAll } from "vitest";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { readFileSync } from "node:fs";

const STUDENT_A_UID = "student-a";
const STUDENT_B_UID = "student-b";
const TEACHER_UID = "teacher-uid-1";
const TEACHER_EMAIL = "teacher-pilot-placeholder@example.com";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-signal-mcq-rules",
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

const COMPOSITE_ID = "4-1-1-data-protection__411-mcq-01";

const mcqPath = (uid: string, id = COMPOSITE_ID) =>
  `users/${uid}/mcqSubmissions/${id}`;

function validData(overrides: Record<string, unknown> = {}) {
  return {
    topicId: "4-1-1-data-protection",
    questionId: "411-mcq-01",
    selectedIndex: 1,
    correctIndex: 1,
    isCorrect: true,
    submittedAt: serverTimestamp(),
    source: "signal",
    ...overrides,
  };
}

// Group A: ownership and authentication

describe("A: ownership and authentication", () => {
  it("A1: authenticated student writes under own uid", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(setDoc(doc(ctx, mcqPath(STUDENT_A_UID)), validData()));
  });

  it("A2: unauthenticated write is denied", async () => {
    const ctx = testEnv.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(ctx, mcqPath(STUDENT_A_UID)), validData()));
  });

  it("A3: cross-user write is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(setDoc(doc(ctx, mcqPath(STUDENT_B_UID)), validData()));
  });
});

// Group B: required-field enforcement

describe("B: required-field enforcement", () => {
  const requiredFields = [
    "topicId",
    "questionId",
    "selectedIndex",
    "correctIndex",
    "isCorrect",
    "submittedAt",
    "source",
  ];

  for (const field of requiredFields) {
    it(`B.${field}: write rejected when "${field}" is missing`, async () => {
      const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
      const data = validData() as Record<string, unknown>;
      delete data[field];
      await assertFails(setDoc(doc(ctx, mcqPath(STUDENT_A_UID)), data));
    });
  }
});

// Group C: type and bound enforcement

describe("C: type and bound enforcement", () => {
  it("C1: source must be 'signal'", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, mcqPath(STUDENT_A_UID)), validData({ source: "external" })),
    );
  });

  it("C2: selectedIndex negative is rejected", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(
        doc(ctx, mcqPath(STUDENT_A_UID)),
        validData({ selectedIndex: -1, correctIndex: -1, isCorrect: true }),
      ),
    );
  });

  it("C3: selectedIndex above 10 is rejected", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(
        doc(ctx, mcqPath(STUDENT_A_UID)),
        validData({ selectedIndex: 11, correctIndex: 11, isCorrect: true }),
      ),
    );
  });

  it("C4: topicId must be a string", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, mcqPath(STUDENT_A_UID)), validData({ topicId: 42 })),
    );
  });

  it("C5: isCorrect must be a boolean", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, mcqPath(STUDENT_A_UID)), validData({ isCorrect: "yes" })),
    );
  });
});

// Group D: isCorrect derivation invariant

describe("D: isCorrect derivation invariant", () => {
  it("D1: matching indexes with isCorrect=true passes", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(
      setDoc(
        doc(ctx, mcqPath(STUDENT_A_UID)),
        validData({ selectedIndex: 2, correctIndex: 2, isCorrect: true }),
      ),
    );
  });

  it("D2: non-matching indexes with isCorrect=false passes", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(
      setDoc(
        doc(ctx, mcqPath(STUDENT_A_UID)),
        validData({ selectedIndex: 0, correctIndex: 2, isCorrect: false }),
      ),
    );
  });

  it("D3: matching indexes with isCorrect=false is REJECTED (lying about correctness)", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(
        doc(ctx, mcqPath(STUDENT_A_UID)),
        validData({ selectedIndex: 2, correctIndex: 2, isCorrect: false }),
      ),
    );
  });

  it("D4: non-matching indexes with isCorrect=true is REJECTED (lying about correctness)", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(
        doc(ctx, mcqPath(STUDENT_A_UID)),
        validData({ selectedIndex: 0, correctIndex: 2, isCorrect: true }),
      ),
    );
  });
});

// Group E: upsert semantics

describe("E: upsert semantics", () => {
  it("E1: re-writing the same path with valid data succeeds (upsert)", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(
      setDoc(
        doc(ctx, mcqPath(STUDENT_A_UID)),
        validData({ selectedIndex: 0, correctIndex: 1, isCorrect: false }),
      ),
    );
    // Second write — same path, different answer.
    await assertSucceeds(
      setDoc(
        doc(ctx, mcqPath(STUDENT_A_UID)),
        validData({ selectedIndex: 1, correctIndex: 1, isCorrect: true }),
      ),
    );
  });
});

// Group F: read paths

describe("F: read paths", () => {
  it("F1: student reads own submission", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), mcqPath(STUDENT_A_UID)), validData());
    });
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(getDoc(doc(ctx, mcqPath(STUDENT_A_UID))));
  });

  it("F2: another student cannot read", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), mcqPath(STUDENT_A_UID)), validData());
    });
    const ctx = testEnv.authenticatedContext(STUDENT_B_UID).firestore();
    await assertFails(getDoc(doc(ctx, mcqPath(STUDENT_A_UID))));
  });
});

// Group G: teacher cross-user read denied (the v1 boundary)

describe("G: teacher cross-user read denied", () => {
  it("G1: allowlisted teacher CANNOT read another student's MCQ submission", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), mcqPath(STUDENT_A_UID)), validData());
    });
    const teacherCtx = testEnv
      .authenticatedContext(TEACHER_UID, { email: TEACHER_EMAIL })
      .firestore();
    await assertFails(getDoc(doc(teacherCtx, mcqPath(STUDENT_A_UID))));
  });
});

// Group H: delete denied

describe("H: delete denied", () => {
  it("H1: even the owning student cannot delete a submission", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), mcqPath(STUDENT_A_UID)), validData());
    });
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(deleteDoc(doc(ctx, mcqPath(STUDENT_A_UID))));
  });
});
