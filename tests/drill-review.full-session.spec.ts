// tests/drill-review.full-session.spec.ts
//
// Full-session E2E for /review. Plants two past-due cards via the
// test-only seedCardWithDueDate method, then drives the rate UX
// through both: reveal -> got on the first card, reveal -> miss on
// the second. Asserts the done summary shows 1 got and 1 miss and
// that the resulting per-card scheduler state matches the rate
// transitions defined in scope Section 3.3.
//
// Why seedCardWithDueDate exists: enqueueCard goes through
// saveDrillRatingWithScheduler which computes nextReviewDate as
// now + 4h (first-encounter miss) or now + 1d (first-encounter got),
// so newly-enqueued cards are not immediately due. Playwright's
// page.clock.install conflicts with Firebase Auth token validation
// (tokens carry server-side iat/exp claims that the SDK validates
// against the local clock), so clock-mocking is not a viable
// substitute. seedCardWithDueDate is a test-only path that writes
// a card document directly with an arbitrary nextReviewDate.

import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";

const REVIEW_PATH = "/review";
const TOPIC_ID = "4-1-1-data-protection";
const TERM_A = "411-drill-01";
const TERM_B = "411-drill-02";

test.describe("Drill review full session", () => {
  test("planted past-due cards: reveal+got then reveal+miss produces a 1-got 1-miss summary", async ({ page }) => {
    await signIn(page);
    await page.goto(REVIEW_PATH);

    await page.waitForFunction(
      () => typeof window.__signalDrillSchedulerTestApi !== "undefined",
      undefined,
      { timeout: 10_000 },
    );

    // Plant two past-due cards. Using "1 hour ago" so the picker
    // (which sorts ascending by nextReviewDate) returns them in a
    // stable order: termA slightly earlier, termB slightly later.
    const now = Date.now();
    const dueAtA = new Date(now - 2 * 60 * 60 * 1000).toISOString();
    const dueAtB = new Date(now - 1 * 60 * 60 * 1000).toISOString();

    await page.evaluate(
      async ({ topicId, termA, termB, dueAtA, dueAtB }) => {
        const api = window.__signalDrillSchedulerTestApi!;
        await api.seedCardWithDueDate(topicId, termA, 0, dueAtA);
        await api.seedCardWithDueDate(topicId, termB, 0, dueAtB);
      },
      { topicId: TOPIC_ID, termA: TERM_A, termB: TERM_B, dueAtA, dueAtB },
    );

    // After seeding, ReviewSession re-fetches the queue. Because
    // seedCardWithDueDate increments the reload counter after each
    // seed, the first re-fetch can fire BEFORE the second seed
    // commits, briefly putting the queue at length 1. We wait for
    // the queue to settle at length 2 before driving the UI, so the
    // rate() closure captures queue.length = 2 and routes through
    // the second card rather than transitioning to 'done' early.
    await page.waitForFunction(
      () => {
        const el = document.querySelector("[data-review-state]");
        if (el?.getAttribute("data-review-state") !== "cue") return false;
        return el?.getAttribute("data-review-queue-length") === "2";
      },
      undefined,
      { timeout: 10_000 },
    );

    // First card: reveal -> got. termA comes first because its
    // seeded nextReviewDate is earlier (sort ascending).
    await page.locator('[data-review-action="reveal"]').click();
    await page.waitForFunction(
      () => document.querySelector('[data-review-state="revealed"]') !== null,
      undefined,
      { timeout: 5_000 },
    );
    await page.locator('[data-review-action="got"]').click();

    // Component returns to cue for the second card.
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

    // Per-card state assertion: the 'got' card advanced from box 0
    // to box 1; the 'miss' card stayed at box 0 (subsequent miss
    // resets to box 0, not first-encounter 4h).
    const stateA = await page.evaluate(
      async ({ topicId, termId }) =>
        window.__signalDrillSchedulerTestApi!.getCardState(topicId, termId),
      { topicId: TOPIC_ID, termId: TERM_A },
    );
    const stateB = await page.evaluate(
      async ({ topicId, termId }) =>
        window.__signalDrillSchedulerTestApi!.getCardState(topicId, termId),
      { topicId: TOPIC_ID, termId: TERM_B },
    );
    expect(stateA?.boxLevel).toBe(1);
    expect(stateB?.boxLevel).toBe(0);
  });
});
