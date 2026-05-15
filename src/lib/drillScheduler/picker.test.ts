// src/lib/drillScheduler/picker.test.ts

import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";
import { pickDueCards, type CardState } from "./picker";

const NOW = new Date("2026-05-15T12:00:00.000Z");

function card(
  topicId: string,
  termId: string,
  boxLevel: number,
  msFromNow: number | null,
): CardState {
  return {
    topicId,
    termId,
    boxLevel,
    nextReviewDate:
      msFromNow === null
        ? null
        : Timestamp.fromMillis(NOW.getTime() + msFromNow),
  };
}

describe("pickDueCards: filtering", () => {
  it("includes cards with nextReviewDate at exactly now", () => {
    const cards = [card("t1", "x", 0, 0)];
    expect(pickDueCards(cards, NOW)).toHaveLength(1);
  });

  it("includes cards with nextReviewDate in the past", () => {
    const cards = [card("t1", "x", 0, -1000 * 60 * 60)];
    expect(pickDueCards(cards, NOW)).toHaveLength(1);
  });

  it("excludes cards with nextReviewDate in the future", () => {
    const cards = [card("t1", "x", 0, 1000 * 60 * 60)];
    expect(pickDueCards(cards, NOW)).toHaveLength(0);
  });

  it("excludes graduated cards (nextReviewDate null)", () => {
    const cards = [card("t1", "x", 4, null)];
    expect(pickDueCards(cards, NOW)).toHaveLength(0);
  });
});

describe("pickDueCards: sorting", () => {
  it("returns due cards sorted earliest-due first", () => {
    const cards = [
      card("t1", "newer", 1, -1000),
      card("t1", "oldest", 0, -100_000),
      card("t1", "middle", 2, -50_000),
    ];
    const due = pickDueCards(cards, NOW);
    expect(due.map((c) => c.termId)).toEqual(["oldest", "middle", "newer"]);
  });

  it("returns empty array when nothing is due", () => {
    const cards = [
      card("t1", "future-a", 0, 10_000),
      card("t1", "graduated", 4, null),
    ];
    expect(pickDueCards(cards, NOW)).toEqual([]);
  });
});
