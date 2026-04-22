// src/lib/types.ts
//
// Shared types for the Signal submission and marking flow.
// Kept thin on purpose. Expand as the product grows.

export type ArcHit = 'HIT' | 'MISS';
export type ArcImpact = 'HIT' | 'MISS' | 'PARTIAL';

/**
 * Parsed form of AXIOM-7's structured marking response.
 * The Worker returns raw text in a rigid format; parseAxiomResponse
 * in axiom.ts converts it into this shape before it reaches any UI.
 */
export interface ArcMarking {
  marks: {
    awarded: number;
    max: number;
  };
  name: {
    state: ArcHit;
    comment: string;
  };
  explain: {
    state: ArcHit;
    comment: string;
  };
  impact: {
    state: ArcImpact;
    comment: string;
  };
  verdict: string;
}

/**
 * Firestore document written to users/{uid}/submissions/{submissionId}
 * on every completed marking. Source is a future-proofing field: when
 * Signal and the legacy site share a Firestore project, the field lets
 * analytics filter by origin.
 */
export interface Submission {
  topicId: string;          // e.g. "6-1-1-data-types"
  questionId: string;       // e.g. "611-nei-01"
  answerText: string;       // the student's written answer, unmodified
  submittedAt: number;      // Date.now() at submit time
  marking: ArcMarking;      // the structured AXIOM-7 result
  source: 'signal';         // static literal; branch for Edtech later
}

/**
 * A single clause-by-clause exemplar of a full-marks answer, broken
 * into the three Answer Arc components. An NEI's exemplar_arc field
 * is an array of these; an array of length > 1 represents questions
 * that ask for multiple independent points (e.g. "identify two
 * considerations and explain each"). The ExemplarArc component
 * renders them as numbered blocks when the array has more than one
 * entry.
 *
 * Strings are plain prose. No markup, no HTML. The rendering
 * component handles all styling.
 */
export interface ArcExemplarClause {
  name: string;
  explain: string;
  impact: string;
}
