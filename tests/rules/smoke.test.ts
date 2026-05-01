// tests/rules/smoke.test.ts
//
// Smoke test for the Firestore rules harness. Verifies the emulator
// is reachable and that the test environment correctly distinguishes
// allowed from denied operations.

import { describe, it, beforeAll, afterAll } from "vitest";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, setDoc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-signal-smoke",
    firestore: {
      rules: `
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /allowed/{docId} {
              allow read, write: if true;
            }
            match /denied/{docId} {
              allow read, write: if false;
            }
          }
        }
      `,
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("smoke test", () => {
  it("allows writes to /allowed/", async () => {
    const ctx = testEnv.unauthenticatedContext();
    const ref = doc(ctx.firestore(), "allowed", "doc1");
    await assertSucceeds(setDoc(ref, { value: "yes" }));
  });

  it("denies writes to /denied/", async () => {
    const ctx = testEnv.unauthenticatedContext();
    const ref = doc(ctx.firestore(), "denied", "doc1");
    await assertFails(setDoc(ref, { value: "no" }));
  });
});
