// src/components/SortAndMatch.tsx
//
// React island for the Sort & Match N·E·I drag-and-drop activity.
// Sprint 3 worked example: Six Vs and Data Quality.
//
// Sprint 3 Increment 3.1 scope: STATIC UI SHELL ONLY
//   - Renders scenarioPanels comic strip (5 panels with Glyph + caption)
//   - Renders phrase pool (5 phrases as static cards)
//   - Renders three buckets (N, E, I) as empty containers
//   - No drag-and-drop interaction (Inc 3.2)
//   - No validation feedback (Inc 3.3)
//   - No session loop (Inc 3.4)
//   - No Firestore persistence (Inc 3.5)
//   - No tests (Inc 3.6)
//
// See docs/sort-and-match-nei-spec.md for full Sprint 3 spec.

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

const BUCKET_LABELS: Record<"N" | "E" | "I", string> = {
  N: "Name",
  E: "Explain",
  I: "Impact",
};

export default function SortAndMatch(): JSX.Element {
  const scenarios = scenariosData as Scenario[];
  const scenario = scenarios[0];

  if (!scenario) {
    return (
      <div className="sm-sortmatch">
        <div className="sm-sortmatch__status">No scenarios available.</div>
      </div>
    );
  }

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

      <div className="sm-sortmatch__activity">
        <div className="sm-sortmatch__phrase-pool">
          <p className="sm-sortmatch__section-kicker">PHRASE POOL</p>
          <div className="sm-sortmatch__phrases">
            {scenario.phrases.map((phrase) => (
              <div key={phrase.id} className="sm-sortmatch__phrase">
                {phrase.text}
              </div>
            ))}
          </div>
        </div>

        <div className="sm-sortmatch__bucket-group">
          <p className="sm-sortmatch__section-kicker">SORT INTO</p>
          <div className="sm-sortmatch__bucket-row">
            {(["N", "E", "I"] as const).map((cat) => (
              <div key={cat} className="sm-sortmatch__bucket">
                <div className="sm-sortmatch__bucket-letter">{cat}</div>
                <div className="sm-sortmatch__bucket-label">
                  {BUCKET_LABELS[cat]}
                </div>
                <div
                  className="sm-sortmatch__bucket-content"
                  aria-label={`${BUCKET_LABELS[cat]} bucket`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

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
          margin: 0 0 0.75rem;
        }

        .sm-sortmatch__phrase-pool {
          display: flex;
          flex-direction: column;
        }
        .sm-sortmatch__phrases {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .sm-sortmatch__phrase {
          padding: 0.75rem 1rem;
          background: var(--void, rgba(0, 0, 0, 0.25));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          border-left: 2px solid var(--green, #39ff14);
          border-radius: 2px;
          color: var(--ink, #e8edf3);
          font-size: 0.9rem;
          line-height: 1.5;
          cursor: not-allowed;
          opacity: 0.85;
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
          border: 1px dashed var(--border, rgba(255, 255, 255, 0.12));
          border-radius: 2px;
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
