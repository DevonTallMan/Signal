// tests/fixtures/sort-and-match.ts
//
// Helpers for driving a full Sort & Match session through the
// Playwright test API. The component exposes
// window.__signalSortAndMatchTestApi in dev builds
// (see src/lib/sort-and-match/testApi.ts and SortAndMatch.tsx).
//
// Types are imported from the production source so the helpers stay
// in sync with the test API surface. This is a type-only import: no
// runtime code from src/ is pulled into the test bundle.

import type { Page } from "@playwright/test";
import type {
  TestApiSessionState,
  Status,
  Location,
  Category,
  PhraseRef,
} from "../../src/lib/sort-and-match/testApi";

export type { TestApiSessionState, Status, Location, Category, PhraseRef };

export const ALL_CATEGORIES: Category[] = ["N", "E", "I"];

export async function getState(page: Page): Promise<TestApiSessionState> {
  return page.evaluate(() => {
    if (!window.__signalSortAndMatchTestApi) {
      throw new Error("window.__signalSortAndMatchTestApi is not registered");
    }
    return window.__signalSortAndMatchTestApi.getSessionState();
  });
}

export async function placePhrase(
  page: Page,
  phraseId: string,
  location: Location,
): Promise<void> {
  await page.evaluate(
    ({ id, loc }) => {
      if (!window.__signalSortAndMatchTestApi) {
        throw new Error(
          "window.__signalSortAndMatchTestApi is not registered",
        );
      }
      window.__signalSortAndMatchTestApi.placePhrase(id, loc);
    },
    { id: phraseId, loc: location },
  );
}

export async function clickCheck(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (!window.__signalSortAndMatchTestApi) {
      throw new Error("window.__signalSortAndMatchTestApi is not registered");
    }
    window.__signalSortAndMatchTestApi.clickCheck();
  });
}

export async function clickContinue(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (!window.__signalSortAndMatchTestApi) {
      throw new Error("window.__signalSortAndMatchTestApi is not registered");
    }
    window.__signalSortAndMatchTestApi.clickContinue();
  });
}

export async function clickReset(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (!window.__signalSortAndMatchTestApi) {
      throw new Error("window.__signalSortAndMatchTestApi is not registered");
    }
    window.__signalSortAndMatchTestApi.clickReset();
  });
}

export async function waitForTestApi(
  page: Page,
  timeoutMs = 10_000,
): Promise<void> {
  await page.waitForFunction(
    () => typeof window.__signalSortAndMatchTestApi !== "undefined",
    undefined,
    { timeout: timeoutMs },
  );
}

export async function waitForStatus(
  page: Page,
  status: Status,
  timeoutMs = 10_000,
): Promise<void> {
  await page.waitForFunction(
    (s) =>
      window.__signalSortAndMatchTestApi?.getSessionState().status === s,
    status,
    { timeout: timeoutMs },
  );
}

/**
 * Wait until the test API is registered AND the first scenario has
 * loaded (status moves from "loading" to "placing" once bootSession
 * completes and a scenario is picked).
 */
export async function waitForReady(
  page: Page,
  timeoutMs = 10_000,
): Promise<void> {
  await waitForTestApi(page, timeoutMs);
  await waitForStatus(page, "placing", timeoutMs);
}

/**
 * Return any category that is NOT the given correct one. Used to
 * generate wrong placements for stuck-mitigation tests.
 */
export function pickWrongCategory(correct: Category): Category {
  const wrong = ALL_CATEGORIES.find((c) => c !== correct);
  if (!wrong) {
    throw new Error(`No wrong category available for ${correct}`);
  }
  return wrong;
}

export async function placeAllCorrectly(page: Page): Promise<void> {
  const state = await getState(page);
  for (const phrase of state.phrasesInScenario) {
    await placePhrase(page, phrase.id, phrase.category);
  }
}

export async function placeAllIncorrectly(page: Page): Promise<void> {
  const state = await getState(page);
  for (const phrase of state.phrasesInScenario) {
    await placePhrase(page, phrase.id, pickWrongCategory(phrase.category));
  }
}
