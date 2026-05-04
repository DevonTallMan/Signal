// src/lib/risk-classifier/sessionPicker.ts
//
// Pure scenario selection logic for the UK Legislation Classifier.
//
// Extracted from game.ts in Sprint 2.5 to keep this logic decoupled from
// Phaser. Pure functions only, no I/O, no globals, no Phaser. Safe to
// import from vitest unit tests without dragging Phaser into the test
// runtime.

import scenariosData from "../../data/risk-classifier/scenarios.json";

export type Tier =
  | "data-protection"
  | "computer-misuse"
  | "equality"
  | "intellectual-property";

export interface Scenario {
  id: string;
  difficulty: "clean" | "grey" | "edge";
  scenario: string;
  correctTier: Tier;
  examinerReasoning: string;
  commonMistakes: Array<{ tier: Tier; why: string }>;
  actReference: string;
  specReference: string;
}

interface ScenariosFile {
  _meta: Record<string, unknown>;
  _schema: Record<string, unknown>;
  scenarios: Scenario[];
}

const ALL_SCENARIOS = (scenariosData as ScenariosFile).scenarios;

export function getAllScenarios(): Scenario[] {
  return ALL_SCENARIOS;
}

/**
 * Pick 5 scenarios for a single session.
 *
 * Algorithm: tier-balanced (one from each of the four tiers) plus one
 * wildcard. Within-session order is difficulty-progressive: clean first,
 * grey middle, edge last where possible.
 *
 * Selection is deterministic by seed; passing a different seed gives a
 * different set. For Increment 5, the seed is the session ID, so each
 * Firestore session sees a different but reproducible set.
 */
export function pickSessionScenarios(seed: string): Scenario[] {
  // Group scenarios by tier
  const byTier: Record<Tier, Scenario[]> = {
    "data-protection": [],
    "computer-misuse": [],
    equality: [],
    "intellectual-property": [],
  };
  ALL_SCENARIOS.forEach((s) => {
    byTier[s.correctTier].push(s);
  });

  // Deterministic pseudo-random helper: integer hash from seed string
  function hashChar(s: string, salt: number): number {
    let h = salt;
    for (let i = 0; i < s.length; i += 1) {
      h = (h * 31 + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  // For each tier, pick one scenario deterministically based on seed
  const selected: Scenario[] = [];
  const tiers: Tier[] = [
    "data-protection",
    "computer-misuse",
    "equality",
    "intellectual-property",
  ];
  tiers.forEach((tier, idx) => {
    const candidates = byTier[tier];
    if (candidates.length === 0) return;
    const pickIdx = hashChar(seed, idx + 1) % candidates.length;
    selected.push(candidates[pickIdx]);
  });

  // Wildcard: pick from all scenarios not already selected
  const selectedIds = new Set(selected.map((s) => s.id));
  const remaining = ALL_SCENARIOS.filter((s) => !selectedIds.has(s.id));
  if (remaining.length > 0) {
    const wildcardIdx = hashChar(seed, 99) % remaining.length;
    selected.push(remaining[wildcardIdx]);
  }

  // Sort by difficulty: clean -> grey -> edge
  const difficultyOrder: Record<Scenario["difficulty"], number> = {
    clean: 0,
    grey: 1,
    edge: 2,
  };
  selected.sort(
    (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  );

  return selected;
}
