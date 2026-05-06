// src/lib/risk-classifier/testApi.ts
//
// Test API for the Risk Classifier component.
//
// Exposes a minimal surface on `window.__signalTestApi` that lets E2E
// tests (e.g. Playwright) drive the component without finding or
// interacting with Phaser canvas elements directly.
//
// Production safety: all exported functions no-op when
// `import.meta.env.DEV` is false, so the API never reaches end users
// in production builds.
//
// Sprint 2.5 Increment 2 enabling infrastructure. The Playwright tests
// that consume this API ship in a follow-up PR.

import type { Scenario, Tier } from "./game";

type Status =
  | "initialising"
  | "ready"
  | "correct"
  | "incorrect"
  | "session-complete"
  | "error";

export interface TestApiSessionState {
  status: Status;
  currentScenario: Scenario | null;
  sessionId: string | null;
  currentIndex: number;
  correctCount: number;
  totalScenarios: number;
  completionTimeMs: number | null;
}

export interface TestApiHandlers {
  clickTier: (tier: Tier) => void;
  continue: () => Promise<void>;
  getSessionState: () => TestApiSessionState;
}

declare global {
  interface Window {
    __signalTestApi?: TestApiHandlers;
  }
}

export function registerTestApi(handlers: TestApiHandlers): void {
  if (!import.meta.env.DEV) return;
  if (typeof window === "undefined") return;
  window.__signalTestApi = handlers;
}

export function unregisterTestApi(): void {
  if (!import.meta.env.DEV) return;
  if (typeof window === "undefined") return;
  delete window.__signalTestApi;
}

