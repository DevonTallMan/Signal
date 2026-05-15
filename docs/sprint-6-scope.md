# Sprint 6 Scope: Spaced-Return Mechanism Build

**Status: pre-build scope document, agreed before Sprint 6 implementation begins.**
**Date of agreement: 2026-05-15.**
**Parties: Chris Morris (author), Claude (review partner).**

This document defines what Sprint 6 builds, in what order, with what exit criteria. It is a working artefact: changes during the sprint are logged in Section 8 with date and reason.

Cross-references:
- Design conversation that produced this scope: 2026-05-15 working session between Chris and Claude, framed around what would maximise long-term retention. Headline conclusion: the linear-versus-modular dichotomy was the wrong axis; the variable that moves retention is the return mechanism, not the first-encounter structure.
- Existing drill UI (pattern donor for the rating capture surface): `src/components/TerminologyDrill.tsx`
- Existing drill Firestore wrapper (pattern donor for scheduler state writes): `src/lib/drillStore.ts`
- Pilot evaluation plan Section 8 (re-agreement target): `docs/pilot-evaluation-plan.md`
- Teacher's Guide (one paragraph addition target): `docs/teacher-guide.md`
- Sprint 4 scope doc (structural reference for this document): `docs/sprint-4-scope.md`

---

## 1. Risk and timeline note (read first)

Sprint 6 is not pilot-gating. The CA 4.1 content area authoring track (Inc 5.0 through 5.4) and the M.4.1 worked example completed the agreed pilot-readiness content path. Sprint 6 is the deliberate pre-pilot investment in the retention mechanism that the design conversation identified as the highest-leverage missing piece.

Estimate: 5.5 focused days of work, realistic calendar window 7 to 9 days once CI cycles and review passes are included. Target window mid-July through mid-August 2026, giving comfortable margin before the pilot starts on Monday 21 September 2026.

If Sprint 6 cannot ship in full by 14 September 2026, three options apply in priority order:

1. Cut Inc 6.4 enqueueing wiring temporarily and ship Sprint 6 without it. The mechanism exists but does not run; reviews surface only for cards manually enqueued in test. Pilot proceeds against the existing "platform exposure" intervention without spaced retrieval. Section 8 of `pilot-evaluation-plan.md` does not need re-agreement.
2. Ship Inc 6.0 through 6.3 plus a minimal manual seed of the queue with one card per topic. Pilot proceeds against a hand-seeded version of the intervention.
3. Slip the build into the pilot window. This requires Section 8 re-agreement and changes the pre-registered intervention shape, so option 3 is the last resort.

Cuts and slips are logged in Section 8.

A critical pre-pilot consideration: Year 1 students start the pilot with an empty review queue. Cards enqueue during sessions 1 and 2 and start coming due in sessions 2 to 4. The within-pilot retention signal is genuinely weak; the mechanism's main effect is at the 6-month mark, not the 4-week mark. This is documented up front so post-pilot writeup cannot retrofit a stronger claim.

---

## 2. Sprint goal

Build a spaced-retrieval mechanism layered on top of the existing drill rating infrastructure. By sprint end, a logged-in student rating a drill card produces a scheduler-state update; the platform surfaces due cards across all topics on the home page and at a dedicated `/review` route; a soft session-opener prompt at session start nudges students to clear pending reviews before new content; the scheduler advances cards through a Leitner-style box system (1, 3, 7, 21, 60 days) on success and resets to box 0 on failure.

The mechanism takes the existing `TerminologyDrill` rating capture, which today writes outcomes to Firestore but does nothing with them, and turns those ratings into a scheduled return loop that brings learners back to cards they have rated correctly when those cards are most efficient to re-encounter.

---

## 3. Scope decisions

The design conversation locked the substantive choices. Sprint 6 does not relitigate them. The decisions below are Sprint-6-specific build choices that the conversation did not pin down.

### 3.1 Pattern donor: Sprints 3 and 4

Wherever earlier activity sprints established a pattern (Firestore wrapper signatures, seeded picker shape, test API window-property convention, rules block structure, Playwright fixture organisation, vitest rules-test layout), Sprint 6 copies it. Departures require an explicit reason and a Section 8 log entry.

### 3.2 Unit of retrieval

Drill cards only for Sprint 6. NEI prompts and activity scenarios are not part of the queue and are explicitly out of scope per Section 6.

