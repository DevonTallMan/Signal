// src/components/Teacher/TeacherView.tsx
//
// React island for the /teacher dashboard route.
//
// Surfaces three states from the auth + allowlist combination:
//   - loading: brief window while Firebase resolves auth state
//   - unauthenticated: redirect to /signin?next=/teacher
//   - non-teacher: deny screen ("not authorised")
//   - teacher: cohort summary table
//
// The allowlist check on the client is COSMETIC. Real protection is
// the Firestore rules from Inc 7.0. A non-teacher who bypasses the
// client check will still be rejected by the rules on every
// cross-user read attempt.
//
// v1 (Inc 7.1) ships the cohort tab only. Per-topic and per-student
// detail land in Inc 7.2.

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/useAuth";
import { isTeacherEmail } from "../../lib/teacher/allowlist";
import { COHORT } from "../../lib/teacher/cohort";
import { fetchCohort } from "../../lib/teacher/fetchCohort";
import {
  summariseStudent,
  formatLastSeen,
  type StudentSummary,
} from "../../lib/teacher/aggregate";

type TeacherViewState =
  | { kind: "loading" }
  | { kind: "unauthenticated" }
  | { kind: "denied" }
  | { kind: "fetching"; email: string }
  | { kind: "ready"; email: string; rows: Row[] }
  | { kind: "error"; email: string; message: string };

interface Row {
  uid: string;
  label: string;
  summary: StudentSummary;
}

export default function TeacherView() {
  const { user, loading } = useAuth();
  const [state, setState] = useState<TeacherViewState>({ kind: "loading" });
  const [now, setNow] = useState<number>(() => Date.now());

  // Refresh the "last seen" formatting every minute so the relative
  // timestamps stay accurate during a long teacher session.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

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
        const data = await fetchCohort(COHORT.map((m) => m.uid));
        if (cancelled) return;
        const rows: Row[] = data.map((d) => {
          const label = COHORT.find((m) => m.uid === d.uid)?.label ?? d.uid;
          return {
            uid: d.uid,
            label,
            summary: summariseStudent(d.drillRatings, d.sessions),
          };
        });
        setState({ kind: "ready", email, rows });
      } catch (err) {
        if (cancelled) return;
        const message = (err as { message?: string })?.message ?? "Read failed.";
        setState({ kind: "error", email, message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  // Redirect on unauthenticated rather than rendering. Pushed into an
  // effect so the redirect happens after render and only on the
  // client (this is a client island anyway).
  useEffect(() => {
    if (state.kind === "unauthenticated") {
      window.location.href = "/signin?next=/teacher";
    }
  }, [state.kind]);

  if (state.kind === "loading") {
    return (
      <div className="teacher" data-teacher-state="loading">
        <p>Loading…</p>
      </div>
    );
  }

  if (state.kind === "unauthenticated") {
    return (
      <div className="teacher" data-teacher-state="unauthenticated">
        <p>Redirecting to sign-in…</p>
      </div>
    );
  }

  if (state.kind === "denied") {
    return (
      <div className="teacher" data-teacher-state="denied">
        <h2>Not authorised</h2>
        <p>
          This page is for pilot teachers only. If you are a student, return to{" "}
          <a href="/">the home page</a>.
        </p>
      </div>
    );
  }

  if (state.kind === "fetching") {
    return (
      <div className="teacher" data-teacher-state="fetching">
        <p>Loading cohort…</p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="teacher" data-teacher-state="error">
        <h2>Could not load cohort</h2>
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <div className="teacher" data-teacher-state="ready">
      <p className="teacher__signedin">Signed in as {state.email}</p>
      <table className="teacher__table">
        <thead>
          <tr>
            <th scope="col">Student</th>
            <th scope="col">Cards rated</th>
            <th scope="col">In queue</th>
            <th scope="col">Graduated</th>
            <th scope="col">Sessions started</th>
            <th scope="col">Sessions completed</th>
            <th scope="col">Last seen</th>
          </tr>
        </thead>
        <tbody>
          {state.rows.map((row) => (
            <tr key={row.uid} data-student-uid={row.uid}>
              <th scope="row">{row.label}</th>
              <td>{row.summary.cardsRated}</td>
              <td>{row.summary.cardsInQueue}</td>
              <td>{row.summary.cardsGraduated}</td>
              <td>{row.summary.sessionsStarted}</td>
              <td>{row.summary.sessionsCompleted}</td>
              <td>{formatLastSeen(row.summary.lastSeenMs, now)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="teacher__footer">
        {state.rows.length} student{state.rows.length === 1 ? "" : "s"} in cohort.
      </p>
    </div>
  );
}
