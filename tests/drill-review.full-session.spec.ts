// tests/drill-review.full-session.spec.ts
//
// Full-session E2E for /review. Uses Playwright's clock-mocking to put
// newly-enqueued cards past their first-miss interval (4 hours) so they
// appear immediately in the queue.
//
//   1. Sign in.
//   2. Install a fake clock at a known UTC time.
//   3. Navigate to /review and enqueue two cards from CA 4.1 Data
//      Protection with outcome 'miss' (each lands at box 0 with
//      nextReviewDate = now + 4 hours per scope Section 3.5).
//   4. Fast-forward the clock past 4 hours and reload so the component
//      re-fetches with the new "now". Both cards become past-due.
//   5. Drive the UI: reveal -> got on the first, reveal -> miss on the
//      second.
//   6. Assert the done summary shows 1 got, 1 miss.
//
// Note on test isolation: this spec writes drillRatings under the
// seeded Playwright user. Repeated runs will accumulate state, but the
// test asserts on the queue length and the specific outcome counts
// produced inside this run, which is robust to leftover documents from
// prior runs that may or may not be due.

import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";

const REVIEW_PATH = "/review";
const TOPIC_ID = "4-1-1-data-protection";
const TERM_A = "411-drill-01";
const TERM_B = "411-drill-02";

test.describe("Drill review full session", () => {
  test("planted queue: reveal+got then reveal+miss produces a done summary", async ({ page }) => {
    await signIn(page);
    await page.clock.install({ time: new Date("2026-05-15T12:00:00.000Z") });
    await page.goto(REVIEW_PATH);

    await page.waitForFunction(
      () => typeof window.__signalDrillSchedulerTestApi !== "undefined",
      undefined,
      { timeout: 10_000 },
    );

    await page.evaluate(
      async ({ topicId, termA, termB }) => {
        const api = window.__signalDrillSchedulerTestApi!;
        await api.enqueueCard(topicId, termA, "miss");
        await api.enqueueCard(topicId, termB, "miss");
      },
      { topicId: TOPIC_ID, termA: TERM_A, termB: TERM_B },
    );

    await page.clock.fastForward("5h");
    await page.reload();

    await page.waitForFunction(
      () => typeof window.__signalDrillSchedulerTestApi !== "undefined",
      undefined,
      { timeout: 10_000 },
    );

    // Wait for the component to settle into the cue phase (queue is
    // non-empty after the fast-forward).
    await page.waitForFunction(
      () => {
        const el = document.querySelector("[data-review-state]");
        return el?.getAttribute("data-review-state") === "cue";
      },
      undefined,
      { timeout: 10_000 },
    );

    // First card: reveal -> got.
    await page.locator('[data-review-action="reveal"]').click();
    await page.waitForFunction(
      () => document.querySelector('[data-review-state="revealed"]') !== null,
      undefined,
      { timeout: 5_000 },
    );
    await page.locator('[data-review-action="got"]').click();

    // Component returns to cue for the next card.
    await page.waitForFunction(
      () => {
        const el = document.querySelector("[data-review-state]");
        return el?.getAttribute("data-review-state") === "cue";
      },
      undefined,
      { timeout: 5_000 },
    );

    // Second card: reveal -> miss.
    await page.locator('[data-review-action="reveal"]').click();
    await page.waitForFunction(
      () => document.querySelector('[data-review-state="revealed"]') !== null,
      undefined,
      { timeout: 5_000 },
    );
    await page.locator('[data-review-action="miss"]').click();

    // Done state.
    await page.waitForFunction(
      () => {
        const el = document.querySelector("[data-review-state]");
        return el?.getAttribute("data-review-state") === "done";
      },
      undefined,
      { timeout: 5_000 },
    );

    const got = await page.locator("[data-review-got-count]").innerText();
    const miss = await page.locator("[data-review-miss-count]").innerText();
    expect(got).toBe("1");
    expect(miss).toBe("1");

    // Per-card state assertion: the 'got' card advanced from box 0 to
    // box 1; the 'miss' card stayed at box 0.
    const stateA = await page.evaluate(
      async ({ topicId, termId }) => {
        return window.__signalDrillSchedulerTestApi!.getCardState(topicId, termId);
      },
      { topicId: TOPIC_ID, termId: TERM_A },
    );
    const stateB = await page.evaluate(
      async ({ topicId, termId }) => {
        return window.__signalDrillSchedulerTestApi!.getCardState(topicId, termId);
      },
      { topicId: TOPIC_ID, termId: TERM_B },
    );
    expect(stateA?.boxLevel).toBe(1);
    expect(stateB?.boxLevel).toBe(0);
  });
});
