// src/lib/drillScheduler/scheduler.ts
//
// Pure Leitner scheduler logic. Given the previous scheduler state for a
// drill card and the rating the student just gave it, returns the next
// scheduler state. No Firestore, no time-of-day dependencies; "now" is a
// parameter so tests are deterministic.
//
// Locked decisions from docs/sprint-6-scope.md Section 3.3 and 3.5:
//   Box intervals (days):    0 -> 1, 1 -> 3, 2 -> 7, 3 -> 21, 4 -> 60
//   First-encounter miss:    box 0, next review now + 4 hours
//   Subsequent miss:         box 0, next review now + 1 day
//   Got at box N (N < 4):    box N+1, next review now + intervals[N+1]
//   Got at box 4:            graduates (boxLevel stays 4, nextReviewDate null)
//   Miss on a graduated card: re-enqueues at box 0 + 1 day

import { Timestamp } from "firebase/firestore";

export type DrillOutcome = "got" | "miss";

export type SchedulerState = {
  boxLevel: number;
  nextReviewDate: Timestamp | null;
};

export const LEITNER_INTERVALS_DAYS = [1, 3, 7, 21, 60] as const;
export const FIRST_MISS_HOURS = 4;
export const MAX_BOX_LEVEL = 4;

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

function addMs(now: Date, ms: number): Timestamp {
  return Timestamp.fromDate(new Date(now.getTime() + ms));
}

export function nextState(
  prev: SchedulerState | null,
  outcome: DrillOutcome,
  now: Date,
): SchedulerState {
  if (prev === null) {
    const offsetMs =
      outcome === "miss"
        ? FIRST_MISS_HOURS * MS_PER_HOUR
        : LEITNER_INTERVALS_DAYS[0] * MS_PER_DAY;
    return { boxLevel: 0, nextReviewDate: addMs(now, offsetMs) };
  }

  if (outcome === "miss") {
    return {
      boxLevel: 0,
      nextReviewDate: addMs(now, LEITNER_INTERVALS_DAYS[0] * MS_PER_DAY),
    };
  }

  if (prev.boxLevel >= MAX_BOX_LEVEL) {
    return { boxLevel: MAX_BOX_LEVEL, nextReviewDate: null };
  }

  const newBoxLevel = prev.boxLevel + 1;
  return {
    boxLevel: newBoxLevel,
    nextReviewDate: addMs(now, LEITNER_INTERVALS_DAYS[newBoxLevel] * MS_PER_DAY),
  };
}

export function isGraduated(state: SchedulerState): boolean {
  return state.boxLevel === MAX_BOX_LEVEL && state.nextReviewDate === null;
}
