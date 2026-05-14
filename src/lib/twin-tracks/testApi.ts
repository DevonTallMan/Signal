// src/lib/twin-tracks/testApi.ts
//
// Test API for the Twin Tracks component.
//
// Exposes a minimal surface on `window.__signalTwinTracksTestApi` that lets
// E2E tests (Playwright) drive the component without performing real
// drag-and-drop interactions. @dnd-kit/core's PointerSensor relies on a
// stream of pointermove events that Playwright's drag-and-drop API does not
// reliably emit; the resulting drops register against the source droppable
// rather than the target. Driving state directly via the test API sidesteps
// that fragility.
//
// Production safety: registerTestApi/unregisterTestApi no-op when
// `import.meta.env.DEV` is false, so the API never reaches end users in
// production builds.
//
// Property name (`__signalTwinTracksTestApi`) is deliberately distinct from
// Risk Classifier's `__signalTestApi` and Sort & Match's
// `__signalSortAndMatchTestApi` to avoid TypeScript global-Window
// declaration-merge conflicts when all three modules ship in the same
// project.
//
// Sprint 4 Increment 4.6 enabling infrastructure. Mirrors the Sort & Match
// testApi.ts pattern.

export type Status =
  | "loading"
  | "placing"
  | "round-complete"
  | "session-complete";

export type Track = "positive" | "negative";
export type Slot = "introduce" | "explain" | "develop";
export type CellId = `${Track}-${Slot}`;
export type Location = "pool" | CellId;

export interface PhraseRef {
  id: string;
  track: Track;
  slot: Slot;
}

export interface TestApiSessionState {
  status: Status;
  sessionId: string | null;
  currentScenarioId: string | null;
  currentIndex: number;
  totalScenarios: number;
  correctCount: number;
  withHelpCount: number;
  placements: Record<string, Location>;
  locked: Record<string, boolean>;
  wrongDropCount: Record<string, number>;
  revealed: Record<string, boolean>;
  phrasesInScenario: PhraseRef[];
}

export interface TestApiHandlers {
  placePhrase: (phraseId: string, location: Location) => void;
  clickContinue: () => void;
  clickStartNewSession: () => void;
  getSessionState: () => TestApiSessionState;
}

declare global {
  interface Window {
    __signalTwinTracksTestApi?: TestApiHandlers;
  }
}

export function registerTestApi(handlers: TestApiHandlers): void {
  if (!import.meta.env.DEV) return;
  if (typeof window === "undefined") return;
  window.__signalTwinTracksTestApi = handlers;
}

export function unregisterTestApi(): void {
  if (!import.meta.env.DEV) return;
  if (typeof window === "undefined") return;
  delete window.__signalTwinTracksTestApi;
}