The rationale is twofold. First, drill cards are the cleanest evidence-aligned unit: cue plus generated answer is pure retrieval, in line with the testing effect literature. Multiple choice prompts and scenario-shaped questions involve recognition or applied reasoning, and the generation effect (Slamecka and Graf 1978) argues against recognition items as the scheduler's core. Second, the existing infrastructure already captures binary outcomes on drill cards; layering Leitner scheduling on top is incremental, not a rebuild.

### 3.3 Scheduling algorithm: Leitner boxes

Five boxes with fixed intervals: box 0 = 1 day, box 1 = 3 days, box 2 = 7 days, box 3 = 21 days, box 4 = 60 days. A card moves up one box on a "got" outcome and resets to box 0 on a "miss" outcome. A card that succeeds at box 4 graduates from the active queue (still visible on its topic page for self-review, no longer surfaced as a scheduled return).

SM-2 and FSRS are rejected as premature optimisation for the platform's scale. The current pilot involves 14 students, four weeks, and roughly 40 drill cards across CA 4.1. The marginal accuracy of more sophisticated algorithms does not earn its build cost at this scale. Re-evaluate post-pilot if usage data argues for it.

### 3.4 Surface: home-page widget plus dedicated /review route plus soft session-opener prompt

Three surfaces, hierarchical in invasiveness:

- A persistent home-page widget showing the count of cards due today. Pull-based. Always visible, always optional.
- A dedicated `/review` route that pulls all due cards across all topics into one continuous review session. Used both opportunistically (student clicks the widget) and structurally (session-opener routes here).
- A soft session-opener prompt on the home page: when a logged-in student returns to the home page and has pending reviews, a banner offers "Start with N reviews before new content?" with a "Start with new content" alternative. Default action is reviews. Both options always available; nothing is mandatory.

The mandatory session-opener variant from the design conversation is rejected for Sprint 6 because Dave is unlikely to gain by reducing student agency at session start; the soft variant captures most of the retention benefit while preserving student choice.

The mixed-into-activities variant is rejected because the unit of retrieval is drill cards, not scenarios; routing drill reviews through Risk Classifier or Sort & Match would conflate two distinct learning modes.

### 3.5 Enqueueing trigger

A drill card enters the user's review queue at box 0 with nextReviewDate = ratedAt + 1 day at the moment the user first rates that specific card (got or miss). No automatic enqueue on topic page visit; rating is the explicit signal that retrieval practice has happened.

A "miss" rating at first encounter enqueues the card at box 0, same as a "got" rating, but with a shorter interval (4 hours rather than 1 day) for the first repeat. Subsequent miss outcomes reset to box 0 with 1 day.

### 3.6 Firestore data path and rules projectId

Sprint 6 extends the existing `users/{uid}/drillRatings/{compositeId}` document rather than creating a parallel collection. New fields added: `boxLevel`, `nextReviewDate`, `firstRatedAt`, `lastRatedAt`, `history` (array of `{outcome, at}` entries, capped at last 10).

vitest rules-test projectId: `"demo-signal-drill-scheduler-rules"`, unique from all existing projectIds per the engineering-gotchas memory.

The existing drillRatings rules block needs extension to allow writes to the new fields and to enforce schema constraints on them. The rules block must also remain backwards-compatible with any existing data without the new fields (read-time fallback initialisation, see Section 7 risk 3).

### 3.7 Test API window property

`window.__signalDrillSchedulerTestApi`, distinct from all existing test APIs. Exposes `enqueueCard(topicId, termId, outcome)`, `getDueCards(date)`, `getCardState(topicId, termId)`. Used by Playwright tests; never exercised in production code paths.

### 3.8 Build sequence: five increments, each separately committable

Defined in Section 4.

---

## 4. Build sequence (five increments)

### Increment 6.0: Firestore schema extension and rules tests

- Extend the existing `drillRatings` document schema with `boxLevel`, `nextReviewDate`, `firstRatedAt`, `lastRatedAt`, `history` fields. Read-time fallback initialises missing fields on legacy documents.
- Update `firestore.rules` `drillRatings` block to allow writes to the new fields with type and range enforcement: boxLevel in 0-4, nextReviewDate is a valid timestamp not more than 60 days in the future, history is an array of length 10 or less, history entries have the expected shape.
- vitest tests at `tests/rules/drill-scheduler.test.ts` using projectId `"demo-signal-drill-scheduler-rules"`. Target 25 adversarial tests covering: unauthenticated denial, cross-user write denial, schema enforcement on each new field, boxLevel boundary cases, history array bounds, legacy-document read-time fallback.
- Manual production rules deploy after merge: `firebase deploy --only firestore:rules --project mark-scheme-method-3efe9`.

