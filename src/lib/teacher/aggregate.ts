// src/lib/teacher/aggregate.ts
//
// Pure aggregation helpers for the teacher dashboard. Given the raw
// per-student documents read from Firestore (drillRatings + activity
// sessions), produce the summary rows the dashboard tabs render. Pure
// functions so they unit-test cleanly without an emulator dependency.
//
// Inc 7.1 ships the cohort-level summary (summariseStudent).
// Inc 7.2 adds per-topic aggregation (summariseTopic) and per-student
// expanded breakdown (expandStudentByTopic).

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

export interface TopicSummary {
  topicId: string;
  studentsEngaged: number;
  totalRatings: number;
  gotCount: number;
  missCount: number;
  passRatePercent: number | null;
  cardsInQueue: number;
  cardsGraduated: number;
}

export interface StudentTopicBreakdown {
  topicId: string;
  cardsRated: number;
  cardsInQueue: number;
  cardsGraduated: number;
  gotCount: number;
  missCount: number;
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

export interface CohortMemberRatings {
  uid: string;
  drillRatings: readonly DrillRatingDoc[];
}

// summariseTopic aggregates drill activity across the cohort for a
// single topicId. studentsEngaged counts unique cohort members with at
// least one rating for the topic. passRatePercent is null when no
// ratings exist (don't divide by zero; display as "—" in the UI).
export function summariseTopic(
  topicId: string,
  cohort: readonly CohortMemberRatings[],
): TopicSummary {
  let studentsEngaged = 0;
  let totalRatings = 0;
  let gotCount = 0;
  let missCount = 0;
  let cardsInQueue = 0;
  let cardsGraduated = 0;

  for (const member of cohort) {
    const ratingsForTopic = member.drillRatings.filter((r) => r.topicId === topicId);
    if (ratingsForTopic.length === 0) continue;
    studentsEngaged += 1;
    for (const r of ratingsForTopic) {
      totalRatings += 1;
      if (r.outcome === "got") gotCount += 1;
      else if (r.outcome === "miss") missCount += 1;
      if ((r.boxLevel ?? 0) >= 4) cardsGraduated += 1;
      else cardsInQueue += 1;
    }
  }

  const passRatePercent =
    totalRatings === 0 ? null : Math.round((gotCount / totalRatings) * 100);

  return {
    topicId,
    studentsEngaged,
    totalRatings,
    gotCount,
    missCount,
    passRatePercent,
    cardsInQueue,
    cardsGraduated,
  };
}

// expandStudentByTopic returns a per-topic breakdown for one student.
// The topicIds list controls the output rows so topics with zero
// activity still appear in the table (helps Dave spot untouched
// topics).
export function expandStudentByTopic(
  drillRatings: readonly DrillRatingDoc[],
  topicIds: readonly string[],
): StudentTopicBreakdown[] {
  return topicIds.map((topicId) => {
    const forTopic = drillRatings.filter((r) => r.topicId === topicId);
    const cardsRated = forTopic.length;
    const cardsGraduated = forTopic.filter((r) => (r.boxLevel ?? 0) >= 4).length;
    const cardsInQueue = cardsRated - cardsGraduated;
    const gotCount = forTopic.filter((r) => r.outcome === "got").length;
    const missCount = forTopic.filter((r) => r.outcome === "miss").length;

    let lastSeenMs: number | null = null;
    for (const r of forTopic) {
      const t = toMillis(r.lastRatedAt) ?? toMillis(r.ratedAt);
      if (t != null && (lastSeenMs == null || t > lastSeenMs)) {
        lastSeenMs = t;
      }
    }

    return {
      topicId,
      cardsRated,
      cardsInQueue,
      cardsGraduated,
      gotCount,
      missCount,
      lastSeenMs,
    };
  });
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
