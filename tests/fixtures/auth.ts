// tests/fixtures/auth.ts
//
// Sign-in helper for Playwright tests. Uses real DOM interactions
// against the Signal sign-in page (/signin). The Risk Classifier
// testApi does not provide an auth bypass, so tests authenticate as
// the seeded staging test user before exercising the component.
//
// Hydration handling: the SignInForm React island hydrates after
// initial page load. Playwright's locator.fill() can race that
// hydration; if fill happens first, React reconciles its empty
// initial state with the DOM and resets the input values to "".
// We wait for network idle before filling, which is a reliable
// proxy for "client islands have hydrated" on Astro pages.

import type { Page } from "@playwright/test";

export interface SignInOptions {
  email?: string;
  password?: string;
  signInPath?: string;
}

export async function signIn(
  page: Page,
  opts: SignInOptions = {},
): Promise<void> {
  const email = opts.email ?? process.env.PLAYWRIGHT_TEST_EMAIL;
  const password = opts.password ?? process.env.PLAYWRIGHT_TEST_PASSWORD;
  const signInPath = opts.signInPath ?? "/signin";

  if (!email || !password) {
    throw new Error(
      "signIn() requires PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD in the environment.",
    );
  }

  await page.goto(signInPath);

  // Wait for hydration before filling. Without this, fill() can race
  // the React island and the values get reset to "" when React
  // reconciles its empty initial state with the DOM.
  await page.waitForLoadState("networkidle");

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  // SignInForm.tsx redirects via window.location.href on success, and
  // AuthNav.tsx renders the signed-in state on the destination page.
  // The signed-in nav class is the most robust signal that auth
  // completed and the destination page rendered.
  await page
    .locator(".auth-nav--signed-in, .landing-auth--signed-in")
    .waitFor({ state: "visible", timeout: 10_000 });
}
