// tests/risk-classifier.full-session.spec.ts
//
// Full-session E2E tests for the Risk Classifier.
//
// Drives the component through all 5 scenarios via the test API,
// asserting per-scenario feedback DOM (examiner reasoning on correct,
// matching mistake panel on wrong), then end-of-session summary.
//
// Two strategies tested:
//   - alwaysCorrect: every scenario answered correctly (5/5 expected)
//   - alwaysWrong:   every scenario answered with a wrong tier (0/5)

import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";
import {
  alwaysCorrect,
  alwaysWrong,
  classify,
  continueSession,
  getSessionState,
  TIER_LABELS,
  waitForStatus,
} from "./fixtures/session";

const CLASSIFIER_PATH = "/content-areas/risk-classifier";
const EXPECTED_SESSION_LENGTH = 5;

test.describe("Risk Classifier full session", () => {
  test("answering every scenario correctly produces a 5/5 summary", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(CLASSIFIER_PATH);
    await waitForStatus(page, "ready");

    const initial = await getSessionState(page);
    expect(initial.totalScenarios).toBe(EXPECTED_SESSION_LENGTH);

    for (let i = 0; i < EXPECTED_SESSION_LENGTH; i++) {
      await waitForStatus(page, "ready");
      const state = await getSessionState(page);
      expect(state.currentIndex).toBe(i);
      expect(state.currentScenario).not.toBeNull();
      const sc = state.currentScenario!;

      await classify(page, alwaysCorrect(sc));
      await waitForStatus(page, "correct");

      const panel = page.locator(".rc-classifier__feedback--correct");
      await expect(panel).toBeVisible();
      await expect(panel).toContainText("Correct");
      await expect(panel).toContainText(TIER_LABELS[sc.correctTier]);
      await expect(panel).toContainText("Examiner reasoning");
      await expect(panel).toContainText(sc.examinerReasoning);

      await continueSession(page);
    }

    await waitForStatus(page, "session-complete");

    const final = await getSessionState(page);
    expect(final.correctCount).toBe(EXPECTED_SESSION_LENGTH);
    expect(final.completionTimeMs).not.toBeNull();
    expect(final.completionTimeMs!).toBeGreaterThan(0);

    const summary = page.locator(".rc-classifier__summary");
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("Session complete");
    await expect(
      summary.locator(".rc-classifier__summary-score-value"),
    ).toHaveText(String(EXPECTED_SESSION_LENGTH));
    await expect(
      summary.locator(".rc-classifier__summary-score-total"),
    ).toHaveText(String(EXPECTED_SESSION_LENGTH));
  });

  test("answering every scenario incorrectly produces a 0/5 summary with mistake panels", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(CLASSIFIER_PATH);
    await waitForStatus(page, "ready");

    const initial = await getSessionState(page);
    expect(initial.totalScenarios).toBe(EXPECTED_SESSION_LENGTH);

    for (let i = 0; i < EXPECTED_SESSION_LENGTH; i++) {
      await waitForStatus(page, "ready");
      const state = await getSessionState(page);
      expect(state.currentIndex).toBe(i);
      expect(state.currentScenario).not.toBeNull();
      const sc = state.currentScenario!;

      const wrongTier = alwaysWrong(sc);
      const matchingMistake = sc.commonMistakes.find(
        (m) => m.tier === wrongTier,
      );
      expect(
        matchingMistake,
        `Scenario ${sc.id} has no commonMistakes entry for ${wrongTier}`,
      ).toBeDefined();

      await classify(page, wrongTier);
      await waitForStatus(page, "incorrect");

      const panel = page.locator(".rc-classifier__feedback--incorrect");
      await expect(panel).toBeVisible();
      await expect(panel).toContainText("Not quite");
      await expect(panel).toContainText(TIER_LABELS[wrongTier]);
      await expect(panel).toContainText(matchingMistake!.why);
      await expect(panel).toContainText("The primary answer is");
      await expect(panel).toContainText(TIER_LABELS[sc.correctTier]);
      await expect(panel).toContainText(sc.examinerReasoning);

      await continueSession(page);
    }

    await waitForStatus(page, "session-complete");

    const final = await getSessionState(page);
    expect(final.correctCount).toBe(0);

    const summary = page.locator(".rc-classifier__summary");
    await expect(summary).toBeVisible();
    await expect(
      summary.locator(".rc-classifier__summary-score-value"),
    ).toHaveText("0");
  });
});

