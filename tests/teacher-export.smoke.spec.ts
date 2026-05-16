// tests/teacher-export.smoke.spec.ts
//
// Smoke tests for the /teacher/export endpoint.
//
// Same two deny paths as the /teacher dashboard spec:
//   1. Unauthenticated user → redirect to /signin?next=/teacher/export
//   2. Signed-in non-teacher → deny screen
//
// The teacher-positive path (signed-in teacher triggers a download)
// is deferred until Chris's real teacher email is locked in
// pre-pilot. Until then the security boundary is covered by the
// rules tests, and the cosmetic deny gate is covered here.

import { test, expect } from "@playwright/test";
import { signIn } from "./fixtures/auth";

const EXPORT_PATH = "/teacher/export";

test.describe("Teacher export smoke", () => {
  test("unauthenticated user is redirected to /signin", async ({ page }) => {
    await page.goto(EXPORT_PATH);

    await page.waitForURL(/\/signin/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/signin/);
    expect(page.url()).toMatch(/next=%2Fteacher%2Fexport|next=\/teacher\/export/);
  });

  test("signed-in non-teacher user sees the deny screen", async ({ page }) => {
    await signIn(page);
    await page.goto(EXPORT_PATH);

    await page.waitForFunction(
      () => {
        const el = document.querySelector("[data-export-state]");
        if (!el) return false;
        const state = el.getAttribute("data-export-state");
        return state === "denied" || state === "ready" || state === "error";
      },
      undefined,
      { timeout: 10_000 },
    );

    const finalState = await page.evaluate(() => {
      const el = document.querySelector("[data-export-state]");
      return el?.getAttribute("data-export-state");
    });
    expect(finalState).toBe("denied");
    await expect(page.locator(".teacher h2")).toHaveText("Not authorised");
  });
});
