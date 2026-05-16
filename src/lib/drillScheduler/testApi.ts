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
  // Test-only seed method. Bypasses the scheduler's nextState
  // computation and writes a card document directly with the desired
  // box level and nextReviewDate. Used by Playwright specs that need
  // past-due cards to drive the rate UX. Page.clock.install conflicts
  // with Firebase auth token validation (tokens carry server-side
  // iat/exp claims that the SDK validates against the local clock;
  // mocking the clock breaks token refresh), so clock-mocking is not
  // a viable substitute.
  //
  // Not part of scope Section 3.7's named API surface; added as a
  // deferred Inc 6.2 follow-up to satisfy the "user can rate each
  // one" done-when criterion at full UI-drive fidelity. Production
  // safety is preserved by the import.meta.env.DEV gate in
  // registerDrillSchedulerTestApi.
  seedCardWithDueDate: (
    topicId: string,
    termId: string,
    boxLevel: number,
    nextReviewDateIso: string | null,
  ) => Promise<void>;
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
