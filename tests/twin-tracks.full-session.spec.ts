// tests/twin-tracks.full-session.spec.ts
//
// Full-session tests for Twin Tracks. Two paths:
//   1. Solve every scenario correctly on the first attempt for every
//      phrase -> perfect-score session summary.
//   2. Trigger stuck-mitigation on one phrase by wrong-dropping it 3
//      times, then complete the round -> model answer revealed as
//      with-help, then solve remaining scenarios correctly -> partial
//      score session summary.
//
// Both tests are robust to any totalScenarios value (currently 1 because
// only one scenario exists; will work unchanged when more scenarios
// land).
//
// Drag-and-drop is driven exclusively through the test API. Real drag
// automation does NOT work with @dnd-kit/core's PointerSensor (Trap 5
// in the Sprint 4 plan); attempting it causes drops to register on the
// source droppable.

import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";
import {
  clickContinue,
  correctCellFor,
  getState,
  placeAllCorrectly,
  placePhrase,
  waitForReady,
  waitForStatus,
  wrongCellFor,
} from "./fixtures/twin-tracks";

const TWIN_TRACKS_PATH = "/content-areas/twin-tracks";

test.describe("Twin Tracks full session", () => {
  test("solving every scenario correctly yields a perfect-score summary", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(TWIN_TRACKS_PATH);
    await waitForReady(page);

    const initialState = await getState(page);
    const numScenarios = initialState.totalScenarios;
    expect(numScenarios).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < numScenarios; i++) {
      const beforeState = await getState(page);
      expect(beforeState.currentIndex).toBe(i);

      await placeAllCorrectly(page);
      await waitForStatus(page, "round-complete");

      // SCENARIO COMPLETE kicker on the success path.
      await expect(
        page.locator(".tt-twintracks__model-answer-kicker"),
      ).toHaveText("SCENARIO COMPLETE");
      // The success path does NOT add the with-help modifier class.
      await expect(
        page.locator(".tt-twintracks__model-answer--with-help"),
      ).toHaveCount(0);

      await clickContinue(page);
    }

    await waitForStatus(page, "session-complete");

    const finalState = await getState(page);
    expect(finalState.correctCount).toBe(numScenarios);
    expect(finalState.withHelpCount).toBe(0);

    await expect(
      page.locator(".tt-twintracks__session-summary-kicker"),
    ).toHaveText("SESSION COMPLETE");
    await expect(
      page.locator(".tt-twintracks__session-summary-score-value"),
    ).toHaveText(String(numScenarios));
    await expect(
      page.locator(".tt-twintracks__session-summary-score-total"),
    ).toHaveText(String(numScenarios));
  });

  test("triggering stuck-mitigation on a phrase reveals the model answer as with-help", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(TWIN_TRACKS_PATH);
    await waitForReady(page);

    const initialState = await getState(page);
    const numScenarios = initialState.totalScenarios;

    // Pick the first phrase. Wrong-drop it 3 times to trigger
    // stuck mitigation.
    const targetPhrase = initialState.phrasesInScenario[0];
    const wrongCell = wrongCellFor(targetPhrase);

    for (let drop = 0; drop < 3; drop++) {
      await placePhrase(page, targetPhrase.id, wrongCell);
    }

    // After 3 wrong drops, the phrase is marked revealed.
    const afterStuck = await getState(page);
    expect(afterStuck.revealed[targetPhrase.id]).toBe(true);
    expect(afterStuck.wrongDropCount[targetPhrase.id]).toBe(3);
    expect(afterStuck.locked[targetPhrase.id] ?? false).toBe(false);

    // Drop the revealed phrase correctly to lock it.
    await placePhrase(page, targetPhrase.id, correctCellFor(targetPhrase));

    // Place all other phrases correctly. Re-read state because the
    // previous placements have advanced it.
    const afterReveal = await getState(page);
    expect(afterReveal.locked[targetPhrase.id]).toBe(true);
    for (const phrase of afterReveal.phrasesInScenario) {
      if (phrase.id !== targetPhrase.id) {
        await placePhrase(page, phrase.id, correctCellFor(phrase));
      }
    }

    await waitForStatus(page, "round-complete");

    // The with-help path adds the modifier class and uses the MODEL
    // ANSWER kicker (vs SCENARIO COMPLETE on the success path).
    await expect(
      page.locator(".tt-twintracks__model-answer--with-help"),
    ).toBeVisible();
    await expect(
      page.locator(".tt-twintracks__model-answer-kicker"),
    ).toHaveText("MODEL ANSWER");

    await clickContinue(page);

    // Complete any remaining scenarios correctly so the final
    // correctCount equals (numScenarios - 1) and withHelpCount equals 1.
    for (let i = 1; i < numScenarios; i++) {
      await waitForStatus(page, "placing");
      await placeAllCorrectly(page);
      await waitForStatus(page, "round-complete");
      await clickContinue(page);
    }

    await waitForStatus(page, "session-complete");
    const finalState = await getState(page);
    expect(finalState.correctCount).toBe(numScenarios - 1);
    expect(finalState.withHelpCount).toBe(1);
  });
});
