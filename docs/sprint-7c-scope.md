# Sprint 7C Scope: Teacher Dashboard MCQ Aggregates

**Status: DRAFT — pre-agreement candidate survey. Section 3 onwards locks only if Chris agrees to the recommended path in Section 1.**
**Date of draft: 2026-05-16 (very-late-evening session, same day as Sprint 7A and Sprint 7B close).**
**Parties: Chris Morris (author), Claude (review partner).**

Sprint 7B (Quick Fire MCQ mechanic) shipped end-to-end earlier today in PRs #137-#141. Sprint 7C picks the next platform-side increment from the candidates surfaced in `docs/handover-2026-05-16.md` §17.4 and §17.6.

Cross-references:
- Handover §17.4 (updated outstanding work) and §17.6 (next-session moves): `docs/handover-2026-05-16.md`
- Sprint 7 scope doc (where C and D candidates were originally surveyed): `docs/sprint-7-scope.md`
- Sprint 7A scope doc (teacher dashboard infrastructure this would extend): `docs/sprint-7-scope.md`
- Sprint 7B scope doc (MCQ mechanic this would surface to teachers): `docs/sprint-7b-scope.md`
- Existing teacher-dashboard surfaces this would extend: `src/components/Teacher/TeacherView.tsx`, `src/lib/teacher/fetchCohort.ts`, `src/lib/teacher/aggregate.ts`, `src/components/Teacher/TeacherExport.tsx`, `src/lib/teacher/serialise.ts`
- Pilot-evaluation-plan §8 entries documenting the data-availability boundaries that any widening here would touch: `docs/pilot-evaluation-plan.md`

---

## 1. Candidate survey and recommendation

Four candidates. The pilot starts Monday 21 September 2026. Any Sprint 7C should ship by mid-August at the latest. As with Sprint 7B, none of the four is pilot-evaluation-critical (Sprint 7A held that line); each is a platform-breadth, content-coverage, or pilot-writeup-quality improvement.

### Candidate A: Teacher dashboard MCQ aggregates (RECOMMENDED)

**One sentence.** Surface the MCQ submission data Sprint 7B started capturing into the existing Sprint 7A teacher dashboard, per-topic and per-student, plus extend the `/teacher/export` payload to include MCQ records.

**Leverage.** Three arguments:
1. **Coherence with what just shipped.** Sprint 7B Inc 7B.0 deliberately excluded teacher cross-user reads on `mcqSubmissions` "until Chris asks" (scope §3.4). Sprint 7C-A is exactly that ask. The boundary widens via a one-line rules change; the dashboard already knows how to fetch and aggregate per-student data.
2. **Pilot writeup gains MCQ engagement data.** With Sprint 7A's drill-rating aggregates plus this PR's MCQ aggregates, the writeup has a complete picture of platform engagement per Section 3.1 of the pre-registered evaluation plan: drill cards, activity sessions, AND MCQ correctness. Without this, Sprint 7B's MCQ data is captured but invisible to Dave and Chris during and after the pilot.
3. **Smallest, tightest sprint scope.** Three increments at most. The data path exists; the surface exists; only the security predicate and the rendering need to be widened.

**Cost.** Estimated 3 to 4 focused days. Smaller than Sprint 7B (4-5 days). Most of the work is the security-boundary-widening + the rendering on three existing surfaces (cohort tab, per-topic tab, per-student tab, export endpoint).

**Risks.**
1. **Prose-body precedent.** Widening the `mcqSubmissions` teacher read rule is the first widening of a "v1 student-only" boundary that Sprint 7A and Sprint 7B established. The NEI prose body at `/submissions` stays student-only. Care needed in the rules tests to make sure the widening is scoped only to MCQ aggregates and doesn't accidentally widen elsewhere.
2. **Pre-registration drift.** Section 3.1 of `pilot-evaluation-plan.md` already commits to engagement-only measurement of MCQ activity. Widening teacher visibility doesn't break that pre-registration; it just makes the visibility available before pilot data lands. Section 8 entry confirms this.

