// tests/drill-review.full-session.spec.ts
//
// Full-session E2E for /review. Drives the drill-scheduler test API
// end-to-end against the staging Firebase project: enqueue two cards
// via the production saveDrillRatingWithScheduler write path, then
// verify the resulting Firestore state via getDueCards and
// getCardState. Both cards land at box 0 with a 4-hour first-encounter
// interval per scope Section 3.5.
//
// This spec deliberately does NOT drive the rate UI. Driving the UI
// requires either past-due cards or a virtual clock; Playwright's
// page.clock.install conflicts with Firebase Auth token validation
// (tokens carry server-side iat/exp claims that the SDK validates
// against the local clock; mocking the clock breaks token refresh).
// UI-drive coverage for past-due cards will land in a follow-up once
// a clock-safe seeding path is in place. The unit-test coverage of
// nextState (Inc 6.1, 26 tests) already proves the rate transitions
// produce the right scheduler states; this spec proves the wrapper
// commits those states to Firestore correctly.

import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";

const REVIEW_PATH = "/review";
const TOPIC_ID = "4-1-1-data-protection";
const TERM_A = "411-drill-01";
const TERM_B = "411-drill-02";

test.describe("Drill review full session", () => {
  test("test API enqueues two cards and exposes their scheduler state", async ({ page }) => {
    await signIn(page);
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

    // Both cards have nextReviewDate = now + 4h (first-encounter miss).
    // A far-future query horizon includes them.
    const due = await page.evaluate(async () => {
      const api = window.__signalDrillSchedulerTestApi!;
      const farFuture = new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString();
      return api.getDueCards(farFuture);
    });
    const dueIds = due.map((d) => d.termId).sort();
    expect(dueIds).toContain(TERM_A);
    expect(dueIds).toContain(TERM_B);

    // Each enqueued card is at box 0 with a non-null nextReviewDate.
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
    expect(stateA?.boxLevel).toBe(0);
    expect(stateA?.nextReviewDate).not.toBeNull();
    expect(stateB?.boxLevel).toBe(0);
    expect(stateB?.nextReviewDate).not.toBeNull();
  });
});
