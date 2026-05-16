# Sprint 7 Scope: Pilot Visibility Infrastructure

**Status: DRAFT — pre-agreement candidate survey. Section 3 onwards locks only if Chris agrees to the recommended path in Section 1.**
**Date of draft: 2026-05-16.**
**Parties: Chris Morris (author), Claude (review partner).**

This document surveys Sprint 7 candidates, recommends one, and details scope for the recommended path. Unlike `docs/sprint-6-scope.md`, no prior design conversation has produced an agreed direction; the named Sprint 7 candidate from the 2026-05-16 handover (tier-interleaved Risk Classifier ordering) shipped opportunistically as PR #122 outside the sprint frame. Sprint 7 is genuinely open.

Cross-references:
- Source backlog (where the candidates come from): `docs/handover-2026-05-16.md` §7
- Pilot evaluation plan (what Sprint 7 needs to support at pilot time): `docs/pilot-evaluation-plan.md`
- Sprint 6 scope doc (structural reference): `docs/sprint-6-scope.md`
- Firestore data model in use (where teacher reporting reads come from): `firestore.rules`, `src/lib/drillStore.ts`, `src/lib/risk-classifier/firestore.ts`

---

## 1. Candidate survey and recommendation

Four candidates worth surveying. The pilot starts Monday 21 September 2026. Sprint 7 should ship by mid-August at the latest, giving Chris four to five weeks of slack before the pilot window.

### Candidate A: Pilot visibility infrastructure (RECOMMENDED)

**One sentence.** Teacher-facing dashboard for Dave, plus a structured export path for Chris's post-pilot writeup.

**Leverage.** This is the only candidate of the four that directly unblocks pilot evaluation. Without it:
- Dave runs the pilot in the dark. He cannot see which students engaged, which topics struggled, which scenarios produced the most NEI activity. His role as pilot host is reduced to logging in and watching from outside.
- Chris faces a post-pilot data exercise built from raw Firestore reads, hand-rolled aggregations, and no operational visibility into what actually happened week by week.
- The pilot writeup risks being a narrative of intent rather than a data-grounded report.

With Sprint 7A in place, Dave has a per-cohort progress view at session-time and Chris has a clean export for analysis after the pilot closes.

**Cost.** Estimated 6 to 8 focused days. New work:
- A `teacher` role (or simpler: an allowlisted email) plus a `/teacher` route gated by it
- Aggregation reads over `users/{uid}/drillRatings`, `users/{uid}/nei_submissions`, and Risk Classifier session records (cross-collection, cross-user)
- Firestore rules extension for the teacher read role (Trap 12: deploy to both staging and prod)
- A JSON or CSV export endpoint Chris can pull post-pilot
- Vitest rules tests for the new read paths; Playwright spec for the teacher view

**Risks.**
1. Scope creep into "teacher CMS" (assignment, grading, etc). Sprint 7A holds the line at read-only visibility plus export. Anything write-side is out of scope.
2. Cross-user reads add a security boundary the platform has not previously needed. Mitigation: the only cross-user reads are aggregated counts and per-student summaries; no raw NEI text reads in v1. Section 7 names this in detail.
3. Dave has not asked for this. Building it pre-emptively could over-engineer for a pilot host who is happy to trust Chris's view. Mitigation: the export path serves Chris regardless of Dave's use. Even if Dave never visits `/teacher`, the data pipeline is the deliverable.

### Candidate B: Quick Fire MCQ mechanic

**One sentence.** Third interactive form alongside drill and NEI; deferred from Sprint 3.

**Leverage.** Adds platform mechanic breadth. Lets pilot sessions rotate three mechanics instead of two. The MCQ assessments already live in the topic frontmatter (412-mcq-01, 413-mcq-01, 414-mcq-01) but are rendered as placeholders today; this sprint would make them interactive.

**Cost.** Estimated 4 to 5 days. New MCQ runner component, Firestore schema for results, score capture, surfacing via the existing assessment block. Lighter than Candidate A.

**Why not recommended.** Mechanic breadth does not change what gets measured in the 4-week pilot window. The MCQs already serve as static recall cues; making them interactive is a UX improvement, not a pilot-evaluation unblock. Defer to post-pilot.

### Candidate C: Twin Tracks v2 for Evaluate-level questions

**One sentence.** Extend the existing Twin Tracks scenario surface to higher cognitive levels (Evaluate vs Apply); deferred from Sprint 5.

**Leverage.** Reaches Paper 1 stretch students. Gives the strongest cohort members a harder rung to climb.

**Cost.** Estimated 6 to 7 days. New scenario variant in the existing component, new scoring rubric, two pilot-ready scenarios calibrated against the Six Vs / hospital-remote-access protocol.

**Why not recommended.** Two reasons. First, the existing Apply-level Twin Tracks scenarios are still a pool of two; the dose at pilot time is small. Adding a higher-rung variant before broadening the existing rung is premature. Second, like Candidate B, this is mechanic breadth, not pilot visibility.

