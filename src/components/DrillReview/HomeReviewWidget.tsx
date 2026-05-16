// src/components/DrillReview/HomeReviewWidget.tsx
//
// Sprint 6 Inc 6.3: home-page review surface. Two stacked elements
// rendered as a single React island:
//
//   1. Soft session-opener banner (top). One-row prompt offering
//      "Start with N reviews before new content?" with an explicit
//      "Start with new content" dismissal. Suppressed for 12 hours
//      after dismissal via localStorage.
//
//   2. Review widget (bottom). Persistent count of cards due plus a
//      CTA to /review.
//
// Both elements render nothing for anonymous users or empty queues
// per scope Section 3.4 ("always optional, never mandatory").

import { useEffect, useState } from "react";
import { getFirestore } from "firebase/firestore";
import { useAuth } from "../../lib/useAuth";
import { app } from "../../lib/firebase";
import { getAllCardStates } from "../../lib/drillScheduler/queries";
import { pickDueCards } from "../../lib/drillScheduler/picker";

const DISMISSAL_KEY = "signal-session-opener-dismissed-at";
const SUPPRESSION_HOURS = 12;

type Phase = "loading" | "hidden" | "widget-only" | "banner-and-widget";

function bannerRecentlyDismissed(now: Date): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem(DISMISSAL_KEY);
    if (!stored) return false;
    const dismissedAt = new Date(stored);
    if (Number.isNaN(dismissedAt.getTime())) return false;
    const hoursAgo = (now.getTime() - dismissedAt.getTime()) / (60 * 60 * 1000);
    return hoursAgo < SUPPRESSION_HOURS;
  } catch {
    return false;
  }
}

function recordDismissal(now: Date): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DISMISSAL_KEY, now.toISOString());
  } catch {
    // localStorage unavailable (private mode, quota). Banner will
    // re-show on next load; that's an acceptable failure mode.
  }
}

export default function HomeReviewWidget() {
  const { user, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<Phase>("loading");
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setPhase("hidden");
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const db = getFirestore(app);
        const now = new Date();
        const states = await getAllCardStates(db, user!.uid, now);
        const due = pickDueCards(states, now);
        if (cancelled) return;
        setDueCount(due.length);
        if (due.length === 0) {
          setPhase("hidden");
          return;
        }
        setPhase(bannerRecentlyDismissed(now) ? "widget-only" : "banner-and-widget");
      } catch {
        if (!cancelled) setPhase("hidden");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  function dismissBanner() {
    recordDismissal(new Date());
    setPhase("widget-only");
  }

  if (phase === "loading" || phase === "hidden") return null;

  const cardLabel = dueCount === 1 ? "card" : "cards";

  return (
    <section className="review-surface" aria-label="Spaced-return review queue">
      <div className="review-surface__inner">
        {phase === "banner-and-widget" && (
          <div className="session-opener" role="region" aria-label="Session opener prompt">
            <p className="session-opener__copy">
              <span className="session-opener__tag">// SESSION OPENER</span>
              <span className="session-opener__question">
                Start with <strong>{dueCount}</strong> review{dueCount === 1 ? "" : "s"} before new content?
              </span>
            </p>
            <div className="session-opener__actions">
              <a href="/review" className="session-opener__accept">
                Start with reviews →
              </a>
              <button
                type="button"
                className="session-opener__dismiss"
                onClick={dismissBanner}
              >
                Start with new content
              </button>
            </div>
          </div>
        )}

        <div className="review-widget">
          <div className="review-widget__meta">
            <span className="review-widget__eyebrow">// REVIEW QUEUE</span>
            <span className="review-widget__count">
              <strong>{dueCount}</strong> {cardLabel} due
            </span>
          </div>
          <a href="/review" className="review-widget__cta">
            Review {dueCount} {cardLabel} →
          </a>
        </div>
      </div>
    </section>
  );
}
