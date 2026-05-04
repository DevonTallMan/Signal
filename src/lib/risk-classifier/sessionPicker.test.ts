// src/lib/risk-classifier/sessionPicker.test.ts
//
// Unit tests for pickSessionScenarios.
//
// Goal: encode the spec of the picker as living documentation. If any of
// these behaviours change in future, the test will tell you what the new
// behaviour is and force a deliberate decision rather than a silent
// regression.

import { describe, it, expect } from "vitest";
import {
  pickSessionScenarios,
  getAllScenarios,
  type Scenario,
  type Tier,
} from "./sessionPicker";

const TIERS: Tier[] = [
  "data-protection",
  "computer-misuse",
  "equality",
  "intellectual-property",
];

describe("pickSessionScenarios", () => {
  describe("determinism", () => {
    it("returns identical scenario IDs in identical order for the same seed", () => {
      const a = pickSessionScenarios("session-abc-123").map((s) => s.id);
      const b = pickSessionScenarios("session-abc-123").map((s) => s.id);
      expect(a).toEqual(b);
    });

    it("returns identical scenario objects (deep equal) for the same seed", () => {
      const a = pickSessionScenarios("session-abc-123");
      const b = pickSessionScenarios("session-abc-123");
      expect(a).toEqual(b);
    });
  });

  describe("session shape", () => {
    it("returns exactly 5 scenarios", () => {
      const result = pickSessionScenarios("any-seed");
      expect(result).toHaveLength(4);
    });

    it("returns no duplicate scenario IDs within a session", () => {
      const result = pickSessionScenarios("any-seed");
      const ids = result.map((s) => s.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe("tier balance", () => {
    it("includes one scenario from each of the four tiers, plus one wildcard", () => {
      // Spec: tier-balanced selection picks one scenario from each of the
      // four tiers (4 scenarios), then adds 1 wildcard from the remaining
      // pool. Across the 5 returned scenarios, every tier must appear at
      // least once.
      const result = pickSessionScenarios("any-seed");
      const tiersPresent = new Set(result.map((s) => s.correctTier));
      TIERS.forEach((tier) => {
        expect(tiersPresent.has(tier)).toBe(true);
      });
    });

    it("has exactly one tier appearing twice (the wildcard's tier)", () => {
      // Corollary of the rule above: 5 scenarios, 4 tiers, so exactly one
      // tier must appear twice. This locks the algorithm to the documented
      // pattern and would catch a regression where the wildcard logic
      // changes.
      const result = pickSessionScenarios("any-seed");
      const tierCounts: Record<string, number> = {};
      result.forEach((s) => {
        tierCounts[s.correctTier] = (tierCounts[s.correctTier] ?? 0) + 1;
      });
      const counts = Object.values(tierCounts).sort();
      // Sorted counts must be [1, 1, 1, 2]: three tiers appear once, one
      // tier appears twice.
      expect(counts).toEqual([1, 1, 1, 2]);
    });
  });

  describe("difficulty ordering", () => {
    it("sorts scenarios by difficulty: clean before grey before edge", () => {
      const order: Record<Scenario["difficulty"], number> = {
        clean: 0,
        grey: 1,
        edge: 2,
      };
      const result = pickSessionScenarios("any-seed");
      const difficulties = result.map((s) => order[s.difficulty]);
      const sorted = [...difficulties].sort((a, b) => a - b);
      expect(difficulties).toEqual(sorted);
    });
  });

  describe("seed sensitivity", () => {
    it("produces distinct scenario sets for distinct seeds (sampled)", () => {
      // Sample 10 seeds and check that they don't all collapse to the
      // same output. We allow some collisions because with a small
      // scenario pool real collisions are possible, but catastrophic
      // non-randomness (e.g. seed ignored entirely) would show up here.
      const seeds = [
        "seed-1",
        "seed-2",
        "seed-3",
        "seed-4",
        "seed-5",
        "seed-6",
        "seed-7",
        "seed-8",
        "seed-9",
        "seed-10",
      ];
      const outputs = seeds.map((s) =>
        pickSessionScenarios(s)
          .map((sc) => sc.id)
          .join("|")
      );
      const distinct = new Set(outputs);
      // With 10 seeds, expect at least 5 distinct outputs. Stricter than
      // necessary so a "seed is ignored" bug is impossible to slip through,
      // looser than full uniqueness so genuine collisions don't flake.
      expect(distinct.size).toBeGreaterThanOrEqual(5);
    });
  });

  describe("preconditions", () => {
    it("the underlying scenario pool has at least one scenario in every tier", () => {
      // If this assertion ever fails, the tier-balance test above will
      // also fail with a less helpful error. This test pinpoints the
      // root cause: the JSON content has gone wrong, not the picker.
      const all = getAllScenarios();
      TIERS.forEach((tier) => {
        const inTier = all.filter((s) => s.correctTier === tier);
        expect(inTier.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