### Candidate D: Comic format extension to Section 5.1 topics

**One sentence.** Carry the cyberpunk-comic format that landed in Inc 7.1, 7.2 and 7.3 across the CA 4.1 topics into the Section 5.1 (organisation-purposes, IT support, digital supports business needs, project feasibility, user needs and quality) topics.

**Leverage.** Cohort-wide visual consistency reaches into Paper 2 territory. Five topics × six SVGs = ~30 SVGs.

**Cost.** Estimated 5 to 6 days as a sprint, but realistically this is content work disguised as engineering. Each conversion is the same pattern shipped three times in #126, #128 and (currently) #129.

**Why not recommended.** Two reasons. First, Section 5.1 is Paper 2 content; the pilot is Paper 1. The visual lift does not affect pilot evaluation. Second, the comic format was a Paper 1 / CA 4.1 design decision that the wider platform has not signed up to. Extending it to Paper 2 changes the visual signature of the platform widely and warrants a deliberate yes, not an extrapolation.

### Recommendation

**Sprint 7A: Pilot visibility infrastructure.**

Pick this if pilot evaluation matters more than platform breadth at pilot time. The other three candidates are platform improvements that can ship any time; A is the only one whose value disappears if it slips past the pilot start date.

If Chris picks B, C or D instead, this document needs a rewrite for the chosen candidate; Sections 3 to 8 below assume A.

---

## 2. Sprint goal (if A is locked)

Build a read-only teacher-facing dashboard plus a structured export pipeline that gives Dave per-cohort visibility during the pilot and Chris a clean data path for the post-pilot writeup. By sprint end, an allowlisted teacher email can sign in, land on `/teacher`, and see per-student drill engagement, NEI submission counts, Risk Classifier completion, and per-topic struggle indicators across the seeded test users. A separate export endpoint produces a JSON or CSV dump of the same data for offline analysis.

The unit of evaluation is "what happened this week" at three resolutions: cohort, per-topic, per-student. v1 holds the line at counts and timestamps; raw NEI text content is not read across users.

---

## 3. Scope decisions

The candidate survey above implies these. Sprint 7A does not re-litigate them.

### 3.1 Pattern donor: Sprints 3, 4 and 6

Sprint 6 established the Firestore wrapper, test API and rules-test patterns Sprint 7A will copy. Sprint 4 established the Cloudflare Pages deploy + branch preview shape. Departures require an explicit reason and a Section 8 log entry.

### 3.2 Authorisation model: allowlisted email, not a full role system

For pilot scale (14 students plus Dave plus Chris) a full role-and-claim system is over-engineering. Sprint 7A reads from a hardcoded teacher allowlist in `firestore.rules`. Adding a second teacher requires a one-line rules change and a deploy. Re-evaluate post-pilot if the cohort grows past one teacher.

The allowlist sits in rules (server-enforced), not in client code. A compromised client cannot read another user's data even if it claims to be Dave.

### 3.3 Read shape: aggregates + per-user summaries, not raw content

Per the §1 risk note, Sprint 7A reads:
- `users/{uid}` profile (display name only, no contact details)
- `users/{uid}/drillRatings/{compositeId}` counts and outcomes
- `users/{uid}/nei_submissions/{id}` count and timestamp only (NOT the prose body)
- Risk Classifier session records (already structured; no body issue)

It does NOT read:
- NEI submission prose bodies (defers to a separate decision once the pilot is running and Dave has a defined need)
- Sort & Match / Twin Tracks scenario-level responses (same reason)

This is the security boundary v1 holds. It is named here so a Sprint 7A reviewer cannot quietly widen it.

### 3.4 Surfacing: one route, three views, no SPA shell

`/teacher` is a single Astro page with three tabbed views (cohort, topic, student). No new framework, no React island stack. Aggregation runs server-side at request time (the data volume is trivial for a 14-student cohort). Caching is not in scope; if it becomes an issue post-pilot, revisit.

### 3.5 Export: a single JSON-or-CSV endpoint, gated by the same allowlist

`/teacher/export` returns the same dataset as the dashboard, structured for offline analysis. Format negotiation via `?format=json` or `?format=csv`. CSV is per-row student × per-column metric.

The export is the deliverable Chris cares about most. Even if Dave never visits `/teacher`, the export covers the post-pilot writeup need.

---

## 4. Increment plan

Five increments, ordered so that any cut after Inc 7.2 still leaves a usable export pipeline for Chris.

### Inc 7.0: Teacher allowlist + Firestore rules extension

Adds a teacher allowlist to `firestore.rules` and the rule predicates that let allowlisted emails read across `users/*` for the agreed read shape (Section 3.3). Vitest rules tests cover both grants (allowlisted teacher reads allowed) and denials (non-allowlisted user, even the targeted student, cannot read across users; allowlisted teacher cannot read NEI prose bodies). Deploy to staging and prod per Trap 12.

