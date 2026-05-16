// src/lib/teacher/serialise.test.ts
//
// Unit tests for the pure export serialisers. No emulator dependency.

import { describe, it, expect } from "vitest";
import {
  toJson,
  toCsv,
  planExportFile,
  type ExportInput,
} from "./serialise";

const ts = (ms: number) => ({ toMillis: () => ms });

const SAMPLE_INPUT: ExportInput = {
  generatedAtIso: "2026-09-21T10:00:00.000Z",
  cohort: [
    {
      uid: "uid-a",
      label: "Student 01",
      drillRatings: [
        {
          topicId: "4-1-1-data-protection",
          termId: "dpa-2018",
          outcome: "got",
          ratedAt: ts(1_700_000_000_000),
          lastRatedAt: ts(1_700_000_500_000),
          boxLevel: 2,
        },
        {
          topicId: "4-1-1-data-protection",
          termId: "uk-gdpr",
          outcome: "miss",
          ratedAt: ts(1_700_001_000_000),
        },
      ],
      sessions: [
        {
          startedAt: ts(1_700_000_000_000),
          completedAt: ts(1_700_000_900_000),
          score: 3,
          totalScenarios: 4,
          mode: "first-attempt",
        },
      ],
    },
    {
      uid: "uid-b",
      label: "Student 02",
      drillRatings: [],
      sessions: [],
    },
  ],
  topics: [
    {
      id: "4-1-1-data-protection",
      title: "Data Protection",
      sectionId: "4.1.1",
      contentArea: "4-1",
    },
  ],
};

describe("toJson", () => {
  it("preserves cohort size, topics and per-student records", () => {
    const out = toJson(SAMPLE_INPUT);
    const parsed = JSON.parse(out);
    expect(parsed.generatedAt).toBe("2026-09-21T10:00:00.000Z");
    expect(parsed.cohortSize).toBe(2);
    expect(parsed.topics).toHaveLength(1);
    expect(parsed.topics[0].id).toBe("4-1-1-data-protection");
    expect(parsed.students).toHaveLength(2);
  });

  it("serialises drill ratings with ISO timestamps", () => {
    const parsed = JSON.parse(toJson(SAMPLE_INPUT));
    const studentA = parsed.students[0];
    expect(studentA.uid).toBe("uid-a");
    expect(studentA.drillRatings).toHaveLength(2);
    expect(studentA.drillRatings[0].outcome).toBe("got");
    expect(studentA.drillRatings[0].ratedAt).toBe(
      new Date(1_700_000_000_000).toISOString(),
    );
    expect(studentA.drillRatings[0].lastRatedAt).toBe(
      new Date(1_700_000_500_000).toISOString(),
    );
    expect(studentA.drillRatings[0].boxLevel).toBe(2);
  });

  it("null-out absent timestamps", () => {
    const parsed = JSON.parse(toJson(SAMPLE_INPUT));
    const studentA = parsed.students[0];
    expect(studentA.drillRatings[1].lastRatedAt).toBeNull();
    expect(studentA.drillRatings[1].boxLevel).toBeNull();
  });

  it("empty cohort member still appears in the output", () => {
    const parsed = JSON.parse(toJson(SAMPLE_INPUT));
    const studentB = parsed.students[1];
    expect(studentB.uid).toBe("uid-b");
    expect(studentB.drillRatings).toEqual([]);
    expect(studentB.sessions).toEqual([]);
  });
});

describe("toCsv", () => {
  it("emits a header row plus one row per drill rating", () => {
    const out = toCsv(SAMPLE_INPUT);
    const lines = out.trim().split("\n");
    // 1 header + 2 ratings for student A + 0 for student B = 3 lines
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("student_label");
    expect(lines[0]).toContain("rated_at_iso");
  });

  it("includes the topic title from the catalogue", () => {
    const out = toCsv(SAMPLE_INPUT);
    expect(out).toContain("Data Protection");
  });

  it("escapes cells containing commas, quotes or newlines", () => {
    const trickyInput: ExportInput = {
      generatedAtIso: "2026-01-01T00:00:00.000Z",
      cohort: [
        {
          uid: "uid-tricky",
          label: 'Smith, "Bob"',
          drillRatings: [
            {
              topicId: "t1\nmultiline",
              termId: "a",
              outcome: "got",
              ratedAt: ts(1_700_000_000_000),
            },
          ],
          sessions: [],
        },
      ],
      topics: [],
    };
    const out = toCsv(trickyInput);
    expect(out).toContain('"Smith, ""Bob"""');
    expect(out).toContain('"t1\nmultiline"');
  });

  it("emits header only when cohort has no drill ratings at all", () => {
    const emptyInput: ExportInput = {
      generatedAtIso: "2026-01-01T00:00:00.000Z",
      cohort: [
        { uid: "uid-x", label: "Student", drillRatings: [], sessions: [] },
      ],
      topics: [],
    };
    const lines = toCsv(emptyInput).trim().split("\n");
    expect(lines).toHaveLength(1);
  });
});

describe("planExportFile", () => {
  it("json plan returns the JSON body with application/json mime", () => {
    const plan = planExportFile("json", SAMPLE_INPUT);
    expect(plan.mimeType).toBe("application/json");
    expect(plan.filename).toMatch(/^signal-cohort-.*\.json$/);
    expect(plan.body).toContain('"cohortSize": 2');
  });

  it("csv plan returns the CSV body with text/csv mime", () => {
    const plan = planExportFile("csv", SAMPLE_INPUT);
    expect(plan.mimeType).toBe("text/csv");
    expect(plan.filename).toMatch(/^signal-cohort-.*\.csv$/);
    expect(plan.body).toContain("student_label");
  });

  it("filename has no colons (filesystem-safe across OSes)", () => {
    const planJson = planExportFile("json", SAMPLE_INPUT);
    const planCsv = planExportFile("csv", SAMPLE_INPUT);
    expect(planJson.filename).not.toContain(":");
    expect(planCsv.filename).not.toContain(":");
  });
});
