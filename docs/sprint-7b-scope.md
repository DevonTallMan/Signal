# Sprint 7B Scope: Quick Fire MCQ Mechanic

**Status: DRAFT — pre-agreement candidate survey. Section 3 onwards locks only if Chris agrees to the recommended path in Section 1.**
**Date of draft: 2026-05-16 (late-evening session, same day as Sprint 7A close).**
**Parties: Chris Morris (author), Claude (review partner).**

Sprint 7A (pilot visibility infrastructure) shipped end-to-end in PRs #131-#135 earlier today. Sprint 7B picks the next platform-side increment from the candidates the Sprint 7 scope doc surveyed (`docs/sprint-7-scope.md` §1, candidates B, C, D). This document surveys those three, recommends one, and details full scope for the recommended path.

Cross-references:
- Sprint 7 scope doc (where candidates B/C/D were first surveyed): `docs/sprint-7-scope.md`
- Handover §16.6 (suggested next moves after Sprint 7A): `docs/handover-2026-05-16.md`
- Existing AssessmentBlock placeholder for MCQs: `src/components/AssessmentBlock.astro` lines 74-86
- Existing MCQ frontmatter shape (each Paper 1 topic's frontmatter): e.g. `src/content/topics/4-1-1-data-protection.mdoc` lines 29-56
- Sprint 6 scope §3.2 (rationale for excluding MCQs from the spaced-return scheduler): `docs/sprint-6-scope.md`

---

## 1. Candidate survey and recommendation

The three candidates inherit directly from `docs/sprint-7-scope.md` §1. The pilot starts Monday 21 September 2026, so any Sprint 7B should ship by mid-August at the latest. None of the three candidates is pilot-evaluation-critical (Sprint 7A held that line); each is a platform-breadth or content-coverage improvement.

### Candidate B: Quick Fire MCQ mechanic (RECOMMENDED)

**One sentence.** Make the MCQ assessments embedded in every Paper 1 topic's frontmatter actually interactive, instead of rendering as static placeholders.

**Leverage.** Three pilot-relevant arguments:
1. The MCQs are already drafted and calibrated for every CA 4.1 topic plus all five Section 5.1 topics. Ten MCQs total exist as frontmatter; today they render as static prompts with the words "Interactive multiple-choice runner coming in a later release." That placeholder has been live since Sprint 3.
2. Adding the runner gives pilot sessions a third interactive form alongside drill cards and NEI prompts. The writeup gains a third engagement channel to analyse (alongside drill ratings and activity sessions).
3. The mechanic is the most-deferred item in the backlog. Originally scoped for Sprint 3, deferred to Sprint 5, deferred to Sprint 6, deferred to Sprint 7. Time to ship.

**Cost.** Estimated 4 to 5 focused days. Smaller than Sprint 7A. The data path already exists in topic frontmatter (id, prompt, options, correct_index, feedback_correct, feedback_incorrect, difficulty), so this is purely about a React runner component, a Firestore schema for results, rules, and integration into the existing AssessmentBlock placeholder slot.

**Risks.**
1. Recognition vs generation. MCQs are a recognition mechanic; drill cards are a generation mechanic; Sprint 6 §3.2 deliberately excluded recognition items from the spaced-return scheduler (generation effect; Slamecka and Graf 1978). Sprint 7B will hold that line: MCQ submissions are NOT enqueued into the Sprint 6 scheduler. This is named so future scope creep cannot quietly widen it.
2. Pilot writeup discipline. Engagement with the MCQ runner is engagement, not learning. The pilot evaluation plan already binds the writeup to descriptive language; MCQ data will follow the same discipline.

### Candidate C: Twin Tracks v2 for Evaluate-level questions

**One sentence.** Extend the existing Twin Tracks scenario surface to higher cognitive levels (Evaluate vs Apply); deferred from Sprint 5.

**Leverage.** Reaches Paper 1 stretch students. Adds an Evaluate-level rung above the existing Apply-level rung.

**Cost.** Estimated 6 to 7 days. New scenario variant in the existing component, new scoring rubric, two pilot-ready scenarios calibrated against the Six Vs / hospital-remote-access protocol.

**Why not recommended.**
1. The existing Apply-level Twin Tracks pool is two scenarios. Adding a harder rung before broadening the existing rung is premature; the existing v1 still has small dose.
2. Mechanic deepening, not breadth. The MCQ runner adds a new mechanic students haven't seen; Twin Tracks v2 deepens one they already have.
3. The Evaluate cognitive level is a stretch skill for Year 1 cohorts; high-leverage answer-arc skills sit at Apply for this pilot.

### Candidate D: Comic format extension to Section 5.1 topics

**One sentence.** Carry the cyberpunk-comic format from CA 4.1 (CMA, Equality, IP shipped today) across the Section 5.1 (organisation-purposes, IT support, digital supports business needs, project feasibility, user needs and quality) topics.

**Leverage.** Cohort-wide visual consistency reaches into Paper 2 territory.

**Cost.** Estimated 5 to 6 days as a sprint, but realistically it's content work disguised as engineering. Five 5-1-* topics, six SVGs each = ~30 SVGs.

**Why not recommended.**
1. Section 5.1 is Paper 2 content. The pilot is Paper 1. The visual lift doesn't affect pilot evaluation.
2. The comic format was a Paper 1 / CA 4.1 design decision the wider platform has not signed up to. Extending to Paper 2 changes the visual signature of the platform widely and warrants a deliberate yes, not an extrapolation.
3. Pilot students will probably not visit Section 5.1 topics during the four pilot sessions. The visual upgrade is mostly invisible to them.

### Recommendation

**Sprint 7B: Quick Fire MCQ mechanic (Candidate B).**

Pick this if pilot-session mechanic breadth matters more than mechanic depth (C) or Paper 2 visual consistency (D). The MCQ runner has been deferred four sprints; the data path already exists; the rendering is currently a placeholder that the cohort will literally see and click on. Shipping the runner converts a known dead-end into a working interactive surface before the pilot starts.

If Chris picks C, D or something else, this document needs a rewrite for the chosen candidate; Sections 3 to 8 below assume B.

---

## 2. Sprint goal (if B is locked)

Make the MCQ assessments authored in topic frontmatter interactive, capture per-student submissions to Firestore, and integrate the result into the existing topic-page AssessmentBlock so students can answer, see feedback, and have their attempt recorded. By sprint end, a logged-in student on any Paper 1 or Section 5.1 topic page can read an MCQ prompt, select an option, submit, see correct/incorrect feedback, see the explanation, and have the submission written to `users/{uid}/mcqSubmissions/{compositeId}` where compositeId = `${topicId}__${questionId}`.

The mechanic does NOT extend into the spaced-return scheduler. MCQ submissions live in their own Firestore subcollection, distinct from `drillRatings`. The Sprint 6 §3.2 generation-vs-recognition boundary is preserved.

The mechanic does NOT add to the `/teacher` dashboard or `/teacher/export` payload in v1. Adding MCQ aggregates to the teacher view is a follow-up if Chris wants it once the pilot generates real MCQ data.

---

## 3. Scope decisions

### 3.1 Pattern donor: Sprints 6 and 7A

Wherever Sprint 6's drill-rating surface or Sprint 7A's teacher-dashboard surface established a pattern (Firestore wrapper signatures, rules block structure, vitest rules-test layout, pure-helper unit testing), Sprint 7B copies it. Departures require an explicit reason and a Section 8 log entry.

### 3.2 Unit of measurement: per-question submission

A submission records that a specific student answered a specific MCQ on a specific topic. CompositeId is `${topicId}__${questionId}` matching the drill-ratings convention. Upsert semantics: re-attempting the same MCQ overwrites the previous submission (we keep the latest answer, not a history of attempts). This matches the drill-rating upsert pattern and avoids history-array complexity.

### 3.3 Schema: minimal

Document shape:
```
{
  topicId: string,
  questionId: string,
  selectedIndex: int (0..options.length-1),
  correctIndex: int,
  isCorrect: bool (derived from selectedIndex == correctIndex),
  submittedAt: timestamp,
  source: 'signal'
}
```

No client-side scoring history. No attempt count. Just "the latest answer this student gave to this MCQ". A future Sprint can add aggregates if the writeup needs them.

### 3.4 Rules-side: cross-user reads NOT granted to teachers in v1

The Sprint 7A teacher allowlist grants cross-user reads on drillRatings, sessions and attempts, but NOT on `mcqSubmissions`. The same v1 boundary as `submissions` (NEI prose): until Chris decides explicitly that teachers should see per-student MCQ correctness, the rule stays student-only. A future Sprint can widen it with a Section 8 entry in this document.

### 3.5 Surface: in-place on the AssessmentBlock; no dedicated route

`/teacher` got a dedicated route in Sprint 7A because it's a teacher-only surface. MCQs live inside topic pages where students already are. No `/mcq` route, no new navigation entry. The existing AssessmentBlock placeholder is the slot.

### 3.6 No spaced-return integration

Sprint 6 §3.2 made the call: MCQs are recognition, not generation. Sprint 7B holds that line. MCQ submissions do NOT enqueue cards into the drill review queue. The two mechanics coexist; they don't compose.

---

## 4. Increment plan

Four increments. Each maps to a small PR.

### Inc 7B.0: Firestore rules + schema for mcqSubmissions

Adds the `users/{uid}/mcqSubmissions/{compositeId}` block to `firestore.rules` with the document-shape predicates from §3.3. Student-only writes; student-only reads in v1 (teachers explicitly excluded; teacher dashboard does not gain MCQ visibility this sprint). 10-12 adversarial vitest tests under projectId `"demo-signal-mcq-rules"`.

Estimated 1 day.

### Inc 7B.1: MCQ runner React component + AssessmentBlock integration

New `src/components/MCQRunner.tsx` React island. Takes the MCQ value from frontmatter (id, prompt, options[], correct_index, feedback_correct, feedback_incorrect) as props. Renders prompt, option list with radio inputs, submit button. On submit: writes to Firestore via a new `src/lib/mcqStore.ts` helper, shows correct/incorrect feedback inline. Read-back of any previous submission (if the student has answered this question before) so the UI reflects current state on page load.

Replaces the placeholder branch in `AssessmentBlock.astro` lines 74-86. Existing NEI rendering unchanged.

Estimated 2 days. Playwright smoke spec covers the submit + feedback path.

### Inc 7B.2: Result visibility on the topic page + scoring summary

When all MCQs on a topic have been attempted, the AssessmentBlock surfaces a per-topic "you got N of M correct" summary at the top. Counts come from Firestore (a single read per topic page load is cheap). Includes a "retry" affordance that clears the local state and lets the student answer again (which overwrites the submission per §3.2 upsert).

Estimated 1 day.

### Inc 7B.3: Teacher's guide update + handover entry

Adds a new subsection to `docs/teacher-guide.md` describing the MCQ runner. Brief — one paragraph plus a likely-student-questions list. Section 5 of the teacher's guide (the dashboard) is unchanged because Sprint 7B does not add MCQ visibility to the dashboard.

Estimated 0.5 days.

---

## 5. Exit criteria

- [ ] `firestore.rules` updated with the mcqSubmissions block; deployed to both staging and prod (Trap 12)
- [ ] 10-12 rules tests passing; existing 126 rules tests still passing
- [ ] MCQRunner component renders, submits, shows feedback, and reads back prior submissions
- [ ] AssessmentBlock.astro placeholder branch replaced; existing NEI rendering unchanged
- [ ] Per-topic MCQ summary surfaces when all MCQs on the topic are attempted
- [ ] Playwright smoke spec exercises one MCQ submit + feedback cycle
- [ ] No regression in existing CI (build green, all existing tests pass)
- [ ] `docs/teacher-guide.md` updated with the MCQ subsection

---

## 6. Out of scope

Named explicitly so Sprint 7B holds the line.

- **Spaced-return scheduler integration for MCQs.** §3.6 above. Recognition items don't enqueue.
- **Teacher dashboard MCQ aggregates.** §3.4 above. Teachers don't gain MCQ visibility this sprint. Adding this is a one-line rule change + a teacher-view extension; deferred until Chris asks.
- **Quick Fire as a session mode.** The mechanic name "Quick Fire" suggests a timed gauntlet across many MCQs. v1 is per-topic MCQs in the AssessmentBlock only; the cross-topic gauntlet is a future surface.
- **MCQ analytics export.** The Sprint 7A export endpoint doesn't include MCQs in v1. Adding them is a follow-up.
- **Attempt history.** §3.2 above. Upsert semantics; no history array.
- **Confidence calibration.** The Sprint 3 deferral mentioned "confidence calibration AND Quick Fire MCQ"; this sprint takes the MCQ runner only. Confidence calibration (a separate mechanic that asks the student to rate their certainty before revealing) is a future scope.

---

## 7. Risks

**R1. Pilot students re-doing all MCQs to "complete" the topic.** The upsert semantics mean a re-attempt overwrites the first answer. Engagement metrics will show "1 attempt per MCQ" even if the student answered multiple times. Mitigation: this is acceptable for v1 — the pilot writeup discipline already treats single per-question outcomes as the unit. If retry patterns become interesting, a future scope adds attempt counters.

**R2. Recognition feedback skewing pre/post test performance.** Students who answer MCQs and see correct/incorrect feedback are learning the legislation answer. This is a known intervention effect. Mitigation: the pre/post test uses different scenarios and a different format (open-response 1-mark Name + 2-mark Explain), so direct memorisation of MCQ answers does not transfer cleanly to the test. The pilot evaluation plan §4 already commits to non-causal language about engagement effects on performance.

**R3. AssessmentBlock complexity creep.** Today AssessmentBlock renders MCQ as placeholder, NEI as a React island, and nothing else. With Sprint 7B it renders MCQ as a React island, NEI as a React island, and a topic-level summary. This is the second major shape change in a quarter. Mitigation: the topic-level summary is one read + one display; the MCQ runner is its own island; AssessmentBlock stays a thin dispatcher.

**R4. Firebase write quota on submit-click.** Every MCQ submit writes a Firestore document. For a 14-student cohort attempting 10 MCQs each over four sessions = 560 writes total. Trivial. Not a concern at this scale.

---

## 8. Sprint-time changes log

Empty at draft time. Any change to scope, increment shape, exit criteria or out-of-scope list during Sprint 7B implementation is logged here with date and reason.

---

## 9. If Chris picks a different candidate

This document recommends B. If Chris picks C, D or a new candidate (e.g., a DP comic conversion, or content work like worked-example additions or blind Pass 2 re-runs), the structure above (Sections 2 to 8) needs a rewrite for the chosen path. Section 1's candidate survey stays as the historical record.

If Chris wants to skip platform breadth entirely and focus on content work (worked examples, blind Pass 2 re-runs, scenario-pool extensions), Sprint 7B may not be the right frame at all. Those are individual PRs rather than a multi-increment sprint. In that case this document should be closed (PR closed without merge) and the work tracked directly in the handover §16.4 outstanding-work list.
