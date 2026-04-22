// src/components/NEISubmission.tsx
//
// The main interactive feature of Signal. Renders an extended-answer
// form under an NEI question on a topic page. Calls AXIOM-7 to mark
// the submission, displays the Answer-Arc ribbon and verdict, writes
// the result to Firestore, and lets the student try again.
//
// Props come from the Astro frontmatter via structured serialisation.
// See AssessmentBlock.astro (the wrapper) for how the frontmatter
// fields are mapped to these props.

import { useState, type FormEvent } from 'react';
import { useAuth } from '../lib/useAuth';
import { markAnswer, AxiomError } from '../lib/axiom';
import { saveSubmission } from '../lib/firestore';
import type { ArcMarking, Submission, ArcExemplarClause } from '../lib/types';
import ExemplarArc from './ExemplarArc';

export interface NEISubmissionProps {
  topicId: string;
  questionId: string;
  scenario?: string;
  question: string;
  maxMarks: number;
  markScheme: {
    nameExpected: string;
    explainExpected: string;
    impactExpected: string;
  };
  exemplarAnswer?: string;
  exemplarArc?: ArcExemplarClause[];
}

type State =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'marked'; marking: ArcMarking; firestoreSaved: boolean }
  | { kind: 'error'; message: string };

export default function NEISubmission(props: NEISubmissionProps) {
  const { user, loading: authLoading } = useAuth();
  const [answer, setAnswer] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [showExemplar, setShowExemplar] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setState({ kind: 'submitting' });

    try {
      const marking = await markAnswer({
        topicId: props.topicId,
        questionId: props.questionId,
        scenario: props.scenario,
        question: props.question,
        maxMarks: props.maxMarks,
        markScheme: props.markScheme,
        answer,
      });

      // Write to Firestore. A failure here should not block the UI from
      // showing the marking; the student still gets feedback. But we do
      // surface the save status so we know if Firestore is misbehaving.
      let firestoreSaved = false;
      try {
        const submission: Submission = {
          topicId: props.topicId,
          questionId: props.questionId,
          answerText: answer,
          submittedAt: Date.now(),
          marking,
          source: 'signal',
        };
        await saveSubmission(user.uid, submission);
        firestoreSaved = true;
      } catch (saveErr) {
        // eslint-disable-next-line no-console
        console.error('Firestore save failed', saveErr);
      }

      setState({ kind: 'marked', marking, firestoreSaved });
    } catch (err) {
      const message =
        err instanceof AxiomError
          ? 'Marking failed. Please try again.'
          : 'Something went wrong. Please try again.';
      setState({ kind: 'error', message });
    }
  }

  function handleTryAgain() {
    setState({ kind: 'idle' });
    setAnswer('');
    setShowExemplar(false);
  }

  if (authLoading) {
    return <p style={{ color: 'var(--dim)' }}>Loading…</p>;
  }

  if (!user) {
    const next =
      typeof window !== 'undefined'
        ? encodeURIComponent(window.location.pathname)
        : '/';
    return (
      <div className="nei-signin-cta">
        <p style={{ color: 'var(--dim)' }}>
          Sign in to submit an answer and have it marked.
        </p>
        <a href={`/signin?next=${next}`} className="nei-signin-link">
          Sign In
        </a>
      </div>
    );
  }

  const submitting = state.kind === 'submitting';

  return (
    <div className="nei-submission">
      {props.scenario && (
        <blockquote className="nei-scenario">{props.scenario}</blockquote>
      )}

      <p className="nei-question">
        <strong>{props.question}</strong>{' '}
        <span className="nei-max">({props.maxMarks} marks)</span>
      </p>

      {state.kind !== 'marked' && (
        <form onSubmit={handleSubmit} className="nei-form">
          <label className="nei-label">
            <span>Your answer</span>
            <textarea
              rows={8}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Name, explain, impact. In full sentences."
              required
              disabled={submitting}
            />
          </label>

          {state.kind === 'error' && (
            <p className="nei-error">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={submitting || answer.trim().length < 10}
            className="nei-submit"
          >
            {submitting ? 'Marking…' : 'Submit for Marking'}
          </button>
        </form>
      )}

      {state.kind === 'marked' && (
        <MarkingResult
          marking={state.marking}
          firestoreSaved={state.firestoreSaved}
          answer={answer}
          exemplarAnswer={props.exemplarAnswer}
          exemplarArc={props.exemplarArc}
          maxMarks={props.maxMarks}
          showExemplar={showExemplar}
          setShowExemplar={setShowExemplar}
          onTryAgain={handleTryAgain}
        />
      )}
    </div>
  );
}

interface MarkingResultProps {
  marking: ArcMarking;
  firestoreSaved: boolean;
  answer: string;
  exemplarAnswer?: string;
  exemplarArc?: ArcExemplarClause[];
  maxMarks: number;
  showExemplar: boolean;
  setShowExemplar: (v: boolean) => void;
  onTryAgain: () => void;
}

function MarkingResult({
  marking,
  firestoreSaved,
  answer,
  exemplarAnswer,
  exemplarArc,
  maxMarks,
  showExemplar,
  setShowExemplar,
  onTryAgain,
}: MarkingResultProps) {
  return (
    <div className="nei-result">
      <div className="nei-submitted">
        <div className="eyebrow">Your answer</div>
        <p className="nei-answer-shown">{answer}</p>
      </div>

      <div className="nei-marks">
        <span className="nei-marks-awarded">{marking.marks.awarded}</span>
        <span className="nei-marks-divider">/</span>
        <span className="nei-marks-max">{marking.marks.max}</span>
      </div>

      <div className="nei-ribbon">
        <RibbonPill
          label="Name"
          state={marking.name.state}
          comment={marking.name.comment}
        />
        <RibbonPill
          label="Explain"
          state={marking.explain.state}
          comment={marking.explain.comment}
        />
        <RibbonPill
          label="Impact"
          state={marking.impact.state}
          comment={marking.impact.comment}
        />
      </div>

      <div className="nei-verdict">
        <div className="eyebrow">Verdict</div>
        <p>{marking.verdict}</p>
      </div>

      {(exemplarArc || exemplarAnswer) && (
        <div className="nei-exemplar">
          {showExemplar ? (
            <>
              {exemplarArc && exemplarArc.length > 0 ? (
                <ExemplarArc arc={exemplarArc} maxMarks={maxMarks} />
              ) : (
                <>
                  <div className="eyebrow">Exemplar answer</div>
                  <p className="nei-exemplar-text">{exemplarAnswer}</p>
                </>
              )}
              <button
                type="button"
                className="nei-link"
                onClick={() => setShowExemplar(false)}
              >
                Hide worked answer
              </button>
            </>
          ) : (
            <button
              type="button"
              className="nei-link"
              onClick={() => setShowExemplar(true)}
            >
              Show worked answer
            </button>
          )}
        </div>
      )}

      {!firestoreSaved && (
        <p className="nei-save-warning">
          Marking received, but could not save to your progress history.
          The feedback above is still valid.
        </p>
      )}

      <button type="button" className="nei-try-again" onClick={onTryAgain}>
        Try another answer
      </button>
    </div>
  );
}

interface RibbonPillProps {
  label: string;
  state: 'HIT' | 'MISS' | 'PARTIAL';
  comment: string;
}

function RibbonPill({ label, state, comment }: RibbonPillProps) {
  const stateClass =
    state === 'HIT'
      ? 'nei-pill--hit'
      : state === 'PARTIAL'
        ? 'nei-pill--partial'
        : 'nei-pill--miss';
  return (
    <div className={`nei-pill ${stateClass}`}>
      <div className="nei-pill__label">{label}</div>
      <div className="nei-pill__state">{state}</div>
      <div className="nei-pill__comment">{comment}</div>
    </div>
  );
}
