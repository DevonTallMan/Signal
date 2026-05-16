// src/lib/teacher/aggregate.ts
//
// Pure aggregation helpers for the teacher dashboard. Given the raw
// per-student documents read from Firestore (drillRatings + activity
// sessions), produce the per-student summary row the cohort tab
// renders. Pure functions so they unit-test cleanly without an
// emulator dependency.
//
// v1 (Inc 7.1) ships the cohort-level summary. Per-topic and
// per-student breakdowns land in Inc 7.2 and reuse the same input
// shape.

export interface DrillRatingDoc {
  topicId: string;
  termId: string;
  outcome: "got" | "miss";
  ratedAt?: { toMillis: () => number } | null;
  lastRatedAt?: { toMillis: () => number } | null;
  boxLevel?: number | null;
  nextReviewDate?: { toMillis: () => number } | null;
}

export interface ActivitySessionDoc {
  startedAt?: { toMillis: () => number } | null;
  completedAt?: { toMillis: () => number } | null;
  score?: number | null;
  totalScenarios?: number | null;
  mode?: string | null;
}

export interface StudentSummary {
  cardsRated: number;
  cardsInQueue: number;
  cardsGraduated: number;
  sessionsStarted: number;
  sessionsCompleted: number;
  lastSeenMs: number | null;
}

function toMillis(value: { toMillis: () => number } | null | undefined): number | null {
  if (!value) return null;
  try {
    return value.toMillis();
  } catch {
    return null;
  }
}

export function summariseStudent(
  drillRatings: readonly DrillRatingDoc[],
  sessions: readonly ActivitySessionDoc[],
): StudentSummary {
  const cardsRated = drillRatings.length;

  // A card is "graduated" once it reaches box 4 (60-day box) per the
  // Sprint 6 scheduler. Cards with no boxLevel set are legacy ratings
  // pre-Sprint 6 and count as in the queue, since they haven't been
  // promoted.
  const cardsGraduated = drillRatings.filter((r) => (r.boxLevel ?? 0) >= 4).length;
  const cardsInQueue = cardsRated - cardsGraduated;

  const sessionsStarted = sessions.length;
  const sessionsCompleted = sessions.filter((s) => s.completedAt != null).length;

  let lastSeenMs: number | null = null;
  for (const r of drillRatings) {
    const t = toMillis(r.lastRatedAt) ?? toMillis(r.ratedAt);
    if (t != null && (lastSeenMs == null || t > lastSeenMs)) {
      lastSeenMs = t;
    }
  }
  for (const s of sessions) {
    const t = toMillis(s.completedAt) ?? toMillis(s.startedAt);
    if (t != null && (lastSeenMs == null || t > lastSeenMs)) {
      lastSeenMs = t;
    }
  }

  return {
    cardsRated,
    cardsInQueue,
    cardsGraduated,
    sessionsStarted,
    sessionsCompleted,
    lastSeenMs,
  };
}

export function formatLastSeen(lastSeenMs: number | null, nowMs: number): string {
  if (lastSeenMs == null) return "never";
  const diff = nowMs - lastSeenMs;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 30 * day) return `${Math.floor(diff / day)}d ago`;
  return `${Math.floor(diff / (30 * day))}mo ago`;
}
