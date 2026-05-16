// src/lib/teacher/serialise.ts
//
// Pure serialisers for the teacher export endpoint. Convert the
// fetched cohort data into JSON and CSV payloads suitable for
// offline analysis post-pilot.
//
// JSON shape: nested, captures the full data path (per-student
// summary + raw drillRatings + raw activity sessions + topic
// catalogue + generation metadata). This is the format Chris will
// want for the writeup, because it preserves the event-level data
// needed to recompute things differently later.
//
// CSV shape: one row per drill rating event. The most-analysable
// flat shape for pivot-table workflows. Columns:
//   student_label, student_uid, topic_id, topic_title, term_id,
//   outcome, rated_at_iso, last_rated_at_iso, box_level
// A separate sessions CSV is not produced; users who need sessions
// should take the JSON.
//
// Both serialisers are pure functions for unit testability.

import type {
  DrillRatingDoc,
  ActivitySessionDoc,
} from "./aggregate";

export interface ExportCohortMember {
  uid: string;
  label: string;
  drillRatings: readonly DrillRatingDoc[];
  sessions: readonly ActivitySessionDoc[];
}

export interface ExportTopic {
  id: string;
  title: string;
  sectionId: string;
  contentArea: string;
}

export interface ExportInput {
  generatedAtIso: string;
  cohort: readonly ExportCohortMember[];
  topics: readonly ExportTopic[];
}

function tsToIso(ts: { toMillis: () => number } | null | undefined): string | null {
  if (!ts) return null;
  try {
    return new Date(ts.toMillis()).toISOString();
  } catch {
    return null;
  }
}

// JSON serialisation. Returns a pretty-printed string with 2-space
// indent for readability when the file is opened in an editor.
export function toJson(input: ExportInput): string {
  const payload = {
    generatedAt: input.generatedAtIso,
    cohortSize: input.cohort.length,
    topics: input.topics.map((t) => ({
      id: t.id,
      title: t.title,
      sectionId: t.sectionId,
      contentArea: t.contentArea,
    })),
    students: input.cohort.map((m) => ({
      uid: m.uid,
      label: m.label,
      drillRatings: m.drillRatings.map((r) => ({
        topicId: r.topicId,
        termId: r.termId,
        outcome: r.outcome,
        ratedAt: tsToIso(r.ratedAt),
        lastRatedAt: tsToIso(r.lastRatedAt),
        boxLevel: r.boxLevel ?? null,
        nextReviewDate: tsToIso(r.nextReviewDate),
      })),
      sessions: m.sessions.map((s) => ({
        startedAt: tsToIso(s.startedAt),
        completedAt: tsToIso(s.completedAt),
        score: s.score ?? null,
        totalScenarios: s.totalScenarios ?? null,
        mode: s.mode ?? null,
      })),
    })),
  };
  return JSON.stringify(payload, null, 2);
}

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = typeof value === "string" ? value : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// CSV serialisation. One row per drill rating event. The header row
// is always emitted so consumers can detect the schema.
export function toCsv(input: ExportInput): string {
  const header = [
    "student_label",
    "student_uid",
    "topic_id",
    "topic_title",
    "term_id",
    "outcome",
    "rated_at_iso",
    "last_rated_at_iso",
    "box_level",
  ];
  const titleByTopicId = new Map(input.topics.map((t) => [t.id, t.title]));

  const rows: string[] = [header.join(",")];
  for (const member of input.cohort) {
    for (const r of member.drillRatings) {
      const cells = [
        csvEscape(member.label),
        csvEscape(member.uid),
        csvEscape(r.topicId),
        csvEscape(titleByTopicId.get(r.topicId) ?? ""),
        csvEscape(r.termId),
        csvEscape(r.outcome),
        csvEscape(tsToIso(r.ratedAt)),
        csvEscape(tsToIso(r.lastRatedAt)),
        csvEscape(r.boxLevel ?? null),
      ];
      rows.push(cells.join(","));
    }
  }
  return rows.join("\n") + "\n";
}

export type ExportFormat = "json" | "csv";

export interface ExportFilePlan {
  filename: string;
  mimeType: string;
  body: string;
}

export function planExportFile(
  format: ExportFormat,
  input: ExportInput,
): ExportFilePlan {
  const stamp = input.generatedAtIso.replace(/[:.]/g, "-");
  if (format === "json") {
    return {
      filename: `signal-cohort-${stamp}.json`,
      mimeType: "application/json",
      body: toJson(input),
    };
  }
  return {
    filename: `signal-cohort-${stamp}.csv`,
    mimeType: "text/csv",
    body: toCsv(input),
  };
}
