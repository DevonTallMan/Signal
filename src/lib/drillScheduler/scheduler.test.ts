// src/lib/drillScheduler/scheduler.test.ts
//
// Spec-as-tests for nextState. Covers every transition in the Leitner
// algorithm locked by docs/sprint-6-scope.md Section 3.3 and 3.5.

import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";
import {
  nextState,
  isGraduated,
  LEITNER_INTERVALS_DAYS,
  FIRST_MISS_HOURS,
  type SchedulerState,
} from "./scheduler";

const NOW = new Date("2026-05-15T12:00:00.000Z");

function daysFromNow(n: number): number {
  return NOW.getTime() + n * 24 * 60 * 60 * 1000;
}

function hoursFromNow(n: number): number {
  return NOW.getTime() + n * 60 * 60 * 1000;
}

describe("nextState: first encounter (no prior state)", () => {
  it("first 'got' rating enqueues at box 0 with 1 day interval", () => {
    const s = nextState(null, "got", NOW);
    expect(s.boxLevel).toBe(0);
    expect(s.nextReviewDate?.toMillis()).toBe(daysFromNow(1));
  });

  it("first 'miss' rating enqueues at box 0 with 4 hour interval", () => {
    const s = nextState(null, "miss", NOW);
    expect(s.boxLevel).toBe(0);
    expect(s.nextReviewDate?.toMillis()).toBe(hoursFromNow(FIRST_MISS_HOURS));
  });
});

describe("nextState: 'got' rating advances box (non-graduated)", () => {
  it("box 0 + got -> box 1 with 3 day interval", () => {
    const prev: SchedulerState = { boxLevel: 0, nextReviewDate: Timestamp.fromMillis(NOW.getTime()) };
    const s = nextState(prev, "got", NOW);
    expect(s.boxLevel).toBe(1);
    expect(s.nextReviewDate?.toMillis()).toBe(daysFromNow(LEITNER_INTERVALS_DAYS[1]));
  });

  it("box 1 + got -> box 2 with 7 day interval", () => {
    const prev: SchedulerState = { boxLevel: 1, nextReviewDate: Timestamp.fromMillis(NOW.getTime()) };
    const s = nextState(prev, "got", NOW);
    expect(s.boxLevel).toBe(2);
    expect(s.nextReviewDate?.toMillis()).toBe(daysFromNow(LEITNER_INTERVALS_DAYS[2]));
  });

  it("box 2 + got -> box 3 with 21 day interval", () => {
    const prev: SchedulerState = { boxLevel: 2, nextReviewDate: Timestamp.fromMillis(NOW.getTime()) };
    const s = nextState(prev, "got", NOW);
    expect(s.boxLevel).toBe(3);
    expect(s.nextReviewDate?.toMillis()).toBe(daysFromNow(LEITNER_INTERVALS_DAYS[3]));
  });

  it("box 3 + got -> box 4 with 60 day interval", () => {
    const prev: SchedulerState = { boxLevel: 3, nextReviewDate: Timestamp.fromMillis(NOW.getTime()) };
    const s = nextState(prev, "got", NOW);
    expect(s.boxLevel).toBe(4);
    expect(s.nextReviewDate?.toMillis()).toBe(daysFromNow(LEITNER_INTERVALS_DAYS[4]));
  });
});

describe("nextState: graduation at box 4", () => {
  it("box 4 + got -> graduates (boxLevel 4, nextReviewDate null)", () => {
    const prev: SchedulerState = { boxLevel: 4, nextReviewDate: Timestamp.fromMillis(NOW.getTime()) };
    const s = nextState(prev, "got", NOW);
    expect(s.boxLevel).toBe(4);
    expect(s.nextReviewDate).toBeNull();
    expect(isGraduated(s)).toBe(true);
  });

  it("graduated card + got stays graduated", () => {
    const prev: SchedulerState = { boxLevel: 4, nextReviewDate: null };
    const s = nextState(prev, "got", NOW);
    expect(s.boxLevel).toBe(4);
    expect(s.nextReviewDate).toBeNull();
  });

  it("graduated card + miss re-enqueues at box 0 with 1 day interval", () => {
    const prev: SchedulerState = { boxLevel: 4, nextReviewDate: null };
    const s = nextState(prev, "miss", NOW);
    expect(s.boxLevel).toBe(0);
    expect(s.nextReviewDate?.toMillis()).toBe(daysFromNow(1));
    expect(isGraduated(s)).toBe(false);
  });
});

describe("nextState: 'miss' rating resets to box 0 + 1 day", () => {
  it("subsequent miss at box 0 -> box 0 + 1 day (not 4 hours)", () => {
    const prev: SchedulerState = { boxLevel: 0, nextReviewDate: Timestamp.fromMillis(NOW.getTime()) };
    const s = nextState(prev, "miss", NOW);
    expect(s.boxLevel).toBe(0);
    expect(s.nextReviewDate?.toMillis()).toBe(daysFromNow(1));
  });

  it("miss at box 3 resets to box 0 + 1 day", () => {
    const prev: SchedulerState = { boxLevel: 3, nextReviewDate: Timestamp.fromMillis(NOW.getTime()) };
    const s = nextState(prev, "miss", NOW);
    expect(s.boxLevel).toBe(0);
    expect(s.nextReviewDate?.toMillis()).toBe(daysFromNow(1));
  });
});

describe("nextState: rating sequence (acceptance check from scope doc)", () => {
  // docs/sprint-6-scope.md Section 4 Inc 6.1 done-when criterion:
  // "a manually-constructed sequence of (got, got, miss, got) ratings
  //  produces the expected box-level trajectory and nextReviewDate sequence."
  it("sequence (got, got, miss, got) traces box 0 -> 1 -> 2 -> 0 -> 1", () => {
    let state: SchedulerState | null = null;
    const outcomes = ["got", "got", "miss", "got"] as const;
    const expectedBoxes = [0, 1, 0, 1];
    outcomes.forEach((outcome, i) => {
      state = nextState(state, outcome, NOW);
      expect(state.boxLevel).toBe(expectedBoxes[i]);
    });
  });
});