### Candidate B: Twin Tracks v2 for Evaluate-level questions

**One sentence.** Extend the existing Twin Tracks scenario surface to higher cognitive levels (Evaluate vs Apply); deferred from Sprint 5 and Sprint 7B.

**Leverage.** Reaches Paper 1 stretch students. Adds an Evaluate-level rung above the existing Apply-level rung.

**Cost.** Estimated 6 to 7 days. New scenario variant in the existing component, new scoring rubric, two pilot-ready Evaluate scenarios calibrated against the Six Vs / hospital-remote-access protocol.

**Why not recommended.**
1. The existing Apply-level Twin Tracks pool is two scenarios. Adding a harder rung before broadening the existing rung is premature; the same argument that ruled this out in Sprint 7B still holds.
2. Larger scope than Candidate A by 2x, with weaker pilot-relevance.

### Candidate C: Section 5.1 comic format extension

**One sentence.** Carry the cyberpunk-comic format from CA 4.1 (CMA, Equality, IP shipped earlier today) across the Section 5.1 (organisation-purposes, IT support, digital supports business needs, project feasibility, user needs and quality) topics.

**Leverage.** Cohort-wide visual consistency reaches into Paper 2 territory.

**Cost.** Estimated 5 to 6 days as a sprint, content work disguised as engineering. Five 5-1-* topics × six SVGs each = ~30 SVGs.

**Why not recommended.**
1. Section 5.1 is Paper 2 content; the pilot is Paper 1. The visual lift does not affect pilot evaluation.
2. The comic format was a Paper 1 / CA 4.1 design decision. Extending to Paper 2 changes the platform's visual signature widely and warrants a deliberate yes from Chris, not extrapolation.

### Candidate D: Session-feedback infrastructure

**One sentence.** Lock down the post-pilot survey and Dave's reflection from `pilot-evaluation-plan.md` §3.3 (currently `[TO CONFIRM]`), and build the platform-side delivery surface for both.

**Leverage.** Removes a `[TO CONFIRM]` placeholder from the pre-registered evaluation plan and gives the pilot writeup actual qualitative data instead of "we'll figure out the survey later".

**Cost.** Estimated 4 to 5 days. Includes: drafting the 3-5 student survey questions, drafting Dave's reflection prompt, building a `/survey` route (or a session-end modal), adding a `users/{uid}/surveyResponses` Firestore collection with rules + tests, capturing Dave's reflection (Firestore-backed teacher textarea or a markdown template the teacher returns by email).

