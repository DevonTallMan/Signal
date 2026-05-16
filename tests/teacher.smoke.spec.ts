// tests/teacher.smoke.spec.ts
//
// Smoke tests for the /teacher dashboard route.
//
// Two paths exercised:
//   1. Unauthenticated user lands on /teacher → redirected to
//      /signin?next=/teacher.
//   2. Signed-in non-teacher user (the standard Playwright test
//      user, whose email is NOT on the allowlist) → sees the deny
//      screen.
//
// The teacher-positive path (signed-in teacher sees the cohort
// table) is NOT exercised here. That requires either a second
// seeded staging user with a teacher-allowlist email, or a real
// teacher email to be added to firestore.rules and
// src/lib/teacher/allowlist.ts. Both are deferred until Chris's
// real teacher email is locked in pre-pilot. Until then the
// security boundary is covered by the rules tests in
// tests/rules/teacher-dashboard.test.ts and the deny path covers
// the client-side allowlist gate.

import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";

const TEACHER_PATH = "/teacher";

test.describe("Teacher dashboard smoke", () => {
  test("unauthenticated user is redirected to /signin", async ({ page }) => {
    await page.goto(TEACHER_PATH);

    // The TeacherView island runs an effect that redirects to
    // /signin?next=/teacher. We poll on URL until the redirect
    // resolves; the static page render itself doesn't redirect.
    await page.waitForURL(/\/signin/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/signin/);
    expect(page.url()).toMatch(/next=%2Fteacher|next=\/teacher/);
  });

  test("signed-in non-teacher user sees the deny screen", async ({ page }) => {
    await signIn(page);
    await page.goto(TEACHER_PATH);

    // Wait for the island to settle into the denied state.
    await page.waitForFunction(
      () => {
        const el = document.querySelector("[data-teacher-state]");
        if (!el) return false;
        const state = el.getAttribute("data-teacher-state");
        return state === "denied" || state === "ready" || state === "error";
      },
      undefined,
      { timeout: 10_000 },
    );

    const finalState = await page.evaluate(() => {
      const el = document.querySelector("[data-teacher-state]");
      return el?.getAttribute("data-teacher-state");
    });
    expect(finalState).toBe("denied");

    await expect(page.locator(".teacher h2")).toHaveText("Not authorised");
  });
});
