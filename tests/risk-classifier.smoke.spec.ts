// tests/risk-classifier.smoke.spec.ts
//
// Smoke test for the Risk Classifier session loop. Verifies that an
// authenticated user can start a session, classify one scenario
// correctly, and advance to the next. Does NOT complete the full
// session; that's the territory of the Session 2 full-session tests.
//
// Types are inlined rather than imported from src/ to keep the test
// independent of the project's tsconfig include paths. If the testApi
// shape changes, the inlined types will drift and the test will fail
// at the page.evaluate boundary, which is the desired signal.

import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";

type Tier =
  | "data-protection"
  | "computer-misuse"
  | "equality"
  | "intellectual-property";

type Status =
  | "initialising"
  | "ready"
  | "correct"
  | "incorrect"
  | "session-complete"
  | "error";

interface Scenario {
  correctTier: Tier;
}

interface TestApiSessionState {
  status: Status;
  currentScenario: Scenario | null;
  sessionId: string | null;
  currentIndex: number;
  correctCount: number;
  totalScenarios: number;
  completionTimeMs: number | null;
}

interface TestApiHandlers {
  clickTier: (tier: Tier) => void;
  continue: () => Promise<void>;
  getSessionState: () => TestApiSessionState;
}

declare global {
  interface Window {
    __signalTestApi?: TestApiHandlers;
  }
}

const RISK_CLASSIFIER_PATH = "/content-areas/risk-classifier";

test.describe("Risk Classifier smoke", () => {
  test("user can sign in, start a session, and classify one scenario correctly", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(RISK_CLASSIFIER_PATH);

    // testApi registers only in DEV builds. Its presence proves the
    // dev server is running and the component has mounted.
    await page.waitForFunction(
      () => typeof window.__signalTestApi !== "undefined",
      undefined,
      { timeout: 10_000 },
    );

    // Wait for the first scenario to be ready for input.
    await page.waitForFunction(
      () => window.__signalTestApi?.getSessionState().status === "ready",
      undefined,
      { timeout: 10_000 },
    );

    const firstState = await page.evaluate<TestApiSessionState>(() =>
      window.__signalTestApi!.getSessionState(),
    );
    expect(firstState.currentScenario).not.toBeNull();
    expect(firstState.currentIndex).toBe(0);
    expect(firstState.totalScenarios).toBe(5);

    const firstCorrectTier = firstState.currentScenario!.correctTier;

    await page.evaluate((tier: Tier) => {
      window.__signalTestApi!.clickTier(tier);
    }, firstCorrectTier);

    await page.waitForFunction(
      () => window.__signalTestApi?.getSessionState().status === "correct",
      undefined,
      { timeout: 5_000 },
    );

    await page.evaluate(() => window.__signalTestApi!.continue());

    // After continue, expect the next scenario to be ready and the
    // index to have advanced.
    await page.waitForFunction(
      () => {
        const s = window.__signalTestApi?.getSessionState();
        return s?.status === "ready" && s.currentIndex === 1;
      },
      undefined,
      { timeout: 5_000 },
    );

    const secondState = await page.evaluate<TestApiSessionState>(() =>
      window.__signalTestApi!.getSessionState(),
    );
    expect(secondState.currentIndex).toBe(1);
    expect(secondState.correctCount).toBe(1);
  });
});
