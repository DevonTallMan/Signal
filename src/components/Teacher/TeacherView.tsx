// src/components/Teacher/TeacherView.tsx
//
// React island for the /teacher dashboard route.
//
// Surfaces from the auth + allowlist combination:
//   - loading: brief window while Firebase resolves auth state
//   - unauthenticated: redirect to /signin?next=/teacher
//   - denied: deny screen ("not authorised") — client allowlist
//     mismatch
//   - fetching: cohort data fetch in flight
//   - error: a cross-user read threw (typically a rules denial)
//   - ready: three tabs (cohort, topic, student)
//
// The allowlist check on the client is COSMETIC. Real protection is
// the Firestore rules from Inc 7.0. A non-teacher who bypasses the
// client check will still be rejected by the rules on every
// cross-user read attempt.
//
// Inc 7.1 shipped the cohort tab. Inc 7.2 adds the topic and student
// tabs on the same island, reusing the same fetched cohort data.

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../lib/useAuth";
import { isTeacherEmail } from "../../lib/teacher/allowlist";
import { COHORT } from "../../lib/teacher/cohort";
import {
  fetchCohort,
  type CohortMemberData,
} from "../../lib/teacher/fetchCohort";
import {
  summariseStudent,
  summariseTopic,
  expandStudentByTopic,
  formatLastSeen,
  type StudentSummary,
  type TopicSummary,
  type StudentTopicBreakdown,
} from "../../lib/teacher/aggregate";

export interface TopicMeta {
  id: string;
  title: string;
  sectionId: string;
  contentArea: string;
}

interface Props {
  topics: readonly TopicMeta[];
}

type TeacherViewState =
  | { kind: "loading" }
  | { kind: "unauthenticated" }
  | { kind: "denied" }
  | { kind: "fetching"; email: string }
  | { kind: "ready"; email: string; cohort: CohortMemberData[] }
  | { kind: "error"; email: string; message: string };

type TabId = "cohort" | "topic" | "student";

export default function TeacherView({ topics }: Props) {
  const { user, loading } = useAuth();
  const [state, setState] = useState<TeacherViewState>({ kind: "loading" });
  const [now, setNow] = useState<number>(() => Date.now());
  const [tab, setTab] = useState<TabId>("cohort");
  const [selectedUid, setSelectedUid] = useState<string>(
    () => COHORT[0]?.uid ?? "",
  );

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
        setState({ kind: "ready", email, cohort: data });
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
          This page is for pilot teachers only. If you are a student,
          return to <a href="/">the home page</a>.
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
      <div className="teacher__tabs" role="tablist">
        {(["cohort", "topic", "student"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={
              "teacher__tab" + (tab === id ? " teacher__tab--active" : "")
            }
            data-tab={id}
            onClick={() => setTab(id)}
          >
            {id === "cohort"
              ? "Cohort"
              : id === "topic"
                ? "Per topic"
                : "Per student"}
          </button>
        ))}
      </div>

      {tab === "cohort" && (
        <CohortTab cohort={state.cohort} now={now} />
      )}
      {tab === "topic" && (
        <TopicTab cohort={state.cohort} topics={topics} />
      )}
      {tab === "student" && (
        <StudentTab
          cohort={state.cohort}
          topics={topics}
          selectedUid={selectedUid}
          onSelectUid={setSelectedUid}
          now={now}
        />
      )}
    </div>
  );
}

interface CohortTabProps {
  cohort: readonly CohortMemberData[];
  now: number;
}

