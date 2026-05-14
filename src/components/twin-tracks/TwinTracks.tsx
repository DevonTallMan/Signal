// src/components/twin-tracks/TwinTracks.tsx
//
// React island for the Twin Tracks Discuss-style activity.
// Sprint 4 worked example: Hospital Remote Access (single scenario currently).
//
// Sprint 4 Increment 4.2 scope: TWO-DIMENSIONAL DRAG-AND-DROP.
//   - @dnd-kit/core PointerSensor + TouchSensor wired
//   - 6 phrase cards draggable from pool and between cells
//   - 7 droppables: 6 cells (encoded as `${track}-${slot}`) plus the pool
//   - Drop registers the (track, slot) pair on the phrase's local state
//   - No validation yet. Any phrase can land in any cell.
//
// What this PR does NOT do (per docs/sprint-4-scope.md):
//   - Per-drop validation, diagnostic feedback, stuck mitigation, model
//     answer reveal (Inc 4.3)
//   - Session loop and sessionPicker (Inc 4.4)
//   - Firestore persistence and rules tests (Inc 4.5)
//   - Playwright tests (Inc 4.6)
//
// See docs/sort-and-match-nei-spec.md for full Twin Tracks spec.

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
import scenariosData from "../../data/twin-tracks/scenarios.json";
import { Glyph } from "../glyphs";
import type { GlyphName } from "../glyphs";

interface ScenarioPanel {
  id: string;
  glyph: GlyphName;
  caption: string;
}

type Track = "positive" | "negative";
type Slot = "introduce" | "explain" | "develop";

interface Phrase {
  id: string;
  text: string;
  track: Track;
  slot: Slot;
}

interface ModelAnswerCell {
  introduce: string;
  explain: string;
  develop: string;
}

interface ModelAnswer {
  positive: ModelAnswerCell;
  negative: ModelAnswerCell;
}

interface Scenario {
  id: string;
  title: string;
  questionType: "discuss";
  scenarioPanels: ScenarioPanel[];
  phrases: Phrase[];
  modelAnswer: ModelAnswer;
}

type CellId = `${Track}-${Slot}`;
type Location = "pool" | CellId;

const TRACKS: readonly Track[] = ["positive", "negative"] as const;
const SLOTS: readonly Slot[] = ["introduce", "explain", "develop"] as const;

const TRACK_LABELS: Record<Track, string> = {
  positive: "Positive impact",
  negative: "Negative impact",
};

const SLOT_LABELS: Record<Slot, string> = {
  introduce: "Introduce",
  explain: "Explain",
  develop: "Develop",
};

function cellId(track: Track, slot: Slot): CellId {
  return `${track}-${slot}` as CellId;
}

function initialLocations(phrases: Phrase[]): Record<string, Location> {
  const out: Record<string, Location> = {};
  for (const p of phrases) out[p.id] = "pool";
  return out;
}

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
      className="tt-twintracks__phrase"
      style={style}
      {...listeners}
      {...attributes}
    >
      <span className="tt-twintracks__phrase-text">{phrase.text}</span>
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
export default function TwinTracks(): JSX.Element {
  const scenarios = scenariosData as Scenario[];
  const scenario = scenarios[0];

  const [phraseLocations, setPhraseLocations] = useState<
    Record<string, Location>
  >(() => initialLocations(scenario.phrases));

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

  const phrasesIn = (loc: Location): Phrase[] =>
    scenario.phrases.filter((p) => phraseLocations[p.id] === loc);

  return (
    <div className="tt-twintracks">
      <p className="tt-twintracks__framing">
        Discuss-style answers balance one positive and one negative impact.
        For each, identify the introduction, explanation, and developed
        consequence. Drag each phrase to the right track and slot.
      </p>

      <div className="tt-twintracks__scenario-title">
        <p className="tt-twintracks__scenario-kicker">SCENARIO</p>
        <h2 className="tt-twintracks__scenario-name">{scenario.title}</h2>
      </div>

      <div
        className="tt-twintracks__panels"
        role="list"
        aria-label="Scenario comic strip"
      >
        {scenario.scenarioPanels.map((panel) => (
          <div
            key={panel.id}
            className="tt-twintracks__panel"
            role="listitem"
          >
            <Glyph name={panel.glyph} size={48} />
            <p className="tt-twintracks__panel-caption">{panel.caption}</p>
          </div>
        ))}
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="tt-twintracks__activity">
          <div className="tt-twintracks__grid-group">
            <p className="tt-twintracks__section-kicker">SORT INTO</p>
            <div
              className="tt-twintracks__grid"
              role="grid"
              aria-label="Twin Tracks placement grid"
            >
              <div className="tt-twintracks__corner" aria-hidden="true"></div>
              {SLOTS.map((slot) => (
                <div
                  key={`header-${slot}`}
                  className="tt-twintracks__col-header"
                  role="columnheader"
                >
                  {SLOT_LABELS[slot]}
                </div>
              ))}
              {TRACKS.flatMap((track) => [
                <div
                  key={`label-${track}`}
                  className={`tt-twintracks__row-label tt-twintracks__row-label--${track}`}
                  role="rowheader"
                >
                  {TRACK_LABELS[track]}
                </div>,
                ...SLOTS.map((slot) => {
                  const id = cellId(track, slot);
                  return (
                    <Droppable
                      key={id}
                      id={id}
                      className={`tt-twintracks__cell tt-twintracks__cell--${track}`}
                      ariaLabel={`${TRACK_LABELS[track]}, ${SLOT_LABELS[slot]}`}
                    >
                      {phrasesIn(id).map((phrase) => (
                        <DraggablePhrase key={phrase.id} phrase={phrase} />
                      ))}
                    </Droppable>
                  );
                }),
              ])}
            </div>
          </div>

          <div className="tt-twintracks__phrase-pool">
            <p className="tt-twintracks__section-kicker">PHRASE POOL</p>
            <Droppable
              id="pool"
              className="tt-twintracks__pool"
              ariaLabel="Phrase pool"
            >
              <div className="tt-twintracks__phrases">
                {phrasesIn("pool").map((phrase) => (
                  <DraggablePhrase key={phrase.id} phrase={phrase} />
                ))}
                {phrasesIn("pool").length === 0 && (
                  <p className="tt-twintracks__pool-empty">
                    Pool empty. Drag phrases back here to clear a cell.
                  </p>
                )}
              </div>
            </Droppable>
          </div>
        </div>
      </DndContext>

      <style>{commonStyles}</style>
    </div>
  );
}

