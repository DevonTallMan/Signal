// src/lib/drillScheduler/testApi.ts
//
// Test API for the drill scheduler. Exposes a minimal surface on
// window.__signalDrillSchedulerTestApi that Playwright tests use to
// drive the /review surface without depending on Firestore admin
// credentials. Production safety: the API only registers when
// import.meta.env.DEV is true, so it never reaches end users.
//
// Surface per docs/sprint-6-scope.md Section 3.7.

import type { DrillOutcome } from "./scheduler";

export interface DrillSchedulerTestApiHandlers {
  enqueueCard: (
    topicId: string,
    termId: string,
    outcome: DrillOutcome,
  ) => Promise<void>;
  getDueCards: (dateIso: string) => Promise<
    Array<{
      topicId: string;
      termId: string;
      boxLevel: number;
      nextReviewDate: string;
    }>
  >;
  getCardState: (
    topicId: string,
    termId: string,
  ) => Promise<
    | { boxLevel: number; nextReviewDate: string | null }
    | null
  >;
}

declare global {
  interface Window {
    __signalDrillSchedulerTestApi?: DrillSchedulerTestApiHandlers;
  }
}

export function registerDrillSchedulerTestApi(
  handlers: DrillSchedulerTestApiHandlers,
): void {
  if (!import.meta.env.DEV) return;
  if (typeof window === "undefined") return;
  window.__signalDrillSchedulerTestApi = handlers;
}

export function unregisterDrillSchedulerTestApi(): void {
  if (!import.meta.env.DEV) return;
  if (typeof window === "undefined") return;
  delete window.__signalDrillSchedulerTestApi;
}
