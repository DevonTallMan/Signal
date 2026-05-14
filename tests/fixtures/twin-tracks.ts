// tests/fixtures/twin-tracks.ts
//
// Helpers for driving a full Twin Tracks session through the Playwright
// test API. The component exposes window.__signalTwinTracksTestApi in dev
// builds (see src/lib/twin-tracks/testApi.ts and TwinTracks.tsx).
//
// Types are imported from the production source so the helpers stay in
// sync with the test API surface. This is a type-only import: no runtime
// code from src/ is pulled into the test bundle.

import type { Page } from "@playwright/test";
import type {
  TestApiSessionState,
  Status,
  Location,
  CellId,
  Track,
  Slot,
  PhraseRef,
} from "../../src/lib/twin-tracks/testApi";

export type {
  TestApiSessionState,
  Status,
  Location,
  CellId,
  Track,
  Slot,
  PhraseRef,
};

export const TRACKS: Track[] = ["positive", "negative"];
export const SLOTS: Slot[] = ["introduce", "explain", "develop"];

export function cellId(track: Track, slot: Slot): CellId {
  return `${track}-${slot}` as CellId;
}

export function correctCellFor(phrase: PhraseRef): CellId {
  return cellId(phrase.track, phrase.slot);
}

/**
 * Return a deterministically wrong cell for a phrase: flip the track,
 * keep the slot. This produces a track-wrong-slot-right error (one of
 * the four diagnostic feedback types from spec Section 6.3).
 */
export function wrongCellFor(phrase: PhraseRef): CellId {
  const otherTrack: Track =
    phrase.track === "positive" ? "negative" : "positive";
  return cellId(otherTrack, phrase.slot);
}

export async function getState(page: Page): Promise<TestApiSessionState> {
  return page.evaluate(() => {
    if (!window.__signalTwinTracksTestApi) {
      throw new Error("window.__signalTwinTracksTestApi is not registered");
    }
    return window.__signalTwinTracksTestApi.getSessionState();
  });
}

export async function placePhrase(
  page: Page,
  phraseId: string,
  location: Location,
): Promise<void> {
  await page.evaluate(
    ({ id, loc }) => {
      if (!window.__signalTwinTracksTestApi) {
        throw new Error(
          "window.__signalTwinTracksTestApi is not registered",
        );
      }
      window.__signalTwinTracksTestApi.placePhrase(id, loc);
    },
    { id: phraseId, loc: location },
  );
}

export async function clickContinue(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (!window.__signalTwinTracksTestApi) {
      throw new Error("window.__signalTwinTracksTestApi is not registered");
    }
    window.__signalTwinTracksTestApi.clickContinue();
  });
}

export async function clickStartNewSession(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (!window.__signalTwinTracksTestApi) {
      throw new Error("window.__signalTwinTracksTestApi is not registered");
    }
    window.__signalTwinTracksTestApi.clickStartNewSession();
  });
}

export async function waitForTestApi(
  page: Page,
  timeoutMs = 10_000,
): Promise<void> {
  await page.waitForFunction(
    () => typeof window.__signalTwinTracksTestApi !== "undefined",
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
    (s) => window.__signalTwinTracksTestApi?.getSessionState().status === s,
    status,
    { timeout: timeoutMs },
  );
}

/**
 * Wait until the test API is registered AND the first scenario has loaded
 * (status moves from "loading" to "placing" once bootSession completes
 * and a scenario is picked).
 */
export async function waitForReady(
  page: Page,
  timeoutMs = 10_000,
): Promise<void> {
  await waitForTestApi(page, timeoutMs);
  await waitForStatus(page, "placing", timeoutMs);
}

export async function placeAllCorrectly(page: Page): Promise<void> {
  const state = await getState(page);
  for (const phrase of state.phrasesInScenario) {
    await placePhrase(page, phrase.id, correctCellFor(phrase));
  }
}
