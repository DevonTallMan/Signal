// src/components/SortAndMatch.tsx
//
// React island for the Sort & Match N·E·I drag-and-drop activity.
// Sprint 3 worked example: Six Vs and Data Quality.
//
// Sprint 3 Increment 3.3 scope: VALIDATION + STUCK MITIGATION + MODEL ANSWER REVEAL.
//   - "Check answers" button appears when all 5 phrases are placed
//   - On check: per-phrase feedback (correct/incorrect; correct bucket NOT revealed)
//   - 3-attempt stuck mitigation: failing attempt 3 reveals model answer
//   - On all correct OR on stuck mitigation: structured model answer panel reveals
//     (N / E / I sections with prose from scenario.modelAnswer)
//   - Different kicker text for "completed correctly" vs "completed with help"
//   - Dragging clears feedback and returns to placing state for another attempt
//   - Reset button works at any time (full reset: locations + feedback + attempts)
//   - Drag disabled in terminal complete states
//   - All Inc 3.2 functionality preserved (drag/drop, dropzone highlights, touch support)
//
// What this PR does NOT do:
//   - Continue button + session loop (Inc 3.4)
//   - Firestore persistence (Inc 3.5)
//   - Playwright tests (Inc 3.6)
//
// State machine:
//   "placing" -> "feedback" (check, not all correct, attempts remaining)
//   "placing" -> "complete-correct" (check, all correct)
//   "placing" -> "complete-with-help" (check on attempt 3, not all correct)
//   "feedback" -> "placing" (user drags any phrase)
//   "complete-*" terminal (only Reset can leave)
//
// See docs/sort-and-match-nei-spec.md for full Sprint 3 spec.

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import scenariosData from "../data/sort-and-match/scenarios.json";
import { Glyph } from "./glyphs";
import type { GlyphName } from "./glyphs";

interface ScenarioPanel {
  id: string;
  glyph: GlyphName;
  caption: string;
}

interface Phrase {
  id: string;
  text: string;
  category: "N" | "E" | "I";
}

interface ModelAnswer {
  name: string;
  explain: string;
  impact: string;
}

interface Scenario {
  id: string;
  title: string;
  scenarioPanels: ScenarioPanel[];
  phrases: Phrase[];
  modelAnswer: ModelAnswer;
}

type Location = "pool" | "N" | "E" | "I";
type PhraseFeedback = "unchecked" | "correct" | "incorrect";
type Status = "placing" | "feedback" | "complete-correct" | "complete-with-help";

const BUCKET_LABELS: Record<"N" | "E" | "I", string> = {
  N: "Name",
  E: "Explain",
  I: "Impact",
};

const MAX_ATTEMPTS = 3;

// ---------- DraggablePhrase ----------
interface DraggablePhraseProps {
  phrase: Phrase;
  feedback: PhraseFeedback;
  disabled: boolean;
}

function DraggablePhrase({
  phrase,
  feedback,
  disabled,
}: DraggablePhraseProps): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: phrase.id, disabled });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? "default" : isDragging ? "grabbing" : "grab",
    touchAction: "none",
  };

  const feedbackClass =
    feedback === "correct"
      ? " sm-sortmatch__phrase--correct"
      : feedback === "incorrect"
      ? " sm-sortmatch__phrase--incorrect"
      : "";

  return (
    <div
      ref={setNodeRef}
      className={`sm-sortmatch__phrase${feedbackClass}`}
      style={style}
      {...listeners}
      {...attributes}
    >
      <span className="sm-sortmatch__phrase-text">{phrase.text}</span>
      {feedback === "correct" && (
        <span className="sm-sortmatch__phrase-marker sm-sortmatch__phrase-marker--correct">
          CORRECT
        </span>
      )}
      {feedback === "incorrect" && (
        <span className="sm-sortmatch__phrase-marker sm-sortmatch__phrase-marker--incorrect">
          TRY AGAIN
        </span>
      )}
    </div>
  );
}

