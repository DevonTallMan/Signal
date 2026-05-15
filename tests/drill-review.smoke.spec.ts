// tests/drill-review.smoke.spec.ts
//
// Smoke test for the /review surface. Verifies that:
//   1. An authenticated user can navigate to /review.
//   2. The drill-scheduler test API registers on the window.
//   3. The page renders one of the legitimate phases (empty, cue, or
//      done) and does NOT crash into the loading state forever.

import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";

const REVIEW_PATH = "/review";

test.describe("Drill review smoke", () => {
  test("signed-in user can load /review and the test API registers", async ({ page }) => {
    await signIn(page);
    await page.goto(REVIEW_PATH);

    // Test API presence proves the ReviewSession island has mounted in a
    // DEV build. The API only registers when import.meta.env.DEV is true.
    await page.waitForFunction(
      () => typeof window.__signalDrillSchedulerTestApi !== "undefined",
      undefined,
      { timeout: 10_000 },
    );

    // The component must settle out of the loading state into one of the
    // valid post-load phases.
    await page.waitForFunction(
      () => {
        const el = document.querySelector("[data-review-state]");
        if (!el) return false;
        const state = el.getAttribute("data-review-state");
        return state !== null && state !== "loading";
      },
      undefined,
      { timeout: 10_000 },
    );

    const finalState = await page.evaluate(() => {
      const el = document.querySelector("[data-review-state]");
      return el?.getAttribute("data-review-state");
    });
    expect(["empty", "cue", "done"]).toContain(finalState);
  });
});