**Done when:** existing drill ratings continue to write correctly; new fields can be written by their owner; all rules tests pass locally; staging Firebase Console shows the documents with the new fields when a test session writes them.

### Increment 6.1: Leitner scheduler and due-cards picker

- `src/lib/drillScheduler/scheduler.ts`: pure function `nextState(currentBoxLevel, outcome, now) -> {newBoxLevel, nextReviewDate}`. Locked intervals per Section 3.3.
- `src/lib/drillScheduler/picker.ts`: pure function `pickDueCards(allCardStates, now) -> DueCard[]`. Returns cards where nextReviewDate <= now, sorted by nextReviewDate ascending.
- `src/lib/drillScheduler/firestore.ts`: wrapper around `drillStore.saveDrillRating` that also reads the current document, computes the new scheduler state via `nextState`, and writes the full updated document. Use a transactional read-modify-write to handle concurrent rating writes safely.
- Unit tests at `src/lib/drillScheduler/*.test.ts`. Target 25 tests across the three files covering: each box transition, miss-reset, graduation from box 4, first-encounter miss path, picker date filtering, picker sort order, transactional retry on contention.

**Done when:** all 25 unit tests pass locally; a manually-constructed sequence of (got, got, miss, got) ratings produces the expected box-level trajectory and nextReviewDate sequence.

### Increment 6.2: Review route and ReviewSession React island

- New Astro page at `src/pages/review.astro`. Layout matches BaseLayout with the persistent nav.
- New React island at `src/components/DrillReview/ReviewSession.tsx`. Reads all due cards across all topics for the logged-in user, presents them one at a time with the same cue / reveal / rate UX as `TerminologyDrill`. Each rating advances the scheduler state and the local queue.
- Empty-state copy if no cards are due: "All caught up. Come back later, or visit a topic to add new cards to your review queue."
- End-of-session summary: cards reviewed, got vs miss split, total time elapsed, next earliest review date across the user's queue.
- Playwright smoke at `tests/drill-review.smoke.spec.ts` and full-session at `tests/drill-review.full-session.spec.ts` using the test API.

**Done when:** logged-in user navigates to `/review`, sees their actual due cards across topics, can rate each one, and the rating updates Firestore state. Empty state renders correctly when nothing is due. Playwright suite green.

### Increment 6.3: Home-page review widget

- Small widget on the home page (positioned above the Activities section, below the Hero CTAs) showing the count of cards due today and a "Review N cards" CTA linking to `/review`.
- When 0 cards due, the widget surfaces nothing (no clutter).
- Soft session-opener prompt: if there are due cards AND the user is logged in AND the last session-opener prompt was dismissed more than 12 hours ago, show a one-row banner above the widget offering "Start with N reviews before new content?" with explicit "Start with new content" dismissal. Dismissal recorded in localStorage with timestamp.

**Done when:** widget renders correctly with a non-zero due count, links through to `/review`, hides when no cards are due; soft prompt appears at appropriate times, dismissal preserved across page navigations for the 12-hour suppression window; mobile responsive at the <768px breakpoint.

### Increment 6.4: Enqueue wiring, Section 8 re-agreement, Teacher's Guide

- Wire the existing `TerminologyDrill.rate()` function to also call the new `drillScheduler` write path, so rating a card on its topic page enqueues or advances it through the scheduler.
- Backwards-compatible behaviour: an existing user who has rated cards before Sprint 6 ships sees those cards initialised at box 0 with nextReviewDate = now (so they appear immediately in the queue, but graduate naturally from there). No migration script; the fallback happens at read time.
- Add a Section 8 entry to `docs/pilot-evaluation-plan.md` documenting that the pre-pilot intervention now includes structured spaced retrieval. Pre/post test is unchanged. The empty-queue caveat from Section 1 of this scope doc is documented as a known measurement-integrity concern.
- Add a paragraph to `docs/teacher-guide.md` (probably under the "running a session" section) explaining the soft session-opener prompt so Dave can answer student questions about it.

