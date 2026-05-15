// tests/rules/drill-scheduler.test.ts
//
// Adversarial tests for the Sprint 6 spaced-return scheduler extension
// of the drillRatings Firestore security rules.
//
// The rules block continues to require the five legacy fields (topicId,
// termId, outcome, ratedAt, source) so production saveDrillRating writes
// keep passing. Five new scheduler fields are validated only when
// present, so a legacy write that omits them still succeeds.
//
// Groups:
//   A. Ownership and authentication
//   B. Legacy five-field writes still pass
//   C. Schema enforcement on new scheduler fields
//   D. History array bounds
//   E. nextReviewDate future-window cap
//   F. Combined-write happy path
//   G. Read paths (legacy and extended documents)
//   H. Delete is denied

import { describe, it, beforeAll, beforeEach, afterAll } from "vitest";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { readFileSync } from "node:fs";

const STUDENT_A_UID = "student-a";
const STUDENT_B_UID = "student-b";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-signal-drill-scheduler-rules",
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

const COMPOSITE_ID = "4-1-1-data-protection__dpa-2018";

const drillPath = (uid: string, id = COMPOSITE_ID) =>
  `users/${uid}/drillRatings/${id}`;

function legacyData(overrides: Record<string, unknown> = {}) {
  return {
    topicId: "4-1-1-data-protection",
    termId: "dpa-2018",
    outcome: "got",
    ratedAt: serverTimestamp(),
    source: "signal",
    ...overrides,
  };
}

function daysFromNow(n: number): Timestamp {
  return Timestamp.fromDate(new Date(Date.now() + n * 24 * 60 * 60 * 1000));
}

function extendedData(overrides: Record<string, unknown> = {}) {
  return {
    ...legacyData(),
    boxLevel: 0,
    nextReviewDate: daysFromNow(1),
    firstRatedAt: Timestamp.now(),
    lastRatedAt: Timestamp.now(),
    history: [{ outcome: "got", at: Timestamp.now() }],
    ...overrides,
  };
}

// Group A: ownership and authentication

describe("Group A: ownership and authentication", () => {
  it("A1: authenticated student writes legacy drill rating under own uid", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), legacyData())
    );
  });

  it("A2: authenticated student writes extended drill rating under own uid", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData())
    );
  });

  it("A3: unauthenticated write is denied", async () => {
    const ctx = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), legacyData())
    );
  });

  it("A4: cross-user write is denied", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_B_UID)), legacyData())
    );
  });
});

// Group B: legacy five-field writes still pass

describe("Group B: legacy five-field writes still pass", () => {
  it("B1: legacy 'got' rating accepted", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), legacyData({ outcome: "got" }))
    );
  });

  it("B2: legacy 'miss' rating accepted", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), legacyData({ outcome: "miss" }))
    );
  });

  it("B3: legacy write rejected when outcome is an unknown enum value", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), legacyData({ outcome: "skipped" }))
    );
  });

  it("B4: legacy write rejected when source is not 'signal'", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), legacyData({ source: "msm-legacy" }))
    );
  });

  it("B5: legacy write rejected when a required field is missing", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    const data = legacyData() as Record<string, unknown>;
    delete data.termId;
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), data)
    );
  });
});

// Group C: schema enforcement on new scheduler fields

describe("Group C: schema enforcement on new scheduler fields", () => {
  it("C1: boxLevel below 0 rejected", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ boxLevel: -1 }))
    );
  });

  it("C2: boxLevel above 4 rejected", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ boxLevel: 5 }))
    );
  });

  it("C3: boxLevel non-int rejected", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ boxLevel: "0" }))
    );
  });

  it("C4: boxLevel boundary 0 accepted", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ boxLevel: 0 }))
    );
  });

  it("C5: boxLevel boundary 4 accepted", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ boxLevel: 4 }))
    );
  });

  it("C6: firstRatedAt non-timestamp rejected", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ firstRatedAt: "not-a-timestamp" }))
    );
  });

  it("C7: lastRatedAt non-timestamp rejected", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ lastRatedAt: 0 }))
    );
  });
});

// Group D: history array bounds

describe("Group D: history array bounds", () => {
  it("D1: history with 10 entries accepted", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    const ten = Array.from({ length: 10 }, () => ({ outcome: "got", at: Timestamp.now() }));
    await assertSucceeds(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ history: ten }))
    );
  });

  it("D2: history with 11 entries rejected", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    const eleven = Array.from({ length: 11 }, () => ({ outcome: "got", at: Timestamp.now() }));
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ history: eleven }))
    );
  });

  it("D3: history empty list accepted", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ history: [] }))
    );
  });

  it("D4: history non-list rejected", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ history: { outcome: "got" } }))
    );
  });
});

// Group E: nextReviewDate future-window cap

describe("Group E: nextReviewDate future-window cap", () => {
  it("E1: nextReviewDate 30 days in the future accepted", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ nextReviewDate: daysFromNow(30) }))
    );
  });

  it("E2: nextReviewDate 90 days in the future rejected", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ nextReviewDate: daysFromNow(90) }))
    );
  });

  it("E3: nextReviewDate non-timestamp rejected", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData({ nextReviewDate: "tomorrow" }))
    );
  });
});

// Group F: combined-write happy path

describe("Group F: combined-write happy path", () => {
  it("F1: full extended document with all new fields accepted", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData())
    );
  });

  it("F2: update from legacy to extended document accepted", async () => {
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), legacyData())
    );
    await assertSucceeds(
      setDoc(doc(ctx, drillPath(STUDENT_A_UID)), extendedData())
    );
  });
});

// Group G: read paths

describe("Group G: read paths", () => {
  it("G1: owner reads own legacy document", async () => {
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await setDoc(
        doc(adminCtx.firestore(), drillPath(STUDENT_A_UID)),
        legacyData()
      );
    });
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(getDoc(doc(ctx, drillPath(STUDENT_A_UID))));
  });

  it("G2: owner reads own extended document", async () => {
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await setDoc(
        doc(adminCtx.firestore(), drillPath(STUDENT_A_UID)),
        extendedData()
      );
    });
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertSucceeds(getDoc(doc(ctx, drillPath(STUDENT_A_UID))));
  });

  it("G3: cross-user read denied", async () => {
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await setDoc(
        doc(adminCtx.firestore(), drillPath(STUDENT_A_UID)),
        legacyData()
      );
    });
    const ctx = testEnv.authenticatedContext(STUDENT_B_UID).firestore();
    await assertFails(getDoc(doc(ctx, drillPath(STUDENT_A_UID))));
  });
});

// Group H: delete is denied

describe("Group H: delete is denied", () => {
  it("H1: owner cannot delete their own drill rating", async () => {
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await setDoc(
        doc(adminCtx.firestore(), drillPath(STUDENT_A_UID)),
        legacyData()
      );
    });
    const ctx = testEnv.authenticatedContext(STUDENT_A_UID).firestore();
    await assertFails(deleteDoc(doc(ctx, drillPath(STUDENT_A_UID))));
  });
});