// ---------- Droppable ----------
interface DroppableProps {
  id: Location;
  children: React.ReactNode;
  className: string;
  ariaLabel: string;
}

function Droppable({
  id,
  children,
  className,
  ariaLabel,
}: DroppableProps): JSX.Element {
  const { isOver, setNodeRef } = useDroppable({ id });
  const overClass = isOver ? `${className} ${className}--over` : className;

  return (
    <div ref={setNodeRef} className={overClass} aria-label={ariaLabel}>
      {children}
    </div>
  );
}

// ---------- Main component ----------
export default function SortAndMatch(): JSX.Element {
  const scenarios = scenariosData as Scenario[];
  const scenario = scenarios[0];

  const [phraseLocations, setPhraseLocations] = useState<
    Record<string, Location>
  >(() => {
    const initial: Record<string, Location> = {};
    if (scenario) {
      for (const p of scenario.phrases) initial[p.id] = "pool";
    }
    return initial;
  });

  const [status, setStatus] = useState<Status>("placing");
  const [attemptNumber, setAttemptNumber] = useState<number>(1);
  const [phraseFeedback, setPhraseFeedback] = useState<
    Record<string, PhraseFeedback>
  >({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 5 },
    })
  );

  function handleDragEnd(event: DragEndEvent): void {
    if (status === "complete-correct" || status === "complete-with-help") {
      return; // terminal state; drag disabled but guard anyway
    }

    const { active, over } = event;
    if (!over) return;
    const newLocation = over.id as Location;

    setPhraseLocations((prev) => ({
      ...prev,
      [String(active.id)]: newLocation,
    }));

    // Clear feedback and return to placing when the user starts a new attempt.
    if (status === "feedback") {
      setPhraseFeedback({});
      setStatus("placing");
    }
  }

  function handleCheck(): void {
    if (!scenario) return;
    const newFeedback: Record<string, PhraseFeedback> = {};
    let allCorrect = true;
    for (const p of scenario.phrases) {
      const placedIn = phraseLocations[p.id];
      if (placedIn === p.category) {
        newFeedback[p.id] = "correct";
      } else {
        newFeedback[p.id] = "incorrect";
        allCorrect = false;
      }
    }
    setPhraseFeedback(newFeedback);

    if (allCorrect) {
      setStatus("complete-correct");
    } else if (attemptNumber >= MAX_ATTEMPTS) {
      setStatus("complete-with-help");
    } else {
      setStatus("feedback");
      setAttemptNumber((prev) => prev + 1);
    }
  }

  function handleReset(): void {
    if (!scenario) return;
    const reset: Record<string, Location> = {};
    for (const p of scenario.phrases) reset[p.id] = "pool";
    setPhraseLocations(reset);
    setPhraseFeedback({});
    setStatus("placing");
    setAttemptNumber(1);
  }

  if (!scenario) {
    return (
      <div className="sm-sortmatch">
        <div className="sm-sortmatch__status">No scenarios available.</div>
      </div>
    );
  }

  const phrasesIn = (loc: Location): Phrase[] =>
    scenario.phrases.filter((p) => phraseLocations[p.id] === loc);

  const allPhrasesPlaced = scenario.phrases.every(
    (p) => phraseLocations[p.id] !== "pool"
  );

  const showCheckButton = status === "placing" && allPhrasesPlaced;
  const dragDisabled =
    status === "complete-correct" || status === "complete-with-help";
  const incorrectCount = Object.values(phraseFeedback).filter(
    (f) => f === "incorrect"
  ).length;

  return (
    <div className="sm-sortmatch">
      <div className="sm-sortmatch__scenario-title">
        <p className="sm-sortmatch__scenario-kicker">SCENARIO</p>
        <h2 className="sm-sortmatch__scenario-name">{scenario.title}</h2>
      </div>

      <div
        className="sm-sortmatch__panels"
        role="list"
        aria-label="Scenario comic strip"
      >
        {scenario.scenarioPanels.map((panel) => (
          <div key={panel.id} className="sm-sortmatch__panel" role="listitem">
            <Glyph name={panel.glyph} size={48} />
            <p className="sm-sortmatch__panel-caption">{panel.caption}</p>
          </div>
        ))}
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="sm-sortmatch__activity">
          <div className="sm-sortmatch__phrase-pool">
            <p className="sm-sortmatch__section-kicker">PHRASE POOL</p>
            <Droppable
              id="pool"
              className="sm-sortmatch__pool-dropzone"
              ariaLabel="Phrase pool"
            >
              <div className="sm-sortmatch__phrases">
                {phrasesIn("pool").map((phrase) => (
                  <DraggablePhrase
                    key={phrase.id}
                    phrase={phrase}
                    feedback={phraseFeedback[phrase.id] ?? "unchecked"}
                    disabled={dragDisabled}
                  />
                ))}
                {phrasesIn("pool").length === 0 && (
                  <p className="sm-sortmatch__pool-empty">
                    Pool empty. Drag phrases back here to reset placement.
                  </p>
                )}
              </div>
            </Droppable>
          </div>

          <div className="sm-sortmatch__bucket-group">
            <div className="sm-sortmatch__bucket-group-header">
              <p className="sm-sortmatch__section-kicker">SORT INTO</p>
              <button
                type="button"
                className="sm-sortmatch__reset"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
            <div className="sm-sortmatch__bucket-row">
              {(["N", "E", "I"] as const).map((cat) => (
                <div key={cat} className="sm-sortmatch__bucket">
                  <div className="sm-sortmatch__bucket-letter">{cat}</div>
                  <div className="sm-sortmatch__bucket-label">
                    {BUCKET_LABELS[cat]}
                  </div>
                  <Droppable
                    id={cat}
                    className="sm-sortmatch__bucket-content"
                    ariaLabel={`${BUCKET_LABELS[cat]} bucket`}
                  >
                    {phrasesIn(cat).map((phrase) => (
                      <DraggablePhrase
                        key={phrase.id}
                        phrase={phrase}
                        feedback={phraseFeedback[phrase.id] ?? "unchecked"}
                        disabled={dragDisabled}
                      />
                    ))}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>

          {status === "feedback" && (
            <div className="sm-sortmatch__attempt-banner">
              <span className="sm-sortmatch__attempt-banner-kicker">
                ATTEMPT {attemptNumber} OF {MAX_ATTEMPTS}
              </span>
              <span className="sm-sortmatch__attempt-banner-text">
                {incorrectCount === 1
                  ? "1 phrase needs rethinking. Drag it to a different bucket and check again."
                  : `${incorrectCount} phrases need rethinking. Drag them to different buckets and check again.`}
              </span>
            </div>
          )}

          {showCheckButton && (
            <button
              type="button"
              className="sm-sortmatch__check"
              onClick={handleCheck}
            >
              Check answers
            </button>
          )}
        </div>
      </DndContext>

      {(status === "complete-correct" || status === "complete-with-help") && (
        <div
          className={`sm-sortmatch__model-answer${
            status === "complete-with-help"
              ? " sm-sortmatch__model-answer--with-help"
              : ""
          }`}
        >
          <p className="sm-sortmatch__model-answer-kicker">
            {status === "complete-correct"
              ? "SCENARIO COMPLETE"
              : "MODEL ANSWER"}
          </p>
          <p className="sm-sortmatch__model-answer-context">
            {status === "complete-correct"
              ? `Solved on attempt ${attemptNumber} of ${MAX_ATTEMPTS}. Read the full model answer below to see how the N·E·I structure reads as continuous prose.`
              : `Three attempts used. Read the full model answer below and try the scenario again when you're ready.`}
          </p>

          <section className="sm-sortmatch__model-section">
            <h3 className="sm-sortmatch__model-heading">N · Name</h3>
            <p className="sm-sortmatch__model-text">
              {scenario.modelAnswer.name}
            </p>
          </section>

          <section className="sm-sortmatch__model-section">
            <h3 className="sm-sortmatch__model-heading">E · Explain</h3>
            <p className="sm-sortmatch__model-text">
              {scenario.modelAnswer.explain}
            </p>
          </section>

          <section className="sm-sortmatch__model-section">
            <h3 className="sm-sortmatch__model-heading">I · Impact</h3>
            <p className="sm-sortmatch__model-text">
              {scenario.modelAnswer.impact}
            </p>
          </section>
        </div>
      )}

      <style>{`
        .sm-sortmatch {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .sm-sortmatch__scenario-title {
          padding: 1rem 1.25rem;
          background: var(--void, rgba(0, 0, 0, 0.25));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          border-left: 2px solid var(--gold, #ffd700);
          border-radius: 2px;
        }
        .sm-sortmatch__scenario-kicker {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--dim, rgba(232, 237, 243, 0.55));
          margin: 0 0 0.5rem;
        }
        .sm-sortmatch__scenario-name {
          margin: 0;
          color: var(--ink, #e8edf3);
          font-size: 1.25rem;
          font-weight: 600;
        }

        .sm-sortmatch__panels {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.75rem;
          padding: 1rem;
          background: var(--void, rgba(0, 0, 0, 0.25));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          border-radius: 2px;
        }
        .sm-sortmatch__panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          border-radius: 2px;
        }
        .sm-sortmatch__panel-caption {
          margin: 0;
          font-size: 0.75rem;
          line-height: 1.4;
          color: var(--dim, rgba(232, 237, 243, 0.75));
          text-align: center;
        }

        .sm-sortmatch__activity {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .sm-sortmatch__section-kicker {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--dim, rgba(232, 237, 243, 0.55));
          margin: 0;
        }

        .sm-sortmatch__phrase-pool {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .sm-sortmatch__pool-dropzone {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed var(--border, rgba(255, 255, 255, 0.12));
          border-radius: 2px;
          min-height: 60px;
          transition: border-color 120ms ease, background 120ms ease;
        }
        .sm-sortmatch__pool-dropzone--over {
          border-color: var(--green, #39ff14);
          background: rgba(57, 255, 20, 0.05);
        }
        .sm-sortmatch__pool-empty {
          margin: 0;
          padding: 0.5rem;
          color: var(--muted, rgba(232, 237, 243, 0.55));
          font-size: 0.85rem;
          text-align: center;
          font-style: italic;
        }
        .sm-sortmatch__phrases {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .sm-sortmatch__phrase {
          padding: 0.75rem 1rem;
          background: var(--void, rgba(0, 0, 0, 0.45));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          border-left: 2px solid var(--green, #39ff14);
          border-radius: 2px;
          color: var(--ink, #e8edf3);
          font-size: 0.9rem;
          line-height: 1.5;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          transition: border-color 160ms ease;
        }
        .sm-sortmatch__phrase-text {
          flex: 1;
        }
        .sm-sortmatch__phrase--correct {
          border-left-color: var(--green, #39ff14);
          box-shadow: inset 2px 0 0 var(--green, #39ff14);
        }
        .sm-sortmatch__phrase--incorrect {
          border-left-color: var(--red, #ff3b3b);
          box-shadow: inset 2px 0 0 var(--red, #ff3b3b);
        }
        .sm-sortmatch__phrase-marker {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.65rem;
          letter-spacing: 0.18em;
          padding: 0.2rem 0.5rem;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .sm-sortmatch__phrase-marker--correct {
          color: var(--green, #39ff14);
          background: rgba(57, 255, 20, 0.1);
          border: 1px solid rgba(57, 255, 20, 0.35);
        }
        .sm-sortmatch__phrase-marker--incorrect {
          color: var(--red, #ff3b3b);
          background: rgba(255, 59, 59, 0.1);
          border: 1px solid rgba(255, 59, 59, 0.35);
        }

        .sm-sortmatch__bucket-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .sm-sortmatch__bucket-group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sm-sortmatch__reset {
          background: transparent;
          color: var(--dim, rgba(232, 237, 243, 0.75));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
          padding: 0.4rem 0.9rem;
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 2px;
          transition: color 120ms ease, border-color 120ms ease;
        }
        .sm-sortmatch__reset:hover {
          color: var(--ink, #e8edf3);
          border-color: var(--green, #39ff14);
        }

        .sm-sortmatch__bucket-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .sm-sortmatch__bucket {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.25rem 1rem;
          background: var(--void, rgba(0, 0, 0, 0.25));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          border-radius: 2px;
          min-height: 180px;
        }
        .sm-sortmatch__bucket-letter {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--green, #39ff14);
          line-height: 1;
        }
        .sm-sortmatch__bucket-label {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--dim, rgba(232, 237, 243, 0.55));
          margin-top: 0.25rem;
          margin-bottom: 1rem;
        }
        .sm-sortmatch__bucket-content {
          flex: 1;
          width: 100%;
          min-height: 80px;
          padding: 0.5rem;
          border: 1px dashed var(--border, rgba(255, 255, 255, 0.12));
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: border-color 120ms ease, background 120ms ease;
        }
        .sm-sortmatch__bucket-content--over {
          border-color: var(--green, #39ff14);
          background: rgba(57, 255, 20, 0.05);
        }

        .sm-sortmatch__attempt-banner {
          padding: 0.875rem 1rem;
          background: var(--void, rgba(0, 0, 0, 0.35));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          border-left: 2px solid var(--gold, #ffd700);
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .sm-sortmatch__attempt-banner-kicker {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          color: var(--gold, #ffd700);
        }
        .sm-sortmatch__attempt-banner-text {
          color: var(--ink, #e8edf3);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .sm-sortmatch__check {
          align-self: flex-start;
          background: var(--green, #39ff14);
          color: var(--void, #0a0e1a);
          border: 0;
          padding: 0.75rem 1.5rem;
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.85rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
          border-radius: 2px;
          transition: background 120ms ease, box-shadow 120ms ease;
        }
        .sm-sortmatch__check:hover {
          background: #2ed60f;
          box-shadow: 0 0 0 4px rgba(57, 255, 20, 0.15);
        }

        .sm-sortmatch__model-answer {
          padding: 1.5rem;
          background: var(--void, rgba(0, 0, 0, 0.25));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          border-left: 2px solid var(--green, #39ff14);
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .sm-sortmatch__model-answer--with-help {
          border-left-color: var(--gold, #ffd700);
        }
        .sm-sortmatch__model-answer-kicker {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          margin: 0;
          color: var(--green, #39ff14);
        }
        .sm-sortmatch__model-answer--with-help
          .sm-sortmatch__model-answer-kicker {
          color: var(--gold, #ffd700);
        }
        .sm-sortmatch__model-answer-context {
          margin: 0;
          color: var(--dim, rgba(232, 237, 243, 0.75));
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .sm-sortmatch__model-section {
          padding-top: 0.75rem;
          border-top: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }
        .sm-sortmatch__model-section:first-of-type {
          border-top: 0;
          padding-top: 0;
        }
        .sm-sortmatch__model-heading {
          margin: 0 0 0.5rem;
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          color: var(--green, #39ff14);
          font-weight: 700;
        }
        .sm-sortmatch__model-text {
          margin: 0;
          color: var(--ink, #e8edf3);
          font-size: 0.95rem;
          line-height: 1.65;
        }

        .sm-sortmatch__status {
          padding: 2rem;
          text-align: center;
          color: var(--muted, rgba(232, 237, 243, 0.55));
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
        }

        @media (max-width: 768px) {
          .sm-sortmatch__panels {
            grid-template-columns: repeat(2, 1fr);
          }
          .sm-sortmatch__bucket-row {
            grid-template-columns: 1fr;
          }
          .sm-sortmatch__phrase {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .sm-sortmatch__panels {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