Estimated 1.5 days.

### Inc 7.1: `/teacher` route shell + cohort summary

The single Astro page with the cohort tab populated. Reads run server-side at request time, return per-student row × per-metric column. No styling polish beyond legibility. Playwright spec for the route gated by the allowlist.

Estimated 1.5 days.

### Inc 7.2: Per-topic and per-student tabs

The other two tabs. Per-topic tab aggregates engagement and pass/fail rates per CA 4.1 topic. Per-student tab shows the row for a single selected student, expanded.

Estimated 1.5 days.

### Inc 7.3: `/teacher/export` endpoint

JSON and CSV formats. Gated by the same allowlist predicate. No client-side download UX; users hit the URL directly or use curl. Documented in the teacher's guide.

Estimated 1 day.

### Inc 7.4: Teacher's guide section + Section 8 of pilot-evaluation-plan update

Adds a new section to `docs/teacher-guide.md` explaining the dashboard and export. Adds the data-availability paragraph to Section 8 of `docs/pilot-evaluation-plan.md` so the pilot writeup discipline names what data will exist post-pilot. Both are docs-only, no code.

Estimated 1 day.

---

## 5. Exit criteria

- [ ] `firestore.rules` allowlist deployed to both staging and prod
- [ ] `/teacher` route renders cohort, topic and student views on the seeded test users
- [ ] `/teacher/export?format=json` and `/teacher/export?format=csv` return the same dataset shaped for offline analysis
- [ ] Vitest rules tests cover the new read paths (grants and denials, including the NEI-prose-no-read boundary)
- [ ] Playwright spec covers the route allowlist and at least one tab
- [ ] `docs/teacher-guide.md` section added; `docs/pilot-evaluation-plan.md` Section 8 updated
- [ ] No regression in existing CI (29 pages still build; existing Playwright suites still pass)

---

## 6. Out of scope

Named explicitly to keep the sprint honest.

- Teacher CMS (assigning, grading, marking, intervening on student records)
- NEI submission prose body reads (deferred until Dave names a need post-pilot start)
- Email or push notifications for teachers (separate sprint; depends on a transactional email setup that does not exist)
- Mobile-optimised teacher view (Dave reads on desktop; mobile is post-pilot polish)
- Analytics / charting libraries (counts and tables are enough for v1; visualisation is post-pilot)
- Per-cohort comparison (the pilot is one cohort; meaningful only when there are two or more)
- Quick Fire MCQ, Twin Tracks v2, comic conversion of Section 5.1 (Sprint 7 candidates B, C, D — separate decisions)

---

## 7. Risks

**R1. Cross-user reads widen the security surface.** Until Sprint 7, the platform's Firestore rules treated every user as an isolated tenant. Sprint 7A introduces the first cross-user read path. Mitigation: the read paths are explicit, named in Section 3.3, and rules-tested for both grant and deny. The NEI-prose-no-read boundary is the line the rules enforce; this is named in Section 3.3 so it cannot be widened in code review without an explicit Section 8 log entry.

**R2. Performance on aggregations.** Reading across 14 users × ~40 drill cards × 4 sessions is trivial today but the read pattern is "iterate over all users", which scales linearly with cohort size. Mitigation: at pilot scale this is sub-second. Post-pilot, if a second cohort appears, revisit with denormalised counters or a scheduled aggregation.

**R3. Dave does not use the dashboard.** Possible. The export pipeline (Inc 7.3) is the failsafe deliverable; even if `/teacher` is never visited live during the pilot, the data path that powers the export is what Chris needs for the writeup.

**R4. Allowlist drift.** A hardcoded allowlist in rules is fine for one teacher but goes stale if Chris adds a co-teacher mid-pilot and forgets to deploy. Mitigation: a vitest rules test asserts the allowlist contains a known good email, so a regression that empties the list fails CI. Adding a new email requires deploying to both environments (Trap 12).

**R5. Scope creep.** Teacher CMS is the natural next step after teacher dashboard. Mitigation: Section 6 names this explicitly. Any in-sprint proposal to add write-side teacher capability requires a Section 8 entry and a re-agreement before implementation.

---

## 8. Sprint-time changes log

Empty at draft time. Any change to scope, increment shape, exit criteria or out-of-scope list during Sprint 7A implementation is logged here with date and reason.

---

## 9. If Chris picks a different candidate

This document recommends A. If Chris picks B, C or D, the structure above (Sections 2 to 8) needs a rewrite for the chosen path. The candidate survey in Section 1 stays as the historical record of what was considered.

If Chris wants a hybrid (e.g., A + part of D), the recommended approach is to scope A as Sprint 7A and defer D candidate items to Sprint 7B as a follow-up, rather than mixing them into one sprint. Sprint 6 demonstrated that a tight single-thread sprint ships cleanly; mixing threads risks the half-finished pattern the wider repo conventions push against.
