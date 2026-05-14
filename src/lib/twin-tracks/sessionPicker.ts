// src/lib/twin-tracks/sessionPicker.ts
//
// Deterministic seeded picker for Twin Tracks session scenarios.
//
// Mirrors src/lib/sort-and-match/sessionPicker.ts directly (the function
// is the same plain seeded shuffle). The per-activity copy follows the
// codebase convention (Risk Classifier and Sort & Match each have their
// own sessionPicker.ts) and allows future divergence if Twin Tracks
// grows custom balancing heuristics, e.g. by question subtype or
// content area, without needing to refactor a shared utility.
//
// Inc 4.4 scope: scenario picking only. No balancing logic; Twin Tracks
// scenarios are not yet differentiated by difficulty or sub-type. With
// one scenario in the pool today (Hospital Remote Access), the picker
// returns N=1 against SESSION_LENGTH=3. Additional Twin Tracks scenarios
// will be content-only PRs post-sprint.

/**
 * Pick up to `desiredCount` scenarios from `available`, shuffled
 * deterministically by `seed`.
 *
 * If `available.length < desiredCount`, returns all available scenarios
 * (still shuffled). This is the graceful path while the scenario pool
 * is small.
 */
export function pickSessionScenarios<T extends { id: string }>(
  seed: string,
  available: T[],
  desiredCount: number
): T[] {
  if (available.length === 0) return [];
  if (desiredCount <= 0) return [];

  const rand = mulberry32(hashSeed(seed));
  const shuffled = shuffle(available, rand);
  return shuffled.slice(0, Math.min(desiredCount, shuffled.length));
}

// ---------- internals ----------

/**
 * FNV-1a hash converting a seed string to a 32-bit unsigned integer.
 * Stable and dependency-free.
 */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * mulberry32 PRNG: small, fast, sufficient for shuffle randomness.
 * Returns a function producing values in [0, 1).
 */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle driven by the provided RNG.
 * Non-mutating: returns a new array.
 */
function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
