// src/components/Teacher/TeacherExport.tsx
//
// React island for the /teacher/export endpoint.
//
// Reuses the auth + allowlist gate from TeacherView. Once data is
// loaded, triggers a download in one of two formats:
//
//   /teacher/export?format=json  → JSON file
//   /teacher/export?format=csv   → CSV file (drill-rating events)
//
// If no ?format query param is set, the page renders two download
// buttons (JSON, CSV) and waits for the user to choose.
//
// Curl is NOT supported. The endpoint requires a signed-in browser
// session with a teacher-allowlisted email. The scope doc described
// this as a "single JSON-or-CSV endpoint"; the client-side
// architecture locked at Inc 7.0 means it's a downloadable page
// rather than a true HTTP endpoint, but the file format is the
// deliverable for the post-pilot writeup.

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/useAuth";
import { isTeacherEmail } from "../../lib/teacher/allowlist";
import { COHORT } from "../../lib/teacher/cohort";
import { fetchCohort } from "../../lib/teacher/fetchCohort";
import {
  planExportFile,
  type ExportFormat,
  type ExportInput,
} from "../../lib/teacher/serialise";
import type { TopicMeta } from "./TeacherView";

interface Props {
  topics: readonly TopicMeta[];
}

type ExportState =
  | { kind: "loading" }
  | { kind: "unauthenticated" }
  | { kind: "denied" }
  | { kind: "fetching"; email: string }
  | { kind: "ready"; email: string; input: ExportInput }
  | { kind: "error"; email: string; message: string };

function downloadBlob(filename: string, mimeType: string, body: string): void {
  const blob = new Blob([body], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function readFormatFromUrl(): ExportFormat | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const f = params.get("format");
  if (f === "json" || f === "csv") return f;
  return null;
}

export default function TeacherExport({ topics }: Props) {
  const { user, loading } = useAuth();
  const [state, setState] = useState<ExportState>({ kind: "loading" });
  const [autoTriggered, setAutoTriggered] = useState(false);

  useEffect(() => {
    if (loading) {
      setState({ kind: "loading" });
      return;
    }
    if (!user) {
      setState({ kind: "unauthenticated" });
      return;
    }
    if (!isTeacherEmail(user.email)) {
      setState({ kind: "denied" });
      return;
    }

    const email = user.email ?? "";
    setState({ kind: "fetching", email });

    let cancelled = false;
    (async () => {
      try {
        const cohortData = await fetchCohort(COHORT.map((m) => m.uid));
        if (cancelled) return;
        const input: ExportInput = {
          generatedAtIso: new Date().toISOString(),
          topics: topics.map((t) => ({
            id: t.id,
            title: t.title,
            sectionId: t.sectionId,
            contentArea: t.contentArea,
          })),
          cohort: cohortData.map((d) => {
            const label =
              COHORT.find((m) => m.uid === d.uid)?.label ?? d.uid;
            return {
              uid: d.uid,
              label,
              drillRatings: d.drillRatings,
              sessions: d.sessions,
            };
          }),
        };
        setState({ kind: "ready", email, input });
      } catch (err) {
        if (cancelled) return;
        const message = (err as { message?: string })?.message ?? "Read failed.";
        setState({ kind: "error", email, message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading, topics]);

  useEffect(() => {
    if (state.kind === "unauthenticated") {
      window.location.href = "/signin?next=/teacher/export";
    }
  }, [state.kind]);

  // Auto-trigger download once data is ready and a format is set in
  // the URL. Run once per ready state.
  useEffect(() => {
    if (state.kind !== "ready" || autoTriggered) return;
    const format = readFormatFromUrl();
    if (!format) return;
    const plan = planExportFile(format, state.input);
    downloadBlob(plan.filename, plan.mimeType, plan.body);
    setAutoTriggered(true);
  }, [state, autoTriggered]);

  function manualDownload(format: ExportFormat) {
    if (state.kind !== "ready") return;
    const plan = planExportFile(format, state.input);
    downloadBlob(plan.filename, plan.mimeType, plan.body);
  }

  if (state.kind === "loading") {
    return (
      <div className="teacher" data-export-state="loading">
        <p>Loading…</p>
      </div>
    );
  }
  if (state.kind === "unauthenticated") {
    return (
      <div className="teacher" data-export-state="unauthenticated">
        <p>Redirecting to sign-in…</p>
      </div>
    );
  }
  if (state.kind === "denied") {
    return (
      <div className="teacher" data-export-state="denied">
        <h2>Not authorised</h2>
        <p>
          This endpoint is for pilot teachers only. If you are a student,
          return to <a href="/">the home page</a>.
        </p>
      </div>
    );
  }
  if (state.kind === "fetching") {
    return (
      <div className="teacher" data-export-state="fetching">
        <p>Loading cohort…</p>
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <div className="teacher" data-export-state="error">
        <h2>Could not load cohort</h2>
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <div className="teacher" data-export-state="ready">
      <p className="teacher__signedin">
        Signed in as {state.email} :: {state.input.cohort.length} cohort
        member{state.input.cohort.length === 1 ? "" : "s"} ::{" "}
        {state.input.topics.length} topic
        {state.input.topics.length === 1 ? "" : "s"} loaded
      </p>
      <p>
        {autoTriggered
          ? "Download started. You can re-download or switch format below."
          : "Choose a format to download:"}
      </p>
      <div className="teacher__exports">
        <button
          type="button"
          className="teacher__export-button"
          data-format="json"
          onClick={() => manualDownload("json")}
        >
          Download JSON (full data)
        </button>
        <button
          type="button"
          className="teacher__export-button"
          data-format="csv"
          onClick={() => manualDownload("csv")}
        >
          Download CSV (drill ratings)
        </button>
      </div>
      <p className="teacher__footer">
        JSON contains the full nested dataset (drill ratings, sessions,
        topic catalogue, generation metadata). CSV is one row per drill
        rating event, suitable for pivot-table analysis. Use{" "}
        <code>?format=json</code> or <code>?format=csv</code> in the URL
        to auto-trigger a download.
      </p>
    </div>
  );
}
