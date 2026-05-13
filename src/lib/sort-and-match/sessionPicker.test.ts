// src/lib/sort-and-match/sessionPicker.test.ts
//
// Unit tests for the Sort & Match session picker.
// Mirrors the pattern of src/lib/risk-classifier/sessionPicker.test.ts.

import { describe, it, expect } from "vitest";
import { pickSessionScenarios } from "./sessionPicker";

interface TestItem {
  id: string;
}

const items: TestItem[] = [
  { id: "a" },
  { id: "b" },
  { id: "c" },
  { id: "d" },
  { id: "e" },
];

describe("pickSessionScenarios", () => {
  it("returns empty array when available is empty", () => {
    expect(pickSessionScenarios("seed", [], 3)).toEqual([]);
  });

  it("returns empty array when desiredCount is 0", () => {
    expect(pickSessionScenarios("seed", items, 0)).toEqual([]);
  });

  it("returns empty array when desiredCount is negative", () => {
    expect(pickSessionScenarios("seed", items, -1)).toEqual([]);
  });

  it("returns all available when desired > available", () => {
    const result = pickSessionScenarios("seed", items, 10);
    expect(result.length).toBe(items.length);
    expect(result.map((i) => i.id).sort()).toEqual(
      items.map((i) => i.id).sort()
    );
  });

  it("returns desired count when desired < available", () => {
    const result = pickSessionScenarios("seed", items, 3);
    expect(result.length).toBe(3);
  });

  it("returns desired count when desired equals available", () => {
    const result = pickSessionScenarios("seed", items, items.length);
    expect(result.length).toBe(items.length);
  });

  it("is deterministic for the same seed", () => {
    const a = pickSessionScenarios("test-seed-1", items, 3);
    const b = pickSessionScenarios("test-seed-1", items, 3);
    expect(a).toEqual(b);
  });

  it("produces different orderings for different seeds", () => {
    // Probabilistic test. With 5 items and 5 distinct seeds, the chance of
    // every seed producing the same order is vanishingly small.
    const seeds = ["seed-a", "seed-b", "seed-c", "seed-d", "seed-e"];
    const orderings = seeds.map((s) =>
      pickSessionScenarios(s, items, items.length)
        .map((i) => i.id)
        .join("")
    );
    const uniqueOrderings = new Set(orderings);
    expect(uniqueOrderings.size).toBeGreaterThan(1);
  });

  it("preserves all original items (no duplicates, no losses)", () => {
    const result = pickSessionScenarios("seed", items, items.length);
    const seen = new Set(result.map((i) => i.id));
    expect(seen.size).toBe(items.length);
    for (const item of items) {
      expect(seen.has(item.id)).toBe(true);
    }
  });

  it("handles a single available scenario gracefully", () => {
    const single = [{ id: "only" }];
    const result = pickSessionScenarios("seed", single, 3);
    expect(result).toEqual([{ id: "only" }]);
  });
});
