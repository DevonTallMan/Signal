// src/components/MCQSummary.tsx
//
// Per-topic MCQ scoring summary. Sprint 7B Inc 7B.2.
//
// Mounts above the MCQ list in AssessmentBlock. Reads each MCQ
// submission for the topic on load and surfaces a one-line summary:
//
//   - 0 attempted: hidden (no summary line at all)
//   - 1 to M-1 attempted: "You've attempted N of M MCQs on this topic."
//   - All M attempted: "You got N of M correct on this topic."
//
// The summary is a load-time snapshot. Individual MCQRunner submits
// after page load do not update the summary live; the student sees
// the latest state on the next page reload. This keeps the component
// boundary clean and avoids cross-island state propagation for v1.
//
// Per-MCQ retry remains on each MCQRunner (Inc 7B.1). The summary
// does not include its own retry affordance because individual
// retries are enough: a student who wants a fresh attempt clicks
// "Try again" on the specific MCQ.

import { useEffect, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { loadMCQSubmission } from "../lib/mcqStore";

export interface MCQSummaryProps {
  topicId: string;
  questionIds: string[];
}

type State =
  | { kind: "loading" }
  | { kind: "unauthenticated" }
  | { kind: "ready"; attempted: number; correct: number; total: number };

export default function MCQSummary({ topicId, questionIds }: MCQSummaryProps) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (authLoading) {
      setState({ kind: "loading" });
      return;
    }
    if (!user) {
      setState({ kind: "unauthenticated" });
      return;
    }
    if (questionIds.length === 0) {
      setState({ kind: "ready", attempted: 0, correct: 0, total: 0 });
      return;
    }

    let cancelled = false;
    (async () => {
      const records = await Promise.all(
        questionIds.map((qid) =>
          loadMCQSubmission(user.uid, topicId, qid).catch(() => null),
        ),
      );
      if (cancelled) return;
      const attempted = records.filter((r) => r !== null).length;
      const correct = records.filter((r) => r !== null && r.isCorrect).length;
      setState({
        kind: "ready",
        attempted,
        correct,
        total: questionIds.length,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, topicId, questionIds]);

  if (state.kind !== "ready") return null;
  if (state.attempted === 0) return null;

  const allAttempted = state.attempted === state.total;
  const verdictClass = allAttempted
    ? state.correct === state.total
      ? "mcq-summary--all-correct"
      : state.correct === 0
        ? "mcq-summary--all-wrong"
        : "mcq-summary--mixed"
    : "mcq-summary--partial";

  return (
    <div
      className={`mcq-summary ${verdictClass}`}
      data-mcq-summary-state={
        allAttempted ? "complete" : "partial"
      }
      data-mcq-summary-attempted={state.attempted}
      data-mcq-summary-correct={state.correct}
      data-mcq-summary-total={state.total}
    >
      {allAttempted ? (
        <p>
          <strong>
            You got {state.correct} of {state.total} correct
          </strong>{" "}
          on this topic's MCQs. Use "Try again" on any MCQ below to
          re-attempt; your latest answer is the one that counts.
        </p>
      ) : (
        <p>
          You've attempted {state.attempted} of {state.total} MCQs on
          this topic. Finish the remaining {state.total - state.attempted}{" "}
          to see your score.
        </p>
      )}
    </div>
  );
}
