// src/lib/sort-and-match/sessionPicker.ts
//
// Deterministic seeded picker for Sort & Match session scenarios.
//
// Mirrors the pattern used by src/lib/risk-classifier/sessionPicker.ts:
//   - Pure function, no side effects
//   - Same seed always produces the same picked subset and order
//   - Designed for unit testing
//
// Inc 3.4 scope: scenario picking only. No tier/category balancing
// (Sort & Match scenarios are not yet differentiated by difficulty or
// content area). When the scenario pool grows beyond a single worked
// example, we may extend this to balance by content area or difficulty.

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
