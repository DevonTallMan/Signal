// src/components/DrillReview/ReviewSession.tsx
//
// The /review surface. Presents the user's due drill cards one at a
// time using the same cue / reveal / rate UX as TerminologyDrill, then
// shows an end-of-session summary.
//
// Inc 6.2 surface only. The enqueue wiring from topic pages lands in
// Inc 6.4; until then the queue is fed by direct testApi.enqueueCard
// calls or by manually-rated legacy documents that the Risk 3 fallback
// surfaces immediately.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "../../lib/useAuth";
import { app } from "../../lib/firebase";
import { getAllCardStates } from "../../lib/drillScheduler/queries";
import {
  pickDueCards,
  type CardState,
  type DueCard,
} from "../../lib/drillScheduler/picker";
import { saveDrillRatingWithScheduler } from "../../lib/drillScheduler/firestore";
import type { DrillOutcome } from "../../lib/drillScheduler/scheduler";
import {
  registerDrillSchedulerTestApi,
  unregisterDrillSchedulerTestApi,
} from "../../lib/drillScheduler/testApi";

export interface DrillCardMeta {
  topicId: string;
  termId: string;
  cue: string;
  answer: string;
  topicTitle: string;
  topicSlug: string;
}

export interface ReviewSessionProps {
  catalog: DrillCardMeta[];
}

type ReviewCard = DueCard & DrillCardMeta;

type Phase = "loading" | "unauthenticated" | "empty" | "cue" | "revealed" | "done";

interface ItemResult {
  topicId: string;
  termId: string;
  outcome: DrillOutcome;
}

