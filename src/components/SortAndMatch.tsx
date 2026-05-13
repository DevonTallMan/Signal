// src/components/SortAndMatch.tsx
//
// React island for the Sort & Match N·E·I drag-and-drop activity.
// Sprint 3 worked example: Six Vs and Data Quality.
//
// Sprint 3 Increment 3.2 scope: DRAG-AND-DROP WIRING.
//   - Phrases are draggable from the pool
//   - Buckets (N, E, I) accept drops; phrases can also be returned to the pool
//   - Buckets highlight when a phrase is being dragged over them
//   - Reset button sends all phrases back to the pool
//   - Pointer (mouse) AND touch (tablet/phone) sensors enabled
//   - No reordering inside buckets (drop anywhere in a bucket; phrases stack)
//   - No validation (Inc 3.3)
//   - No session loop (Inc 3.4)
//   - No Firestore persistence (Inc 3.5)
//   - No tests (Inc 3.6)
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

const BUCKET_LABELS: Record<"N" | "E" | "I", string> = {
  N: "Name",
  E: "Explain",
  I: "Impact",
};

// ---------- DraggablePhrase ----------
interface DraggablePhraseProps {
  phrase: Phrase;
}

function DraggablePhrase({ phrase }: DraggablePhraseProps): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: phrase.id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      className="sm-sortmatch__phrase"
      style={style}
      {...listeners}
      {...attributes}
    >
      {phrase.text}
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

  // Build the initial layout: every phrase starts in the pool.
  const [phraseLocations, setPhraseLocations] = useState<
    Record<string, Location>
  >(() => {
    const initial: Record<string, Location> = {};
    if (scenario) {
      for (const p of scenario.phrases) initial[p.id] = "pool";
    }
    return initial;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 5 },
    })
  );

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over) return;
    const newLocation = over.id as Location;
    setPhraseLocations((prev) => ({
      ...prev,
      [String(active.id)]: newLocation,
    }));
  }

  function handleReset(): void {
    if (!scenario) return;
    const reset: Record<string, Location> = {};
    for (const p of scenario.phrases) reset[p.id] = "pool";
    setPhraseLocations(reset);
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
                  <DraggablePhrase key={phrase.id} phrase={phrase} />
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
                      <DraggablePhrase key={phrase.id} phrase={phrase} />
                    ))}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DndContext>

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
