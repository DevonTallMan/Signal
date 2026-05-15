// src/lib/drillScheduler/firestore.ts
//
// Transactional read-modify-write wrapper that turns a drill rating into a
// scheduler state update. The pure transformation lives in
// computeNewDocData so it is unit-testable without a Firestore mock; the
// runTransaction wiring is a thin shim.
//
// Risk 2 in docs/sprint-6-scope.md: concurrent rate() calls. Mitigation:
// runTransaction. If a contending write commits between our read and
// write, the SDK retries the transaction body up to its default limit.
//
// Risk 3: legacy documents without scheduler fields. Mitigation:
// read-time fallback in computeNewDocData treats a doc missing boxLevel
// as prev = { boxLevel: 0, nextReviewDate: now } per scope Section 4 Inc
// 6.4 "appear immediately in the queue, graduate naturally from there".

import {
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type FieldValue,
  type Firestore,
} from "firebase/firestore";
import { nextState, type DrillOutcome, type SchedulerState } from "./scheduler";

const MAX_HISTORY_ENTRIES = 10;

export type HistoryEntry = { outcome: DrillOutcome; at: Timestamp };

export type NewDocData = {
  topicId: string;
  termId: string;
  outcome: DrillOutcome;
  ratedAt: FieldValue;
  source: "signal";
  boxLevel: number;
  nextReviewDate?: Timestamp;
  firstRatedAt: Timestamp;
  lastRatedAt: Timestamp;
  history: HistoryEntry[];
};

function readPrevState(existing: DocumentData | null, now: Date): SchedulerState | null {
  if (existing === null) return null;
  if (typeof existing.boxLevel !== "number") {
    return { boxLevel: 0, nextReviewDate: Timestamp.fromDate(now) };
  }
  return {
    boxLevel: existing.boxLevel,
    nextReviewDate: existing.nextReviewDate ?? null,
  };
}

function readPrevHistory(existing: DocumentData | null): HistoryEntry[] {
  if (existing === null) return [];
  return Array.isArray(existing.history) ? (existing.history as HistoryEntry[]) : [];
}

function readPrevFirstRatedAt(existing: DocumentData | null): Timestamp | null {
  if (existing === null) return null;
  if (existing.firstRatedAt instanceof Timestamp) return existing.firstRatedAt;
  if (existing.ratedAt instanceof Timestamp) return existing.ratedAt;
  return null;
}

export function computeNewDocData(
  existing: DocumentData | null,
  topicId: string,
  termId: string,
  outcome: DrillOutcome,
  now: Date,
): NewDocData {
  const prev = readPrevState(existing, now);
  const prevHistory = readPrevHistory(existing);
  const prevFirstRatedAt = readPrevFirstRatedAt(existing);
  const newState = nextState(prev, outcome, now);
  const nowTimestamp = Timestamp.fromDate(now);
  const newHistory = [...prevHistory, { outcome, at: nowTimestamp }].slice(
    -MAX_HISTORY_ENTRIES,
  );
  const data: NewDocData = {
    topicId,
    termId,
    outcome,
    ratedAt: serverTimestamp(),
    source: "signal",
    boxLevel: newState.boxLevel,
    firstRatedAt: prevFirstRatedAt ?? nowTimestamp,
    lastRatedAt: nowTimestamp,
    history: newHistory,
  };
  if (newState.nextReviewDate !== null) {
    data.nextReviewDate = newState.nextReviewDate;
  }
  return data;
}

export async function saveDrillRatingWithScheduler(
  db: Firestore,
  uid: string,
  topicId: string,
  termId: string,
  outcome: DrillOutcome,
  now: Date = new Date(),
): Promise<void> {
  const compositeId = `${topicId}__${termId}`;
  const ref = doc(db, "users", uid, "drillRatings", compositeId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const existing = snap.exists() ? snap.data() : null;
    const newDoc = computeNewDocData(existing, topicId, termId, outcome, now);
    tx.set(ref, newDoc);
  });
}
