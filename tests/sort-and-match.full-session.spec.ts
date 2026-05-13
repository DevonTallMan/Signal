// tests/sort-and-match.full-session.spec.ts
//
// Full-session tests for Sort & Match. Two paths:
//   1. Solve every scenario correctly on attempt 1 → perfect-score
//      session summary.
//   2. Fail three attempts on the first scenario → model answer
//      revealed as with-help, then solve the rest correctly → partial
//      score session summary.
//
// Both tests are robust to any totalScenarios value (currently 1
// because only one scenario exists; will work unchanged when more
// scenarios are added).

import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";
import {
  clickCheck,
  clickContinue,
  getState,
  placeAllCorrectly,
  placeAllIncorrectly,
  waitForReady,
  waitForStatus,
} from "./fixtures/sort-and-match";

const SORT_AND_MATCH_PATH = "/content-areas/sort-and-match";

test.describe("Sort & Match full session", () => {
  test("solving every scenario correctly yields a perfect-score summary", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(SORT_AND_MATCH_PATH);
    await waitForReady(page);

    const initialState = await getState(page);
    const numScenarios = initialState.totalScenarios;
    expect(numScenarios).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < numScenarios; i++) {
      const beforeState = await getState(page);
      expect(beforeState.currentIndex).toBe(i);
      expect(beforeState.attemptNumber).toBe(1);

      await placeAllCorrectly(page);
      await clickCheck(page);
      await waitForStatus(page, "complete-correct");

      // SCENARIO COMPLETE kicker shows on the success path.
      await expect(
        page.locator(".sm-sortmatch__model-answer-kicker"),
      ).toHaveText("SCENARIO COMPLETE");
      // The success path does NOT add the with-help modifier class.
      await expect(
        page.locator(".sm-sortmatch__model-answer--with-help"),
      ).toHaveCount(0);

      await clickContinue(page);
    }

    await waitForStatus(page, "session-complete");

    const finalState = await getState(page);
    expect(finalState.correctCount).toBe(numScenarios);

    await expect(
      page.locator(".sm-sortmatch__session-summary-kicker"),
    ).toHaveText("SESSION COMPLETE");
    await expect(
      page.locator(".sm-sortmatch__session-summary-score-value"),
    ).toHaveText(String(numScenarios));
    await expect(
      page.locator(".sm-sortmatch__session-summary-score-total"),
    ).toHaveText(String(numScenarios));
  });

  test("failing three attempts reveals the model answer as with-help", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(SORT_AND_MATCH_PATH);
    await waitForReady(page);

    const initialState = await getState(page);
    const numScenarios = initialState.totalScenarios;

    // Attempt 1: all wrong.
    await placeAllIncorrectly(page);
    await clickCheck(page);
    await waitForStatus(page, "feedback");
    let state = await getState(page);
    expect(state.attemptNumber).toBe(2);

    // Attempt 2: clear feedback by re-placing (placePhrase clears
    // feedback when status is "feedback"), then check again.
    await placeAllIncorrectly(page);
    await waitForStatus(page, "placing");
    await clickCheck(page);
    await waitForStatus(page, "feedback");
    state = await getState(page);
    expect(state.attemptNumber).toBe(3);

    // Attempt 3: same flow, but this time the check transitions to
    // complete-with-help because attemptNumber >= MAX_ATTEMPTS.
    await placeAllIncorrectly(page);
    await waitForStatus(page, "placing");
    await clickCheck(page);
    await waitForStatus(page, "complete-with-help");

    // The with-help path adds the modifier class and uses the MODEL
    // ANSWER kicker (vs SCENARIO COMPLETE on the success path).
    await expect(
      page.locator(".sm-sortmatch__model-answer--with-help"),
    ).toBeVisible();
    await expect(
      page.locator(".sm-sortmatch__model-answer-kicker"),
    ).toHaveText("MODEL ANSWER");

    await clickContinue(page);

    // Complete any remaining scenarios correctly so we can verify the
    // final correctCount is (numScenarios - 1).
    for (let i = 1; i < numScenarios; i++) {
      await waitForStatus(page, "placing");
      await placeAllCorrectly(page);
      await clickCheck(page);
      await waitForStatus(page, "complete-correct");
      await clickContinue(page);
    }

    await waitForStatus(page, "session-complete");
    const finalState = await getState(page);
    expect(finalState.correctCount).toBe(numScenarios - 1);
  });
});