function CohortTab({ cohort, now }: CohortTabProps) {
  const rows = useMemo(
    () =>
      cohort.map((d) => {
        const label =
          COHORT.find((m) => m.uid === d.uid)?.label ?? d.uid;
        return {
          uid: d.uid,
          label,
          summary: summariseStudent(d.drillRatings, d.sessions),
        };
      }),
    [cohort],
  );

  return (
    <div data-tab-panel="cohort">
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
          {rows.map((row) => (
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
        {rows.length} student{rows.length === 1 ? "" : "s"} in cohort.
      </p>
    </div>
  );
}

interface TopicTabProps {
  cohort: readonly CohortMemberData[];
  topics: readonly TopicMeta[];
}

function TopicTab({ cohort, topics }: TopicTabProps) {
  const cohortRatings = useMemo(
    () =>
      cohort.map((d) => ({
        uid: d.uid,
        drillRatings: d.drillRatings,
      })),
    [cohort],
  );

  const rows = useMemo(
    () =>
      topics.map((topic) => ({
        topic,
        summary: summariseTopic(topic.id, cohortRatings),
      })),
    [topics, cohortRatings],
  );

  return (
    <div data-tab-panel="topic">
      <table className="teacher__table">
        <thead>
          <tr>
            <th scope="col">Topic</th>
            <th scope="col">Section</th>
            <th scope="col">Students engaged</th>
            <th scope="col">Ratings</th>
            <th scope="col">Pass rate</th>
            <th scope="col">In queue</th>
            <th scope="col">Graduated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ topic, summary }) => (
            <tr key={topic.id} data-topic-id={topic.id}>
              <th scope="row">{topic.title}</th>
              <td>{topic.sectionId}</td>
              <td>{summary.studentsEngaged}</td>
              <td>{summary.totalRatings}</td>
              <td>
                {summary.passRatePercent == null
                  ? "—"
                  : `${summary.passRatePercent}%`}
              </td>
              <td>{summary.cardsInQueue}</td>
              <td>{summary.cardsGraduated}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="teacher__footer">
        {rows.length} published topic{rows.length === 1 ? "" : "s"} in
        catalogue.
      </p>
    </div>
  );
}

interface StudentTabProps {
  cohort: readonly CohortMemberData[];
  topics: readonly TopicMeta[];
  selectedUid: string;
  onSelectUid: (uid: string) => void;
  now: number;
}

function StudentTab({
  cohort,
  topics,
  selectedUid,
  onSelectUid,
  now,
}: StudentTabProps) {
  const selected = cohort.find((d) => d.uid === selectedUid);
  const selectedLabel =
    COHORT.find((m) => m.uid === selectedUid)?.label ?? selectedUid;

  const topicIds = useMemo(() => topics.map((t) => t.id), [topics]);
  const breakdown: StudentTopicBreakdown[] = useMemo(() => {
    if (!selected) return [];
    return expandStudentByTopic(selected.drillRatings, topicIds);
  }, [selected, topicIds]);

  const summary: StudentSummary | null = useMemo(() => {
    if (!selected) return null;
    return summariseStudent(selected.drillRatings, selected.sessions);
  }, [selected]);

  return (
    <div data-tab-panel="student">
      <div className="teacher__picker">
        <label htmlFor="teacher-student-select">Student:</label>
        <select
          id="teacher-student-select"
          value={selectedUid}
          onChange={(e) => onSelectUid(e.target.value)}
        >
          {COHORT.map((m) => (
            <option key={m.uid} value={m.uid}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {selected && summary ? (
        <>
          <p className="teacher__signedin">
            {selectedLabel} :: {summary.cardsRated} cards rated ::{" "}
            {summary.cardsInQueue} in queue :: {summary.cardsGraduated} graduated
            :: last seen {formatLastSeen(summary.lastSeenMs, now)}
          </p>
          <table className="teacher__table">
            <thead>
              <tr>
                <th scope="col">Topic</th>
                <th scope="col">Cards rated</th>
                <th scope="col">In queue</th>
                <th scope="col">Graduated</th>
                <th scope="col">Got</th>
                <th scope="col">Miss</th>
                <th scope="col">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row) => {
                const topic = topics.find((t) => t.id === row.topicId);
                return (
                  <tr key={row.topicId} data-topic-id={row.topicId}>
                    <th scope="row">{topic?.title ?? row.topicId}</th>
                    <td>{row.cardsRated}</td>
                    <td>{row.cardsInQueue}</td>
                    <td>{row.cardsGraduated}</td>
                    <td>{row.gotCount}</td>
                    <td>{row.missCount}</td>
                    <td>{formatLastSeen(row.lastSeenMs, now)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <p>No data for the selected student yet.</p>
      )}
    </div>
  );
}
