// src/lib/axiom.ts
//
// Client for AXIOM-7, the Cloudflare Worker that proxies student
// answers to Groq's LLM for Answer-Arc marking.
//
// The Worker's URL is fixed for now. When Signal needs multi-env
// (e.g. staging vs production prompts), the URL or a model parameter
// can become configurable via Astro public env vars.
//
// The Worker accepts a JSON body with scenario/question/answer
// (plus a question ID for logging) and returns a JSON object with
// a single `text` field containing the rigid OUTPUT FORMAT defined
// in the AXIOM-7 system prompt:
//
//   MARKS: X/Y
//   NAME: [HIT/MISS] - <sentence>
//   EXPLAIN: [HIT/MISS] - <sentence>
//   IMPACT: [HIT/MISS/PARTIAL] - <sentence>
//   VERDICT: <sentences>
//
// This module POSTs the request and parses the text into a
// typed ArcMarking structure.

import type { ArcHit, ArcImpact, ArcMarking } from './types';

const AXIOM_URL =
  'https://msm-axiom-proxy.morrischristopher675.workers.dev/mark';

export interface AxiomRequest {
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
  answer: string;
}

export class AxiomError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AxiomError';
  }
}

/**
 * Send a marking request to AXIOM-7 and return the parsed result.
 * Throws AxiomError on network failure, non-2xx response, or parse
 * failure. The UI surfaces these as "marking failed, try again"; the
 * student's answer is not lost (the form preserves it).
 */
export async function markAnswer(req: AxiomRequest): Promise<ArcMarking> {
  let response: Response;
  try {
    response = await fetch(AXIOM_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req),
    });
  } catch (networkErr) {
    throw new AxiomError('Could not reach AXIOM-7', networkErr);
  }

  if (!response.ok) {
    throw new AxiomError(`AXIOM-7 returned ${response.status}`);
  }

  let payload: { text?: string };
  try {
    payload = await response.json();
  } catch (parseErr) {
    throw new AxiomError('AXIOM-7 returned invalid JSON', parseErr);
  }

  if (!payload.text || typeof payload.text !== 'string') {
    throw new AxiomError('AXIOM-7 response missing text field');
  }

  return parseAxiomResponse(payload.text);
}

/**
 * Parse the AXIOM-7 text response into a structured ArcMarking.
 * Exported for unit testing even though only markAnswer is used
 * in production code.
 */
export function parseAxiomResponse(text: string): ArcMarking {
  // Be forgiving of leading/trailing whitespace. Split into lines;
  // each field lives on its own line per the prompt's OUTPUT FORMAT.
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const marks = parseMarks(find(lines, 'MARKS:'));
  const name = parseHitLine(find(lines, 'NAME:'));
  const explain = parseHitLine(find(lines, 'EXPLAIN:'));
  const impact = parseImpactLine(find(lines, 'IMPACT:'));
  const verdict = parseVerdict(lines);

  return { marks, name, explain, impact, verdict };
}

function find(lines: string[], prefix: string): string {
  const match = lines.find((l) => l.startsWith(prefix));
  if (!match) {
    throw new AxiomError(`AXIOM-7 response missing ${prefix} line`);
  }
  return match.slice(prefix.length).trim();
}

function parseMarks(line: string): { awarded: number; max: number } {
  const m = line.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!m) {
    throw new AxiomError(`AXIOM-7 MARKS line not in X/Y form: ${line}`);
  }
  return { awarded: Number(m[1]), max: Number(m[2]) };
}

function parseHitLine(line: string): { state: ArcHit; comment: string } {
  // Expect: "[HIT] - comment" or variants. Tolerate em-dash and en-dash.
  const m = line.match(/^\[?(HIT|MISS)\]?\s*[-\u2014\u2013]?\s*(.*)$/i);
  if (!m) {
    throw new AxiomError(`AXIOM-7 HIT/MISS line malformed: ${line}`);
  }
  const state = m[1].toUpperCase() as ArcHit;
  const comment = m[2].trim();
  return { state, comment };
}

function parseImpactLine(line: string): { state: ArcImpact; comment: string } {
  const m = line.match(/^\[?(HIT|MISS|PARTIAL)\]?\s*[-\u2014\u2013]?\s*(.*)$/i);
  if (!m) {
    throw new AxiomError(`AXIOM-7 IMPACT line malformed: ${line}`);
  }
  const state = m[1].toUpperCase() as ArcImpact;
  const comment = m[2].trim();
  return { state, comment };
}

function parseVerdict(lines: string[]): string {
  const idx = lines.findIndex((l) => l.startsWith('VERDICT:'));
  if (idx === -1) {
    throw new AxiomError('AXIOM-7 response missing VERDICT line');
  }
  // VERDICT can span multiple lines; everything after VERDICT: joins.
  const first = lines[idx].slice('VERDICT:'.length).trim();
  const rest = lines.slice(idx + 1).join(' ').trim();
  return rest ? `${first} ${rest}`.trim() : first;
}
