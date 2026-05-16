// tests/mcq-runner.smoke.spec.ts
//
// Smoke test for the Sprint 7B Inc 7B.1 MCQ runner. Loads a topic
// page that has an MCQ in its frontmatter, signs in, picks the
// correct option (option index 0 on 412-mcq-01, the CMA topic's
// MCQ), submits, and verifies the correct verdict appears.
//
// The test uses the Computer Misuse topic because:
//   - It has a well-known MCQ (412-mcq-01) with correct_index: 0
//   - It uses the comic format from Inc 7.1, so the AssessmentBlock
//     is rendered under the comic-divider per the comic branch of
//     /topics/[slug].astro

import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";

const CMA_TOPIC_PATH = "/topics/4-1-2-computer-misuse";
const MCQ_QUESTION_ID = "412-mcq-01";

test.describe("MCQ runner smoke", () => {
  // Marked fixme until the Sprint 7B Inc 7B.0 mcqSubmissions rules
  // block (#138) is confirmed deployed to the staging Firestore
  // project (signal-staging-26b3e). The Playwright suite runs against
  // npm run dev, which routes Firebase calls to staging; until the
  // rules deploy lands, every MCQ write returns permission-denied
  // and the verdict assertion times out. See the deploy-note in #138
  // and Trap 12 in docs/handover-2026-05-16.md. Once the deploy is
  // confirmed live, remove the fixme and ship the test back.
  test.fixme("signed-in student can submit an MCQ and see the correct verdict", async ({ page }) => {
    await signIn(page);
    await page.goto(CMA_TOPIC_PATH);

    // Wait for the MCQ runner island to mount and settle out of
    // the loading state. After load it should be either 'ready'
    // (no prior submission) or 'submitted' (prior submission).
    const runner = page.locator(`[data-mcq-id="${MCQ_QUESTION_ID}"]`);
    await runner.waitFor({ state: "visible", timeout: 10_000 });
    await page.waitForFunction(
      (id) => {
        const el = document.querySelector(`[data-mcq-id="${id}"]`);
        if (!el) return false;
        const state = el.getAttribute("data-mcq-state");
        return state === "ready" || state === "submitted";
      },
      MCQ_QUESTION_ID,
      { timeout: 10_000 },
    );

    // If a prior submission exists from a previous test run, retry
    // it to reset the runner to the "ready" state. The retry button
    // clears the local state without writing a new Firestore doc.
    const currentState = await runner.getAttribute("data-mcq-state");
    if (currentState === "submitted") {
      await runner.locator('[data-mcq-action="retry"]').click();
      await page.waitForFunction(
        (id) =>
          document
            .querySelector(`[data-mcq-id="${id}"]`)
            ?.getAttribute("data-mcq-state") === "ready",
        MCQ_QUESTION_ID,
        { timeout: 5_000 },
      );
    }

    // Pick the first option (correct_index: 0 for 412-mcq-01) and
    // submit. The radio is the first input under the runner.
    await runner.locator("input[type=radio]").first().check();
    await runner.locator('[data-mcq-action="submit"]').click();

    // Verdict appears with data-mcq-verdict="correct".
    await page.waitForFunction(
      (id) => {
        const el = document
          .querySelector(`[data-mcq-id="${id}"]`)
          ?.querySelector("[data-mcq-verdict]");
        return el?.getAttribute("data-mcq-verdict") === "correct";
      },
      MCQ_QUESTION_ID,
      { timeout: 15_000 },
    );

    const verdict = await runner.locator("[data-mcq-verdict]").getAttribute("data-mcq-verdict");
    expect(verdict).toBe("correct");
  });
});
