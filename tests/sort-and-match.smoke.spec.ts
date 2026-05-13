// tests/sort-and-match.smoke.spec.ts
//
// Smoke test for Sort & Match. Verifies that an authenticated user
// can sign in, load the page, and that the test API surface is
// present with the first scenario loaded. Does NOT interact with
// the activity; the full-session spec covers that.

import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";
import { getState, waitForReady } from "./fixtures/sort-and-match";

const SORT_AND_MATCH_PATH = "/content-areas/sort-and-match";

test.describe("Sort & Match smoke", () => {
  test("user can sign in, load the page, and see the first scenario", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(SORT_AND_MATCH_PATH);
    await waitForReady(page);

    const state = await getState(page);

    expect(state.currentScenarioId).not.toBeNull();
    expect(state.currentIndex).toBe(0);
    expect(state.totalScenarios).toBeGreaterThanOrEqual(1);
    expect(state.correctCount).toBe(0);
    expect(state.attemptNumber).toBe(1);
    expect(state.phrasesInScenario.length).toBeGreaterThanOrEqual(1);

    // All phrases start in the pool.
    for (const phrase of state.phrasesInScenario) {
      expect(state.placements[phrase.id]).toBe("pool");
    }

    // Each phrase has a valid N/E/I category.
    for (const phrase of state.phrasesInScenario) {
      expect(["N", "E", "I"]).toContain(phrase.category);
    }
  });
});