export default function ReviewSession({ catalog }: ReviewSessionProps) {
  const { user, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<Phase>("loading");
  const [queue, setQueue] = useState<ReviewCard[]>([]);
  const [cursor, setCursor] = useState(0);
  const [results, setResults] = useState<ItemResult[]>([]);
  const [nextEarliestReviewDate, setNextEarliestReviewDate] = useState<Date | null | undefined>(undefined);
  const sessionStartedAtRef = useRef<number | null>(null);
  // Tracks in-flight scheduler write promises so the test API's
  // getCardState can await them before reading Firestore. The user
  // path doesn't need this; only deterministic post-rate read-backs
  // in Playwright specs do.
  const pendingWritesRef = useRef<Set<Promise<unknown>>>(new Set());
  const [sessionDurationMs, setSessionDurationMs] = useState<number | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);

  const catalogById = useMemo(() => {
    const map = new Map<string, DrillCardMeta>();
    for (const card of catalog) {
      map.set(`${card.topicId}__${card.termId}`, card);
    }
    return map;
  }, [catalog]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setPhase("unauthenticated");
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const db = getFirestore(app);
        const now = new Date();
        const allStates = await getAllCardStates(db, user!.uid, now);
        const due = pickDueCards(allStates, now);
        const enriched: ReviewCard[] = due
          .map((d) => {
            const meta = catalogById.get(`${d.topicId}__${d.termId}`);
            if (!meta) return null;
            return { ...d, ...meta };
          })
          .filter((c): c is ReviewCard => c !== null);
        if (cancelled) return;
        setQueue(enriched);
        setCursor(0);
        setResults([]);
        if (enriched.length === 0) {
          setPhase("empty");
        } else {
          sessionStartedAtRef.current = Date.now();
          setPhase("cue");
        }
      } catch {
        if (!cancelled) setPhase("empty");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, catalogById, reloadCounter]);

  useEffect(() => {
    if (!user) return;
    registerDrillSchedulerTestApi({
      async enqueueCard(topicId, termId, outcome) {
        const db = getFirestore(app);
        await saveDrillRatingWithScheduler(db, user.uid, topicId, termId, outcome);
        setReloadCounter((n) => n + 1);
      },
      async getDueCards(dateIso) {
        // Drain any in-flight rate() writes before reading, so the
        // result reflects the latest scheduler state. See pendingWritesRef.
        if (pendingWritesRef.current.size > 0) {
          await Promise.allSettled([...pendingWritesRef.current]);
        }
        const db = getFirestore(app);
        const now = new Date(dateIso);
        const allStates = await getAllCardStates(db, user.uid, now);
        const due = pickDueCards(allStates, now);
        return due.map((c) => ({
          topicId: c.topicId,
          termId: c.termId,
          boxLevel: c.boxLevel,
          nextReviewDate: c.nextReviewDate.toDate().toISOString(),
        }));
      },
      async getCardState(topicId, termId) {
        // Drain any in-flight rate() writes before reading, so the
        // result reflects the latest scheduler state. See pendingWritesRef.
        if (pendingWritesRef.current.size > 0) {
          await Promise.allSettled([...pendingWritesRef.current]);
        }
        const db = getFirestore(app);
        const ref = doc(
          db,
          "users",
          user.uid,
          "drillRatings",
          `${topicId}__${termId}`,
        );
        const snap = await getDoc(ref);
        if (!snap.exists()) return null;
        const data = snap.data();
        const boxLevel = typeof data.boxLevel === "number" ? data.boxLevel : 0;
        const nextReviewDate =
          data.nextReviewDate instanceof Timestamp
            ? data.nextReviewDate.toDate().toISOString()
            : null;
        return { boxLevel, nextReviewDate };
      },
      async seedCardWithDueDate(topicId, termId, boxLevel, nextReviewDateIso) {
        const db = getFirestore(app);
        const compositeId = `${topicId}__${termId}`;
        const ref = doc(db, "users", user.uid, "drillRatings", compositeId);
        const nowTimestamp = Timestamp.now();
        const data: Record<string, unknown> = {
          topicId,
          termId,
          outcome: "got",
          ratedAt: serverTimestamp(),
          source: "signal",
          boxLevel,
          firstRatedAt: nowTimestamp,
          lastRatedAt: nowTimestamp,
          history: [],
        };
        if (nextReviewDateIso !== null) {
          data.nextReviewDate = Timestamp.fromDate(new Date(nextReviewDateIso));
        }
        await setDoc(ref, data);
        setReloadCounter((n) => n + 1);
      },
    });
    return () => unregisterDrillSchedulerTestApi();
  }, [user]);

  async function rate(outcome: DrillOutcome) {
    if (phase !== "revealed") return;
    const current = queue[cursor];
    if (!current || !user) return;
    setResults((prev) => [
      ...prev,
      { topicId: current.topicId, termId: current.termId, outcome },
    ]);
    // Fire the scheduler write in the background. Don't block the
    // phase transition on the Firestore round-trip. PR #124 moved
    // the getAllCardStates read out of the await chain; this commit
    // does the same for the saveDrillRatingWithScheduler write.
    // Without this, slow staging Firestore can push the phase=done
    // transition past the test timeout (surfaced repeatedly on PR
    // #134 and #135).
    //
    // The write is tracked in pendingWritesRef so test code that
    // reads back the saved state (via the test API's getCardState)
    // can await it. User flows do not need this.
    const writePromise = (async () => {
      try {
        const db = getFirestore(app);
        await saveDrillRatingWithScheduler(
          db,
          user.uid,
          current.topicId,
          current.termId,
          outcome,
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Scheduler rating save failed:", err);
      }
    })();
    pendingWritesRef.current.add(writePromise);
    void writePromise.finally(() => {
      pendingWritesRef.current.delete(writePromise);
    });
    const next = cursor + 1;
    if (next >= queue.length) {
      const start = sessionStartedAtRef.current;
      setSessionDurationMs(start === null ? null : Date.now() - start);
      setNextEarliestReviewDate(undefined);
      setPhase("done");
      void (async () => {
        try {
          const db = getFirestore(app);
          const now = new Date();
          const states = await getAllCardStates(db, user.uid, now);
          const stillScheduled = states
            .filter((s): s is CardState & { nextReviewDate: Timestamp } => s.nextReviewDate !== null)
            .map((s) => s.nextReviewDate.toMillis());
          if (stillScheduled.length > 0) {
            setNextEarliestReviewDate(new Date(Math.min(...stillScheduled)));
          } else {
            setNextEarliestReviewDate(null);
          }
        } catch {
          setNextEarliestReviewDate(null);
        }
      })();
    } else {
      setCursor(next);
      setPhase("cue");
    }
  }

  if (phase === "loading" || authLoading) {
    return (
      <div className="review-loading" data-review-state="loading">
        <p>Loading your review queue…</p>
      </div>
    );
  }

  if (phase === "unauthenticated") {
    return (
      <div className="review-unauthenticated" data-review-state="unauthenticated">
        <p>Sign in to see your review queue.</p>
        <a href="/signin" className="drill-done__cta">Sign in →</a>
      </div>
    );
  }

  if (phase === "empty") {
    return (
      <div className="review-empty" data-review-state="empty">
        <p>All caught up. Come back later, or visit a topic to add new cards to your review queue.</p>
      </div>
    );
  }

  if (phase === "done") {
    const got = results.filter((r) => r.outcome === "got").length;
    const miss = results.filter((r) => r.outcome === "miss").length;
    const total = results.length;
    const durationLabel = sessionDurationMs === null ? null : formatDuration(sessionDurationMs);
    return (
      <div className="drill-done review-summary" data-review-state="done">
        <div className="drill-done__score">
          <span className="drill-done__got">{got}</span>
          <span className="drill-done__divider">/</span>
          <span className="drill-done__total">{total}</span>
        </div>
        <p className="drill-done__line">
          <span data-review-got-count>{got}</span> got,{" "}
          <span data-review-miss-count>{miss}</span> miss
          {durationLabel ? <> · {durationLabel}</> : null}
        </p>
        {nextEarliestReviewDate === undefined ? (
          <p
            className="review-summary__next review-summary__next--loading"
            data-review-next-state="loading"
          >
            Calculating next review…
          </p>
        ) : nextEarliestReviewDate ? (
          <p
            className="review-summary__next"
            data-review-next-state="scheduled"
          >
            Next review due {formatRelativeDate(nextEarliestReviewDate)}.
          </p>
        ) : (
          <p
            className="review-summary__next"
            data-review-next-state="empty"
          >
            No more cards scheduled. Visit a topic to add new ones.
          </p>
        )}
      </div>
    );
  }

  const current = queue[cursor];
  if (!current) return null;
  const total = queue.length;
  return (
    <div
      className="drill"
      data-review-state={phase}
      data-review-queue-length={queue.length}
    >
      <div className="drill__progress">
        <span className="drill__counter">
          {cursor + 1} of {total}
        </span>
        <div className="drill__progress-bar">
          <div
            className="drill__progress-fill"
            style={{ width: `${(cursor / total) * 100}%` }}
          />
        </div>
      </div>
      <div className="drill__card">
        <div className="eyebrow" data-review-topic-title>
          {current.topicTitle}
        </div>
        <p className="drill__cue" data-review-cue>{current.cue}</p>
        {phase === "revealed" && (
          <>
            <div className="drill__divider" />
            <div className="eyebrow">Term</div>
            <p className="drill__answer" data-review-answer>{current.answer}</p>
          </>
        )}
      </div>
      {phase === "cue" && (
        <div className="drill__actions">
          <button
            type="button"
            className="drill__reveal"
            data-review-action="reveal"
            onClick={() => setPhase("revealed")}
          >
            Reveal term
          </button>
        </div>
      )}
      {phase === "revealed" && (
        <div className="drill__actions drill__actions--rate">
          <button
            type="button"
            className="drill__miss"
            data-review-action="miss"
            onClick={() => rate("miss")}
          >
            Didn't get it
          </button>
          <button
            type="button"
            className="drill__got"
            data-review-action="got"
            onClick={() => rate("got")}
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function formatRelativeDate(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return "now";
  const hours = Math.round(diffMs / (60 * 60 * 1000));
  if (hours < 24) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(diffMs / (24 * 60 * 60 * 1000));
  return `in ${days} day${days === 1 ? "" : "s"}`;
}
