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
 * Selection: tier-balanced (one from each of the four tiers) plus one
 * wildcard. Within-session order: tier-interleaved, so that no two
 * adjacent scenarios share a legislation tier. This replaces the
 * earlier difficulty-progressive order (clean -> grey -> edge) per
 * the 2026-05-15 design conversation, which named blocked (same-tier
 * adjacent) practice as a retention liability and interleaving as
 * the higher-leverage cheap change. Roediger and Karpicke on spacing,
 * Rohrer and Taylor on interleaving.
 *
 * A soft difficulty preference is preserved *within* a tier: when a
 * tier contributes two scenarios (the doubled tier), the easier of
 * the two is placed first. This keeps the within-tier progression
 * intact without dominating the interleaving order.
 *
 * Selection is deterministic by seed; passing a different seed gives
 * a different set. For Increment 5, the seed is the session ID, so
 * each Firestore session sees a different but reproducible set.
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

  return interleaveByTier(selected, seed, hashChar);
}

/**
 * Greedy interleaving: at each position, pick a scenario from a tier
 * that differs from the previous position's tier, preferring tiers
 * with the most remaining scenarios (so the doubled tier gets placed
 * with room to spread out). Within a tier, easier scenarios come
 * before harder ones.
 */
function interleaveByTier(
  scenarios: Scenario[],
  seed: string,
  hashChar: (s: string, salt: number) => number,
): Scenario[] {
  const difficultyOrder: Record<Scenario["difficulty"], number> = {
    clean: 0,
    grey: 1,
    edge: 2,
  };

  // Bucket the input by tier and sort each bucket by difficulty so the
  // soft within-tier easier-first preference is preserved when the
  // greedy walk pulls from a tier.
  const byTier: Record<Tier, Scenario[]> = {
    "data-protection": [],
    "computer-misuse": [],
    equality: [],
    "intellectual-property": [],
  };
  scenarios.forEach((s) => byTier[s.correctTier].push(s));
  (Object.keys(byTier) as Tier[]).forEach((t) => {
    byTier[t].sort(
      (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty],
    );
  });

  const result: Scenario[] = [];
  let lastTier: Tier | null = null;
  const totalToPlace = scenarios.length;

  while (result.length < totalToPlace) {
    const tiersWithItems = (Object.keys(byTier) as Tier[]).filter(
      (t) => byTier[t].length > 0,
    );
    // Prefer tiers different from the last placed tier. If only the
    // last tier has items left (a degenerate state that should not be
    // reachable for a 5-pool with at most one doubled tier), fall back
    // to taking from it; the alternative is dropping items.
    const candidates =
      tiersWithItems.filter((t) => t !== lastTier).length > 0
        ? tiersWithItems.filter((t) => t !== lastTier)
        : tiersWithItems;

    // Pick the tier with the most remaining items. This puts the
    // doubled tier in early and pushes its second item naturally to a
    // non-adjacent position later in the walk.
    const maxCount = Math.max(...candidates.map((t) => byTier[t].length));
    const topTiers = candidates
      .filter((t) => byTier[t].length === maxCount)
      .sort();

    // Tiebreak deterministically by seed + position offset.
    const pickIdx = hashChar(seed, result.length + 200) % topTiers.length;
    const pickedTier = topTiers[pickIdx];

    const scenario = byTier[pickedTier].shift();
    if (!scenario) break;
    result.push(scenario);
    lastTier = pickedTier;
  }

  return result;
}
