// src/lib/drillScheduler/firestore.test.ts
//
// Tests the pure transformation computeNewDocData. The runTransaction
// wiring in saveDrillRatingWithScheduler is a thin shim and is covered
// end-to-end by the Inc 6.2 Playwright suite once the /review route lands.

import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";
import { computeNewDocData } from "./firestore";

const NOW = new Date("2026-05-15T12:00:00.000Z");
const NOW_MS = NOW.getTime();

function legacyDoc(overrides: Record<string, unknown> = {}) {
  return {
    topicId: "4-1-1-data-protection",
    termId: "dpa-2018",
    outcome: "got",
    ratedAt: Timestamp.fromMillis(NOW_MS - 1000 * 60 * 60 * 24 * 7),
    source: "signal",
    ...overrides,
  };
}

function extendedDoc(overrides: Record<string, unknown> = {}) {
  return {
    ...legacyDoc(),
    boxLevel: 1,
    nextReviewDate: Timestamp.fromMillis(NOW_MS + 1000 * 60 * 60 * 24 * 3),
    firstRatedAt: Timestamp.fromMillis(NOW_MS - 1000 * 60 * 60 * 24 * 10),
    lastRatedAt: Timestamp.fromMillis(NOW_MS - 1000 * 60 * 60 * 24 * 7),
    history: [
      { outcome: "got", at: Timestamp.fromMillis(NOW_MS - 1000 * 60 * 60 * 24 * 7) },
    ],
    ...overrides,
  };
}

describe("computeNewDocData: first encounter (no existing doc)", () => {
  it("writes box 0 + 1 day for first 'got'", () => {
    const d = computeNewDocData(null, "topic-a", "term-a", "got", NOW);
    expect(d.boxLevel).toBe(0);
    expect(d.nextReviewDate?.toMillis()).toBe(NOW_MS + 24 * 60 * 60 * 1000);
    expect(d.firstRatedAt.toMillis()).toBe(NOW_MS);
    expect(d.lastRatedAt.toMillis()).toBe(NOW_MS);
    expect(d.history).toHaveLength(1);
    expect(d.history[0].outcome).toBe("got");
  });

  it("writes box 0 + 4 hours for first 'miss'", () => {
    const d = computeNewDocData(null, "topic-a", "term-a", "miss", NOW);
    expect(d.boxLevel).toBe(0);
    expect(d.nextReviewDate?.toMillis()).toBe(NOW_MS + 4 * 60 * 60 * 1000);
  });
});

describe("computeNewDocData: legacy doc fallback (Risk 3)", () => {
  it("treats legacy doc (no boxLevel) as box 0 + now; advances on got", () => {
    const d = computeNewDocData(legacyDoc(), "topic-a", "term-a", "got", NOW);
    expect(d.boxLevel).toBe(1);
    expect(d.nextReviewDate?.toMillis()).toBe(NOW_MS + 3 * 24 * 60 * 60 * 1000);
  });

  it("preserves the legacy ratedAt as firstRatedAt when firstRatedAt is missing", () => {
    const legacyRatedAt = Timestamp.fromMillis(NOW_MS - 1000 * 60 * 60 * 24 * 7);
    const d = computeNewDocData(legacyDoc({ ratedAt: legacyRatedAt }), "topic-a", "term-a", "got", NOW);
    expect(d.firstRatedAt.toMillis()).toBe(legacyRatedAt.toMillis());
  });
});

describe("computeNewDocData: extended doc updates", () => {
  it("advances boxLevel and updates nextReviewDate on 'got'", () => {
    const d = computeNewDocData(extendedDoc({ boxLevel: 2 }), "topic-a", "term-a", "got", NOW);
    expect(d.boxLevel).toBe(3);
    expect(d.nextReviewDate?.toMillis()).toBe(NOW_MS + 21 * 24 * 60 * 60 * 1000);
  });

  it("appends to history and caps at 10 entries", () => {
    const tenEntries = Array.from({ length: 10 }, (_, i) => ({
      outcome: "got" as const,
      at: Timestamp.fromMillis(NOW_MS - (i + 1) * 1000 * 60 * 60),
    }));
    const d = computeNewDocData(extendedDoc({ history: tenEntries }), "topic-a", "term-a", "miss", NOW);
    expect(d.history).toHaveLength(10);
    expect(d.history[d.history.length - 1].outcome).toBe("miss");
    expect(d.history[d.history.length - 1].at.toMillis()).toBe(NOW_MS);
  });

  it("graduates: box 4 + got writes boxLevel 4 with NO nextReviewDate field", () => {
    const d = computeNewDocData(extendedDoc({ boxLevel: 4 }), "topic-a", "term-a", "got", NOW);
    expect(d.boxLevel).toBe(4);
    expect("nextReviewDate" in d).toBe(false);
  });

  it("preserves firstRatedAt across ratings", () => {
    const originalFirst = Timestamp.fromMillis(NOW_MS - 1000 * 60 * 60 * 24 * 30);
    const d = computeNewDocData(extendedDoc({ firstRatedAt: originalFirst }), "topic-a", "term-a", "got", NOW);
    expect(d.firstRatedAt.toMillis()).toBe(originalFirst.toMillis());
  });
});
