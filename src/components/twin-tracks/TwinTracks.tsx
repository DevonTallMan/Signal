// src/components/twin-tracks/TwinTracks.tsx
//
// React island for the Twin Tracks Discuss-style activity.
// Sprint 4 worked example: Hospital Remote Access (single scenario currently).
//
// Sprint 4 Increment 4.1 scope: STATIC UI SHELL ONLY.
//   - Renders the scenarioPanels comic strip (6 panels using Glyph)
//   - Renders phrase pool (6 phrases as static cards)
//   - Renders 6-cell grid (positive top, negative bottom; introduce/explain/develop)
//   - One-line framing caption per spec Section 4.2
//   - No drag-and-drop (Inc 4.2)
//   - No validation, persistence, session loop, or tests (later increments)
//
// See docs/sort-and-match-nei-spec.md for full Twin Tracks spec.
// See docs/sprint-4-scope.md for increment breakdown.

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

export default function TwinTracks(): JSX.Element {
  const scenarios = scenariosData as Scenario[];
  const scenario = scenarios[0];

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
              ...SLOTS.map((slot) => (
                <div
                  key={`${track}-${slot}`}
                  className={`tt-twintracks__cell tt-twintracks__cell--${track}`}
                  role="gridcell"
                  aria-label={`${TRACK_LABELS[track]}, ${SLOT_LABELS[slot]}`}
                >
                  {/* Drop targets wire in Inc 4.2 */}
                </div>
              )),
            ])}
          </div>
        </div>

        <div className="tt-twintracks__phrase-pool">
          <p className="tt-twintracks__section-kicker">PHRASE POOL</p>
          <div className="tt-twintracks__pool">
            <div className="tt-twintracks__phrases">
              {scenario.phrases.map((phrase) => (
                <div key={phrase.id} className="tt-twintracks__phrase">
                  <span className="tt-twintracks__phrase-text">
                    {phrase.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
  }
  .tt-twintracks__cell--negative {
    margin-top: 0.5rem;
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
