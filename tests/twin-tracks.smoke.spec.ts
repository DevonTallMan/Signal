// tests/twin-tracks.smoke.spec.ts
//
// Smoke test for Twin Tracks. Verifies that an authenticated user can
// sign in, load the page, and that the test API surface is present with
// the first scenario loaded. Does NOT interact with the activity; the
// full-session spec covers that.

import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";
import { getState, waitForReady } from "./fixtures/twin-tracks";

const TWIN_TRACKS_PATH = "/content-areas/twin-tracks";

test.describe("Twin Tracks smoke", () => {
  test("user can sign in, load the page, and see the first scenario", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(TWIN_TRACKS_PATH);
    await waitForReady(page);

    const state = await getState(page);

    expect(state.currentScenarioId).not.toBeNull();
    expect(state.currentIndex).toBe(0);
    expect(state.totalScenarios).toBeGreaterThanOrEqual(1);
    expect(state.correctCount).toBe(0);
    expect(state.withHelpCount).toBe(0);

    // Twin Tracks scenarios have exactly 6 phrases (2 tracks * 3 slots,
    // per locked spec decision TT2).
    expect(state.phrasesInScenario.length).toBe(6);

    // All phrases start in the pool.
    for (const phrase of state.phrasesInScenario) {
      expect(state.placements[phrase.id]).toBe("pool");
    }

    // Each phrase has a valid track and slot.
    for (const phrase of state.phrasesInScenario) {
      expect(["positive", "negative"]).toContain(phrase.track);
      expect(["introduce", "explain", "develop"]).toContain(phrase.slot);
    }

    // Each (track, slot) combination is represented exactly once
    // (one phrase per cell, total 6 cells).
    const cellsCovered = new Set(
      state.phrasesInScenario.map((p) => `${p.track}-${p.slot}`),
    );
    expect(cellsCovered.size).toBe(6);
  });
});
