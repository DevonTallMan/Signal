// tests/fixtures/session.ts
//
// Helpers for driving a full Risk Classifier session through the
// Playwright test API. The component exposes window.__signalTestApi
// in dev builds (see src/lib/risk-classifier/testApi.ts and
// RiskClassifier.tsx).
//
// Types are imported from the production source so the helpers stay
// in sync with the test API surface. This is a type-only import: no
// runtime code from src/ is pulled into the test bundle.

import type { Page } from "@playwright/test";
import type {
  TestApiSessionState,
} from "../../src/lib/risk-classifier/testApi";
import type { Tier } from "../../src/lib/risk-classifier/game";

export type { Tier, TestApiSessionState };

export const ALL_TIERS: Tier[] = [
  "data-protection",
  "computer-misuse",
  "equality",
  "intellectual-property",
];

export const TIER_LABELS: Record<Tier, string> = {
  "data-protection": "Data Protection",
  "computer-misuse": "Computer Misuse",
  equality: "Equality",
  "intellectual-property": "Intellectual Property",
};

export type TierStrategy = (
  scenario: NonNullable<TestApiSessionState["currentScenario"]>,
) => Tier;

/** Always pick the correct tier for the current scenario. */
export const alwaysCorrect: TierStrategy = (s) => s.correctTier;

/**
 * Always pick a wrong tier. Returns the first tier from ALL_TIERS that
 * is not the correct tier. Each scenario in scenarios.json provides
 * commonMistakes covering all three non-correct tiers, so the choice
 * always has a matching mistake panel.
 */
export const alwaysWrong: TierStrategy = (s) => {
  const wrong = ALL_TIERS.find((t) => t !== s.correctTier);
  if (!wrong) {
    throw new Error(`No wrong tier available for scenario ${s.id}`);
  }
  return wrong;
};

export async function getSessionState(
  page: Page,
): Promise<TestApiSessionState> {
  return page.evaluate(() => {
    if (!window.__signalTestApi) {
      throw new Error("window.__signalTestApi is not registered");
    }
    return window.__signalTestApi.getSessionState();
  });
}

export async function classify(page: Page, tier: Tier): Promise<void> {
  await page.evaluate((t) => {
    if (!window.__signalTestApi) {
      throw new Error("window.__signalTestApi is not registered");
    }
    window.__signalTestApi.clickTier(t);
  }, tier);
}

export async function continueSession(page: Page): Promise<void> {
  await page.evaluate(async () => {
    if (!window.__signalTestApi) {
      throw new Error("window.__signalTestApi is not registered");
    }
    await window.__signalTestApi.continue();
  });
}

export async function waitForStatus(
  page: Page,
  status: TestApiSessionState["status"],
  timeoutMs = 10_000,
): Promise<void> {
  await page.waitForFunction(
    (s) => window.__signalTestApi?.getSessionState().status === s,
    status,
    { timeout: timeoutMs },
  );
}

export async function waitForFeedback(
  page: Page,
  timeoutMs = 10_000,
): Promise<void> {
  await page.waitForFunction(
    () => {
      const s = window.__signalTestApi?.getSessionState().status;
      return s === "correct" || s === "incorrect";
    },
    null,
    { timeout: timeoutMs },
  );
}