const commonStyles = `
  .tt-twintracks {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .tt-twintracks__framing {
    margin: 0;
    color: var(--dim, rgba(232, 237, 243, 0.75));
    font-size: 0.95rem;
    line-height: 1.6;
    max-width: 68ch;
  }

  .tt-twintracks__scenario-title {
    padding: 1rem 1.25rem;
    background: var(--void, rgba(0, 0, 0, 0.25));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-left: 2px solid var(--gold, #ffd700);
    border-radius: 2px;
  }
  .tt-twintracks__scenario-kicker {
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--dim, rgba(232, 237, 243, 0.55));
    margin: 0 0 0.5rem;
  }
  .tt-twintracks__scenario-name {
    margin: 0;
    color: var(--ink, #e8edf3);
    font-size: 1.25rem;
    font-weight: 600;
  }

  .tt-twintracks__panels {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.75rem;
    padding: 1rem;
    background: var(--void, rgba(0, 0, 0, 0.25));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 2px;
  }
  .tt-twintracks__panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 2px;
  }
  .tt-twintracks__panel-caption {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--dim, rgba(232, 237, 243, 0.75));
    text-align: center;
  }

  .tt-twintracks__activity {
    display: grid;
    grid-template-columns: 1fr 18rem;
    gap: 1.5rem;
  }

  .tt-twintracks__section-kicker {
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--dim, rgba(232, 237, 243, 0.55));
    margin: 0 0 0.75rem;
  }

  .tt-twintracks__grid {
    display: grid;
    grid-template-columns: 8.5rem repeat(3, 1fr);
    gap: 0.5rem;
  }
  .tt-twintracks__corner {
    /* empty top-left intersection cell */
  }
  .tt-twintracks__col-header {
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--dim, rgba(232, 237, 243, 0.55));
    text-align: center;
    padding: 0.5rem 0;
  }
  .tt-twintracks__row-label {
    display: flex;
    align-items: center;
    padding: 1rem 0.75rem;
    background: var(--void, rgba(0, 0, 0, 0.25));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 2px;
    color: var(--ink, #e8edf3);
    font-size: 0.9rem;
    font-weight: 600;
  }
  .tt-twintracks__row-label--positive {
    border-left: 2px solid var(--green, #39ff14);
  }
  .tt-twintracks__row-label--negative {
    border-left: 2px solid var(--red, #ff3b3b);
    margin-top: 0.5rem;
  }
  .tt-twintracks__cell {
    min-height: 110px;
    padding: 0.75rem;
    background: var(--void, rgba(0, 0, 0, 0.15));
    border: 1px dashed var(--border, rgba(255, 255, 255, 0.12));
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: border-color 120ms ease, background 120ms ease;
  }
  .tt-twintracks__cell--negative {
    margin-top: 0.5rem;
  }
  .tt-twintracks__cell--over {
    border-color: var(--green, #39ff14);
    background: rgba(57, 255, 20, 0.05);
  }

  .tt-twintracks__phrase-pool {
    display: flex;
    flex-direction: column;
  }
  .tt-twintracks__pool {
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed var(--border, rgba(255, 255, 255, 0.12));
    border-radius: 2px;
    min-height: 80px;
    transition: border-color 120ms ease, background 120ms ease;
  }
  .tt-twintracks__pool--over {
    border-color: var(--green, #39ff14);
    background: rgba(57, 255, 20, 0.05);
  }
  .tt-twintracks__pool-empty {
    margin: 0;
    padding: 0.5rem;
    color: var(--muted, rgba(232, 237, 243, 0.55));
    font-size: 0.85rem;
    text-align: center;
    font-style: italic;
  }
  .tt-twintracks__phrases {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .tt-twintracks__phrase {
    padding: 0.75rem 1rem;
    background: var(--void, rgba(0, 0, 0, 0.45));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-left: 2px solid var(--green, #39ff14);
    border-radius: 2px;
    color: var(--ink, #e8edf3);
    font-size: 0.85rem;
    line-height: 1.5;
    user-select: none;
    transition: border-color 160ms ease;
  }
  .tt-twintracks__phrase-text {
    display: block;
  }

  @media (max-width: 900px) {
    .tt-twintracks__activity {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .tt-twintracks__panels {
      grid-template-columns: repeat(3, 1fr);
    }
    .tt-twintracks__grid {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
    .tt-twintracks__col-header {
      display: none;
    }
    .tt-twintracks__row-label {
      margin-top: 0;
    }
    .tt-twintracks__cell {
      margin-top: 0;
    }
    .tt-twintracks__cell--negative {
      margin-top: 0;
    }
    .tt-twintracks__cell::before {
      content: attr(aria-label);
      display: block;
      font-family: "JetBrains Mono", "Courier New", monospace;
      font-size: 0.65rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--dim, rgba(232, 237, 243, 0.55));
      margin-bottom: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .tt-twintracks__panels {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;