**Why not recommended.**
1. The §3.3 placeholders can be filled by paper surveys with no engineering. The question is "does the platform need to deliver the survey" or "can Dave hand out paper at session 4 end".
2. For a 14-student pilot, paper is simpler and the platform doesn't gain meaningful infrastructure beyond the pilot. Building digital survey infrastructure for one pilot cohort is over-engineering.
3. The content decisions (survey question wording, Dave's reflection prompt) are themselves valuable work but they belong in a `docs/pilot-pre-post-test.md`-style content PR, not a multi-increment platform sprint.

**Note.** If Chris wants to lock down the §3.3 content without the engineering, that's a single content PR — not a sprint. Document the survey wording in `pilot-evaluation-plan.md` as a Section 8 amendment, agree paper-delivery format, done.

### Recommendation

**Sprint 7C: Teacher dashboard MCQ aggregates (Candidate A).**

Pick this if (a) the post-pilot writeup wants complete engagement coverage including MCQ correctness, AND (b) tightening Sprint 7A and Sprint 7B together into a single coherent teacher view matters more than adding new mechanic depth (B), Paper 2 visual treatment (C), or pilot-survey infrastructure (D).

If Chris picks B, C, D or a hybrid, this document needs a rewrite for the chosen candidate; Sections 3 to 8 below assume A.

---

## 2. Sprint goal (if A is locked)

Widen the Sprint 7A teacher dashboard to include MCQ aggregates per-topic and per-student. Extend the `/teacher/export` payload to include MCQ submission records. Pilot writeup gains complete engagement coverage per `pilot-evaluation-plan.md` §3.1: drill ratings + activity sessions + MCQ correctness, all viewable in the dashboard and downloadable in the export.

The security boundary is widened with care: the teacher allowlist gets cross-user READ on `mcqSubmissions`, mirroring the existing read predicates for drillRatings and activity sessions. The NEI prose body at `/submissions` stays student-only. Sort & Match and Twin Tracks scenario-level responses stay student-only.

---

## 3. Scope decisions

### 3.1 Pattern donor: Sprints 7A and 7B

Sprint 7A established the teacher-dashboard surface and the `/teacher/export` pipeline; Sprint 7B established the `mcqSubmissions` schema, rules and rendering. Sprint 7C copies both patterns. Departures require an explicit reason and a Section 8 log entry.

### 3.2 Security boundary widening

The `isTeacher()` predicate from Inc 7.0 (#131) is granted READ access on `users/{userId}/mcqSubmissions/{submissionId}`. The grant mirrors the existing predicates for drillRatings and activity sessions. Writes remain student-only as before. Delete remains denied as before.

Other v1 student-only boundaries are NOT widened:
- `users/{userId}/submissions/{submissionId}` (NEI prose body) — stays student-only
- Sort & Match and Twin Tracks scenario-level attempts — stay student-only

### 3.3 Aggregation shape

Per-topic aggregate: students attempted (count of students with at least one MCQ submission for the topic), total submissions, correct count, pass rate percent.

Per-student aggregate: MCQs attempted (count of MCQs the student has submitted), MCQs correct (count where `isCorrect == true`), pass rate percent. Renders inline in the existing per-student tab.

No raw MCQ prompt rendering on the dashboard. The teacher sees counts, not the answer choices the student picked, in v1. Adding the per-MCQ-per-student breakdown is a future call.

### 3.4 Export shape

JSON: extend `students[].mcqSubmissions` array (mirrors the existing `drillRatings` and `sessions` arrays).

CSV: add a new column-set OR a second CSV. The cleanest is a second CSV (`signal-cohort-mcq-{stamp}.csv`) with one row per MCQ submission. Drill ratings stay in the existing `signal-cohort-{stamp}.csv`. The export endpoint serves either with `?format=json` or `?format=csv` query param, with a `&kind=mcq|drill` discriminator added for CSV.

Actually, simpler: extend the existing CSV with a `kind` column (drill | mcq) and union the rows. One file, one shape. Decided in implementation; Section 8 log entry if the union shape ends up too clunky and we revert to two files.

### 3.5 Teacher's guide update

Section 5 of `docs/teacher-guide.md` already covers the dashboard. The MCQ aggregates land as a small subsection (5.1.x) or as expanded text in 5.1. Section 4.6 (the MCQ runner subsection from Inc 7B.3) gets a one-paragraph append noting that MCQ data now also surfaces on the dashboard.

### 3.6 No mechanic changes

This sprint does NOT change anything about how students see or submit MCQs. The Sprint 7B mechanic (MCQRunner + MCQSummary + upsert semantics + per-MCQ retry) is untouched. Only the teacher-side visibility changes.

---

## 4. Increment plan

Three increments. Each maps to a small PR.

### Inc 7C.0: Firestore rules widening for teacher reads on mcqSubmissions

Adds `isTeacher()` to the existing `users/{userId}/mcqSubmissions/{submissionId}` read rule. Adversarial vitest test updates: T1-T9 from `tests/rules/mcq-submissions.test.ts` continue to pass; T8 (Group G: teacher cross-user read denied) flips to teacher cross-user read ALLOWED with a new test name. Plus 2-3 new tests to verify teacher writes still denied and teacher deletes still denied.

Estimated 0.5 days.

### Inc 7C.1: Dashboard rendering for MCQ aggregates

Extends `fetchCohort.ts` to also fetch each student's `mcqSubmissions`. Extends `aggregate.ts` with `summariseStudentMCQ` and `summariseTopicMCQ` (pure helpers, unit-tested). Extends `TeacherView.tsx` per-topic and per-student tabs to render the new aggregates inline next to the existing drill and session aggregates.

Estimated 1.5 days. Includes ~5-7 new aggregate.test.ts tests.

### Inc 7C.2: Export endpoint MCQ inclusion + teacher's guide update

Extends `serialise.ts` to include `mcqSubmissions` in the JSON payload. Extends the CSV with a `kind` column and union shape (or splits to a second file if the union turns out too clunky during implementation). Updates `docs/teacher-guide.md` section 5 with the new visibility and section 4.6 with the one-paragraph cross-reference. Updates `docs/pilot-evaluation-plan.md` §8 with a Sprint 7C entry documenting the widened boundary.

Estimated 1 day. Includes ~3-5 new serialise.test.ts tests.

---

## 5. Exit criteria

- [ ] `firestore.rules` widened on `mcqSubmissions` read; deployed to both staging and prod (Trap 12)
- [ ] Existing MCQ rules tests still pass with the widened predicate; new teacher-read tests added
- [ ] `TeacherView` per-topic and per-student tabs render MCQ aggregates next to drill aggregates
- [ ] `/teacher/export` JSON includes `mcqSubmissions`; CSV includes MCQ rows (either via `kind` column union or a second file)
- [ ] No regression in existing CI (build green, 150+ rules tests pass, all existing aggregate and serialise tests pass)
- [ ] `docs/teacher-guide.md` section 5 updated; section 4.6 cross-referenced
- [ ] `docs/pilot-evaluation-plan.md` §8 entry added documenting the widened boundary

---

## 6. Out of scope

Named explicitly so Sprint 7C holds the line.

- **NEI prose body teacher reads.** The v1 boundary at `/submissions` stays. Section 7 R1 keeps this prominent.
- **Sort & Match / Twin Tracks scenario-level teacher reads.** Same boundary. Stays student-only.
- **Per-MCQ-per-student answer breakdown.** Teacher sees counts and correctness; not the option each student picked. Adding that breakdown is a future call.
- **MCQ-side spaced-return scheduler integration.** Sprint 6 §3.2 boundary still holds; MCQs don't enqueue.
- **Quick Fire as a cross-topic gauntlet.** Out of scope from Sprint 7B; stays out.

---

## 7. Risks

**R1. Widening one v1 boundary risks softening others.** The NEI prose body boundary at `/submissions` and the scenario-level activity boundaries are explicit v1 lines. Widening MCQs creates precedent. Mitigation: §3.2 names which boundaries DO NOT widen; rules tests assert each remains student-only. The pilot-evaluation-plan §8 entry calls out which boundaries moved and which did not.

**R2. CSV union shape clunkiness.** The decision to union drill + MCQ rows into one CSV with a `kind` column may produce a file that's harder to analyse than two separate files. Mitigation: §4 Inc 7C.2 notes the option to split if the union turns out clunky during implementation; Section 8 entry if so.

**R3. Aggregate confusion on the dashboard.** Per-topic and per-student tabs already show drill aggregates. Adding MCQ aggregates inline risks making the rows visually busy. Mitigation: present MCQ aggregates as a separate column group, not interleaved with drill columns. Worst case, split into separate sub-tables.

---

## 8. Sprint-time changes log

Empty at draft time. Any change to scope, increment shape, exit criteria or out-of-scope list during Sprint 7C implementation is logged here with date and reason.

---

## 9. If Chris picks a different candidate

This document recommends A. If Chris picks B, C, D or a hybrid, the structure above (Sections 2 to 8) needs a rewrite for the chosen path. Section 1's candidate survey stays as the historical record.

If Chris wants to lock down the §3.3 pilot-evaluation-plan placeholders (Candidate D's content half) without engineering, that's a single content PR rather than a sprint. Recommend: draft the survey wording + Dave's reflection prompt in a new section 8 entry of `pilot-evaluation-plan.md`, agree paper-delivery, done in one PR.
