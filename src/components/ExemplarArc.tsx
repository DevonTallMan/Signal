// src/components/ExemplarArc.tsx
//
// Renders a worked, full-marks NEI answer broken into its Name /
// Explain / Impact clauses, each clause visually tagged with a
// monospaced component label and a distinct left-border accent.
//
// Purpose is pedagogical, not decorative. The aim is to make the
// Answer Arc framework concrete by showing what a complete answer
// looks like clause by clause, so a student can compare their own
// attempt against the structure rather than against a free-form
// block of text.
//
// Colour mapping in this component is by COMPONENT (Name / Explain
// / Impact), not by state (HIT / PARTIAL / MISS). This is a
// deliberate departure from the ribbon's colour scheme. The ribbon
// communicates "did you get the mark"; this component communicates
// "which part of the arc is which". To avoid confusion, the
// component renders a small legend and a one-line note clarifying
// that it shows a worked 4-mark answer.
//
// Placement is agnostic. Wire this in wherever makes pedagogical
// sense. At time of authoring it replaces the free-text exemplar
// in the post-submission MarkingResult view.

import type { ArcExemplarClause } from '../lib/types';

export interface ExemplarArcProps {
  arc: ArcExemplarClause[];
  maxMarks?: number;
}

export default function ExemplarArc({ arc, maxMarks }: ExemplarArcProps) {
  if (arc.length === 0) {
    return null;
  }

  return (
    <div className="exemplar-arc">
      <div className="exemplar-arc__header">
        <div className="eyebrow">
          Worked {maxMarks ? `${maxMarks}/${maxMarks} ` : ''}answer
        </div>
        <p className="exemplar-arc__note">
          Each clause below is tagged with the Answer Arc component
          it addresses. Compare against your own attempt.
        </p>
      </div>

      <div className="exemplar-arc__legend" aria-hidden="true">
        <span className="exemplar-arc__legend-item exemplar-arc__legend-item--name">
          Name
        </span>
        <span className="exemplar-arc__legend-item exemplar-arc__legend-item--explain">
          Explain
        </span>
        <span className="exemplar-arc__legend-item exemplar-arc__legend-item--impact">
          Impact
        </span>
      </div>

      {arc.map((clause, i) => (
        <div
          key={i}
          className="exemplar-arc__block"
          aria-label={
            arc.length > 1
              ? `Exemplar block ${i + 1} of ${arc.length}`
              : 'Exemplar'
          }
        >
          {arc.length > 1 && (
            <div className="exemplar-arc__block-index">
              {String(i + 1).padStart(2, '0')}
            </div>
          )}

          <ArcClause label="Name" text={clause.name} variant="name" />
          <ArcClause label="Explain" text={clause.explain} variant="explain" />
          <ArcClause label="Impact" text={clause.impact} variant="impact" />
        </div>
      ))}
    </div>
  );
}

interface ArcClauseProps {
  label: string;
  text: string;
  variant: 'name' | 'explain' | 'impact';
}

function ArcClause({ label, text, variant }: ArcClauseProps) {
  return (
    <div className={`arc-clause arc-clause--${variant}`}>
      <div className="arc-clause__label">{label}</div>
      <p className="arc-clause__text">{text}</p>
    </div>
  );
}
