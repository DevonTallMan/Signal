// src/lib/sort-and-match/testApi.ts
//
// Test API for the Sort & Match component.
//
// Exposes a minimal surface on `window.__signalSortAndMatchTestApi`
// that lets E2E tests (Playwright) drive the component without
// performing real drag-and-drop interactions. dnd-kit's PointerSensor
// relies on a stream of pointermove events that Playwright's
// drag-and-drop API does not reliably emit; the resulting drops
// register against the source droppable rather than the target.
// Driving state directly via the test API sidesteps that fragility.
//
// Production safety: registerTestApi/unregisterTestApi no-op when
// `import.meta.env.DEV` is false, so the API never reaches end users
// in production builds.
//
// Property name (`__signalSortAndMatchTestApi`) is deliberately
// distinct from Risk Classifier's `__signalTestApi` to avoid
// TypeScript global-Window declaration-merge conflicts when both
// modules ship in the same project.
//
// Sprint 3 Increment 3.6 enabling infrastructure. Mirrors the
// risk-classifier testApi.ts pattern.

export type Status =
  | "loading"
  | "placing"
  | "feedback"
  | "complete-correct"
  | "complete-with-help"
  | "session-complete";

export type Location = "N" | "E" | "I" | "pool";
export type Category = "N" | "E" | "I";

export interface PhraseRef {
  id: string;
  category: Category;
}

export interface TestApiSessionState {
  status: Status;
  sessionId: string | null;
  currentScenarioId: string | null;
  currentIndex: number;
  totalScenarios: number;
  correctCount: number;
  placements: Record<string, Location>;
  attemptNumber: number;
  phrasesInScenario: PhraseRef[];
}

export interface TestApiHandlers {
  placePhrase: (phraseId: string, location: Location) => void;
  clickCheck: () => void;
  clickContinue: () => void;
  clickReset: () => void;
  getSessionState: () => TestApiSessionState;
}

declare global {
  interface Window {
    __signalSortAndMatchTestApi?: TestApiHandlers;
  }
}

export function registerTestApi(handlers: TestApiHandlers): void {
  if (!import.meta.env.DEV) return;
  if (typeof window === "undefined") return;
  window.__signalSortAndMatchTestApi = handlers;
}

export function unregisterTestApi(): void {
  if (!import.meta.env.DEV) return;
  if (typeof window === "undefined") return;
  delete window.__signalSortAndMatchTestApi;
}
