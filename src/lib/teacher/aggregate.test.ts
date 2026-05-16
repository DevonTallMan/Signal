// src/lib/teacher/aggregate.test.ts
//
// Unit tests for the pure aggregation helpers used by the teacher
// dashboard. No emulator dependency.

import { describe, it, expect } from "vitest";
import {
  summariseStudent,
  formatLastSeen,
  type DrillRatingDoc,
  type ActivitySessionDoc,
} from "./aggregate";

const ts = (ms: number) => ({ toMillis: () => ms });

describe("summariseStudent", () => {
  it("empty input returns zeros and null lastSeen", () => {
    const s = summariseStudent([], []);
    expect(s.cardsRated).toBe(0);
    expect(s.cardsInQueue).toBe(0);
    expect(s.cardsGraduated).toBe(0);
    expect(s.sessionsStarted).toBe(0);
    expect(s.sessionsCompleted).toBe(0);
    expect(s.lastSeenMs).toBeNull();
  });

  it("counts cards rated", () => {
    const ratings: DrillRatingDoc[] = [
      { topicId: "t1", termId: "a", outcome: "got" },
      { topicId: "t1", termId: "b", outcome: "miss" },
      { topicId: "t2", termId: "c", outcome: "got" },
    ];
    const s = summariseStudent(ratings, []);
    expect(s.cardsRated).toBe(3);
  });

  it("graduated cards reach box 4; lower boxes stay in queue", () => {
    const ratings: DrillRatingDoc[] = [
      { topicId: "t1", termId: "a", outcome: "got", boxLevel: 0 },
      { topicId: "t1", termId: "b", outcome: "got", boxLevel: 2 },
      { topicId: "t1", termId: "c", outcome: "got", boxLevel: 4 },
      { topicId: "t1", termId: "d", outcome: "got", boxLevel: 4 },
    ];
    const s = summariseStudent(ratings, []);
    expect(s.cardsGraduated).toBe(2);
    expect(s.cardsInQueue).toBe(2);
  });

  it("legacy ratings without boxLevel count as in queue", () => {
    const ratings: DrillRatingDoc[] = [
      { topicId: "t1", termId: "a", outcome: "got" },
      { topicId: "t1", termId: "b", outcome: "got" },
    ];
    const s = summariseStudent(ratings, []);
    expect(s.cardsGraduated).toBe(0);
    expect(s.cardsInQueue).toBe(2);
  });

  it("counts started vs completed sessions", () => {
    const sessions: ActivitySessionDoc[] = [
      { startedAt: ts(1000), completedAt: null },
      { startedAt: ts(2000), completedAt: ts(3000) },
      { startedAt: ts(4000), completedAt: ts(5000) },
    ];
    const s = summariseStudent([], sessions);
    expect(s.sessionsStarted).toBe(3);
    expect(s.sessionsCompleted).toBe(2);
  });

  it("lastSeenMs is the max across all timestamps", () => {
    const ratings: DrillRatingDoc[] = [
      { topicId: "t1", termId: "a", outcome: "got", ratedAt: ts(100), lastRatedAt: ts(500) },
      { topicId: "t1", termId: "b", outcome: "got", ratedAt: ts(200) },
    ];
    const sessions: ActivitySessionDoc[] = [
      { startedAt: ts(300), completedAt: ts(800) },
    ];
    const s = summariseStudent(ratings, sessions);
    expect(s.lastSeenMs).toBe(800);
  });

  it("lastRatedAt takes precedence over ratedAt when both present", () => {
    const ratings: DrillRatingDoc[] = [
      { topicId: "t1", termId: "a", outcome: "got", ratedAt: ts(100), lastRatedAt: ts(900) },
    ];
    const s = summariseStudent(ratings, []);
    expect(s.lastSeenMs).toBe(900);
  });

  it("falls back to startedAt when session has no completedAt", () => {
    const sessions: ActivitySessionDoc[] = [
      { startedAt: ts(1234), completedAt: null },
    ];
    const s = summariseStudent([], sessions);
    expect(s.lastSeenMs).toBe(1234);
  });
});

describe("formatLastSeen", () => {
  const now = 1_000_000_000;

  it("null returns 'never'", () => {
    expect(formatLastSeen(null, now)).toBe("never");
  });

  it("under 1 hour returns minutes ago", () => {
    expect(formatLastSeen(now - 30 * 60_000, now)).toBe("30m ago");
  });

  it("under 1 day returns hours ago", () => {
    expect(formatLastSeen(now - 5 * 60 * 60_000, now)).toBe("5h ago");
  });

  it("under 30 days returns days ago", () => {
    expect(formatLastSeen(now - 10 * 24 * 60 * 60_000, now)).toBe("10d ago");
  });

  it("over 30 days returns months ago", () => {
    expect(formatLastSeen(now - 60 * 24 * 60 * 60_000, now)).toBe("2mo ago");
  });

  it("under 1 minute clamps to 1m ago", () => {
    expect(formatLastSeen(now - 30_000, now)).toBe("1m ago");
  });
});
