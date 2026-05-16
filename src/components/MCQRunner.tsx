// src/components/MCQRunner.tsx
//
// Interactive runner for an MCQ assessment. Sprint 7B Inc 7B.1.
//
// Replaces the static placeholder that AssessmentBlock.astro
// previously rendered for MCQ assessments. Renders the prompt, the
// option list as radio inputs, and a submit button. On submit, writes
// to Firestore via mcqStore.saveMCQSubmission and shows the
// correct/incorrect feedback inline. On page load, reads back any
// prior submission so the UI reflects the student's current state.
//
// Props mirror the MCQValue shape from topic frontmatter, plus the
// topicId for the compositeId key.

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../lib/useAuth";
import { saveMCQSubmission, loadMCQSubmission } from "../lib/mcqStore";

export interface MCQRunnerProps {
  topicId: string;
  questionId: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  feedbackCorrect?: string;
  feedbackIncorrect?: string;
  difficulty?: string;
}

type State =
  | { kind: "loading" }
  | { kind: "unauthenticated" }
  | { kind: "ready" }
  | { kind: "submitting" }
  | { kind: "submitted"; selectedIndex: number; isCorrect: boolean }
  | { kind: "error"; message: string };

export default function MCQRunner(props: MCQRunnerProps) {
  const {
    topicId,
    questionId,
    prompt,
    options,
    correctIndex,
    feedbackCorrect,
    feedbackIncorrect,
    difficulty,
  } = props;

  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Read back any previous submission on mount / when the user
  // changes. If a submission exists, jump straight to the "submitted"
  // state so the student sees their prior answer and feedback.
  useEffect(() => {
    if (authLoading) {
      setState({ kind: "loading" });
      return;
    }
    if (!user) {
      setState({ kind: "unauthenticated" });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const prior = await loadMCQSubmission(user.uid, topicId, questionId);
        if (cancelled) return;
        if (prior) {
          setSelectedIndex(prior.selectedIndex);
          setState({
            kind: "submitted",
            selectedIndex: prior.selectedIndex,
            isCorrect: prior.isCorrect,
          });
        } else {
          setState({ kind: "ready" });
        }
      } catch (err) {
        if (cancelled) return;
        const message = (err as { message?: string })?.message ?? "Read failed.";
        setState({ kind: "error", message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, topicId, questionId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (selectedIndex == null) return;
    setState({ kind: "submitting" });
    try {
      await saveMCQSubmission(
        user.uid,
        topicId,
        questionId,
        selectedIndex,
        correctIndex,
      );
      setState({
        kind: "submitted",
        selectedIndex,
        isCorrect: selectedIndex === correctIndex,
      });
    } catch (err) {
      const message = (err as { message?: string })?.message ?? "Save failed.";
      setState({ kind: "error", message });
    }
  }

  function handleRetry() {
    setSelectedIndex(null);
    setState({ kind: "ready" });
  }

  const isSubmitted = state.kind === "submitted";
  const isSubmitting = state.kind === "submitting";
  const disabled = isSubmitted || isSubmitting || state.kind === "loading";

  return (
    <div
      className="mcq-runner"
      data-mcq-id={questionId}
      data-mcq-state={state.kind}
    >
      <div className="eyebrow">
        MCQ · {questionId}
        {difficulty ? ` · ${difficulty}` : ""}
      </div>
      <p className="mcq-runner__prompt">
        <strong>{prompt}</strong>
      </p>

      {state.kind === "loading" && (
        <p className="meta" style={{ color: "var(--dim)" }}>
          Loading…
        </p>
      )}

      {state.kind === "unauthenticated" && (
        <p className="meta" style={{ color: "var(--dim)" }}>
          Sign in to answer this question.
        </p>
      )}

      {(state.kind === "ready" ||
        state.kind === "submitting" ||
        state.kind === "submitted") && (
        <form onSubmit={handleSubmit} className="mcq-runner__form">
          <ol className="mcq-runner__options">
            {options.map((option, idx) => {
              const isPicked = selectedIndex === idx;
              const isCorrectOption = isSubmitted && idx === correctIndex;
              const isWrongPick =
                isSubmitted && isPicked && idx !== correctIndex;
              const classes = [
                "mcq-runner__option",
                isPicked ? "mcq-runner__option--picked" : "",
                isCorrectOption ? "mcq-runner__option--correct" : "",
                isWrongPick ? "mcq-runner__option--wrong" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <li key={idx} className={classes}>
                  <label>
                    <input
                      type="radio"
                      name={`mcq-${questionId}`}
                      value={idx}
                      checked={isPicked}
                      disabled={disabled}
                      onChange={() => setSelectedIndex(idx)}
                    />
                    <span>{option}</span>
                  </label>
                </li>
              );
            })}
          </ol>

          {!isSubmitted && (
            <button
              type="submit"
              disabled={disabled || selectedIndex == null}
              className="mcq-runner__submit"
              data-mcq-action="submit"
            >
              {isSubmitting ? "Submitting…" : "Submit answer"}
            </button>
          )}
        </form>
      )}

      {isSubmitted && (
        <>
          <p
            className={
              "mcq-runner__verdict " +
              (state.isCorrect
                ? "mcq-runner__verdict--correct"
                : "mcq-runner__verdict--incorrect")
            }
            data-mcq-verdict={state.isCorrect ? "correct" : "incorrect"}
          >
            {state.isCorrect ? "Correct." : "Incorrect."}
          </p>
          {state.isCorrect && feedbackCorrect && (
            <p className="mcq-runner__feedback">{feedbackCorrect}</p>
          )}
          {!state.isCorrect && feedbackIncorrect && (
            <p className="mcq-runner__feedback">{feedbackIncorrect}</p>
          )}
          <button
            type="button"
            onClick={handleRetry}
            className="mcq-runner__retry"
            data-mcq-action="retry"
          >
            Try again
          </button>
        </>
      )}

      {state.kind === "error" && (
        <p className="mcq-runner__error" style={{ color: "var(--danger, #b00020)" }}>
          Could not save: {state.message}
        </p>
      )}
    </div>
  );
}