**Done when:** rating a card on a topic page updates the scheduler state visibly (the home-page widget count and `/review` page reflect it); Section 8 entry merged; Teacher's Guide paragraph merged.

---

## 5. Sprint exit criteria

Sprint 6 is complete when all of the following are true:

- Drill rating on any topic page enqueues the card in the user's review queue with appropriate scheduler state.
- `/review` page accessible when logged in and pulls due cards across all topics.
- Home-page widget surfaces non-zero due-card counts and links through to `/review`.
- Soft session-opener prompt renders when due cards exist and was not recently dismissed.
- Leitner intervals (1, 3, 7, 21, 60 days) execute correctly across rating sequences.
- Cards graduate from the active queue after a successful rating at box 4.
- Firestore rules enforce ownership and schema on all new fields.
- Adversarial Firestore rules tests pass (25 tests).
- vitest unit tests pass (25 tests across scheduler, picker, firestore wrapper).
- Playwright smoke and full-session tests pass in CI.
- Section 8 of `pilot-evaluation-plan.md` documents the intervention change.
- Teacher's Guide includes a paragraph on the soft session-opener prompt.
- All five increments landed to main via squash-merge PRs in sequence.
- `firestore.rules` deployed to production manually post-merge of 6.0.

---

## 6. What this sprint does not do

This section is pre-registered so the sprint writeup cannot quietly omit it.

- Does not extend the queue to NEI prompts, MCQs or activity scenarios. Drill cards only. Other unit types are a candidate future sprint.
- Does not add learner-side configuration of interval lengths, skip options or graduation thresholds. Defaults locked.
- Does not add teacher-side reporting on review queue activity (cards rated, retention curves per student). That is a separate teacher-dashboard track and not pilot-gating.
- Does not change the existing drill UI's cue / reveal / rate UX. The TerminologyDrill component is reused as-is; only its persistence side changes.
- Does not change the existing Method library worked-example pattern. Worked examples are reference content, not retrieval items, and do not enter the queue.
- Does not implement a "study mode" or "exam mode" toggle. The queue is one mode.
- Does not implement email or push notifications for due reviews. The home page widget and the `/review` route are the only surfaces.
- Does not migrate any existing production drillRatings documents. Read-time fallback handles legacy documents on first access.

---

## 7. Risks

Six known risks, named pre-build.

**Risk 1. Empty queue at session 1 of the pilot.** Year 1 students arrive with no review state. Cards enqueue during sessions 1 and 2 and start coming due in sessions 2 to 4. The mechanism gets only about two weeks of within-pilot exercise. Mitigation: documented upfront in Section 1 and in the Section 8 re-agreement entry; the platform's main retention story is at the 6-month mark, not the 4-week pilot.

**Risk 2. Scheduler write contention under concurrent rates.** A student rating the same card twice quickly (network retry, double-tap) can produce a race where the second write computes its new state from the pre-first-write document and the resulting box level is one short. Mitigation: transactional read-modify-write in `drillScheduler/firestore.ts` (Inc 6.1) using `runTransaction`. Tests include a contention case.

**Risk 3. Legacy drillRatings without scheduler fields.** Any existing production drillRatings document predates the schema extension and lacks boxLevel and nextReviewDate. Mitigation: read-time fallback in `drillScheduler/firestore.ts` initialises the missing fields with sensible defaults (boxLevel = 0, nextReviewDate = now) on first scheduler-aware read, then writes them back on the next rating. No migration script needed.

**Risk 4. Soft session-opener prompt becomes annoying.** Repeated dismissals could degrade home-page experience. Mitigation: 12-hour suppression after dismissal (per Inc 6.3); the prompt is opt-in by default, not aggressive.

**Risk 5. Drill UI behaviour change affects existing topic pages.** Wiring the rate() function to also call the scheduler is a behaviour change that ships in Inc 6.4. If the scheduler write fails, the existing drill rating write must still succeed (drill keeps working even if the scheduler is broken). Mitigation: scheduler write wraps the drill rating write, not the other way round; failure in the scheduler logs to console but does not throw.

**Risk 6. Firestore production rules deploy step is manual.** Same risk pattern as Sprint 4 Risk 6. Mitigation: Inc 6.0 PR description includes a literal post-merge checklist line and Chris confirms the deploy is on his immediate action list before merge.

---

## 8. Re-agreement log

Changes to this document during Sprint 6 are logged here.

*None logged yet.*
