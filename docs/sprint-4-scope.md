# Sprint 4 Scope: Twin Tracks Activity Build

**Status: pre-build scope document, agreed before Sprint 4 implementation begins.**
**Date of agreement: 2026-05-14.**
**Parties: Chris Morris (author), Claude (review partner).**

This document defines what Sprint 4 builds, in what order, with what exit criteria. It is a working artefact: changes during the sprint are logged in Section 8 with date and reason.

Cross-references:
- Activity spec (locked at v0.3, covers both Sort & Match and Twin Tracks): `docs/sort-and-match-nei-spec.md`
- Hospital phrase set content review log: `docs/sort-and-match-content-review/hospital-remote-access.md`
- Hospital phrase set and modelAnswer: `src/data/twin-tracks/scenarios.json`
- Sprint 3 implementation reference (pattern donor): `src/components/SortAndMatch.tsx`, `src/lib/sort-and-match/`, `tests/sort-and-match.*`, `tests/rules/sort-and-match.test.ts`

---

## 1. Risk and timeline note (read first)

The pilot date with Dave Smith is currently TBD. Sprint 4 does not depend on a confirmed pilot date but is on the pilot critical path: until Twin Tracks ships, the pilot has one activity type and one scenario across four 30-minute sessions, which collapses engagement. Sprint 4 unblocks both the second activity type and the empirically validated Hospital worked example (PR #65, 6/6 cold-reader pass).

Scope is seven increments mirroring Sprint 3's cadence. Sprint 3 ran 3.1 through 3.6 across multiple working sessions over roughly four weeks. Sprint 4 should run faster because the Sprint 3 pattern is the de-risking input: Firestore wrappers, seeded picker, test API surface, rules block shape, Playwright fixtures, comic strip rendering against the glyph library all have a working template. The genuine net-new work is two-dimensional drop interaction, the 6-cell layout, per-drop diagnostic feedback (spec Section 6.3), and the two-track model answer reveal.

If Sprint 4 cannot ship in full by the pilot start date once Dave confirms it, two options apply in priority order:

1. Cut Increment 4.6 (Playwright tests). Manual smoke testing covers the pilot window; CI tests follow post-pilot. This is the only acceptable cut. All other increments are pilot-gating.
2. Slip the pilot start date by one week, subject to Dave's confirmation.

Cuts and slips are logged in Section 8.

---

## 2. Sprint goal

Build the Twin Tracks activity end-to-end so the Hospital Remote Access worked example (already content-reviewed in PR #65) goes live as Signal's second recognition activity type. By sprint end, a logged-in student visiting `/content-areas/twin-tracks` can complete a session: drag six phrases into a 6-cell positive/negative × Introduce/Explain/Develop grid, receive per-drop diagnostic feedback on wrong drops, hit the 3-attempt stuck mitigation if needed, view the two-track model answer reveal on success, and have the session and per-attempt data persisted to Firestore under rules that adversarial tests have proven safe.

---

## 3. Scope decisions

All Twin Tracks design decisions are already locked in spec v0.3 (Section 3.2 TT1 through TT8, Section 4.2 user journey, Section 5.3 content model, Section 6.3 wrong-drop handling, Section 8.2 visual layout). Sprint 4 does not relitigate any of them. The decisions below are Sprint-4-specific build choices that the spec does not pin down.

### 3.1 Pattern donor: Sprint 3

Wherever Sprint 3 established a pattern (Firestore wrapper signatures, seeded picker shape, test API window-property convention, rules block structure, Playwright fixture organisation, comic strip Glyph rendering), Sprint 4 copies it. Departures from the Sprint 3 pattern require an explicit reason and a Section 8 log entry.

### 3.2 SESSION_LENGTH constant

Locked at 3, matching Sort & Match. With only Hospital authored today, the picker returns N=1. Additional Twin Tracks scenarios are post-sprint content-only PRs.

### 3.3 Component directory structure

`src/components/twin-tracks/TwinTracks.tsx` (subdirectory), as the spec specifies in Section 9. Sort & Match uses a flat `src/components/SortAndMatch.tsx`. The subdirectory is justified for Twin Tracks because two-dimensional layout primitives (track row, slot column, drop cell, per-cell feedback) are plausible co-located helpers. Keep the entry component thin; extract helpers as they emerge.

### 3.4 Test API window property

`window.__signalTwinTracksTestApi`, distinct from `window.__signalTestApi` (Risk Classifier) and `window.__signalSortAndMatchTestApi` (Sort & Match). This avoids the TypeScript Window type-merge conflict surfaced in Sprint 3.

### 3.5 Firestore dataKey and rules projectId

Firestore data path: `users/{uid}/data/twin-tracks/sessions/{sessionId}` and `users/{uid}/data/twin-tracks/sessions/{sessionId}/attempts/{attemptId}` per spec Section 7.

vitest rules-test projectId: `"demo-signal-twin-tracks-rules"`, unique from `"demo-signal-rules"` (Risk Classifier) and `"demo-signal-sort-and-match-rules"` (Sort & Match). Shared projectIds cause race conditions where files clobber each other's rules.

### 3.6 Drop target ID encoding

Composite string `${track}-${slot}` (six values: `positive-introduce`, `positive-explain`, `positive-develop`, `negative-introduce`, `negative-explain`, `negative-develop`). Decoded at drop time to extract the two dimensions. Avoids parallel droppable trees.

### 3.7 Build sequence: seven increments, each separately committable

Defined in Section 4.

---

## 4. Build sequence (seven increments)

### Increment 4.0: Hospital scenarioPanels comic strip authoring

- Author 4 to 6 comic strip panels for Hospital Remote Access following the locked design decisions (icon-driven, no character illustration, decoupled from phrase pool, one-line caption per panel).
- Apply the two-pass content review protocol to the panel set. Pass 1: author writes panels with intended narrative arc. Pass 2: cold reader confirms the arc reads cleanly from icons and captions alone.
- Land panels into the `scenarioPanels` array in `src/data/twin-tracks/scenarios.json` (currently empty per PR #65's outstanding item).
- Add a review log entry at `docs/sort-and-match-content-review/hospital-remote-access.md` covering the comic strip review under a new Section 11 sub-heading.

**Done when:** `scenarioPanels` has 4 to 6 entries, the review log records the two-pass result for the comic strip, the JSON validates against the schema implied by spec Section 5.3.

### Increment 4.1: Static UI shell

- Astro page at `src/pages/content-areas/twin-tracks.astro` (follows Sort & Match's page layout for headers, footers, intro/outro shells).
- React island `src/components/twin-tracks/TwinTracks.tsx`.
- Renders the Hospital comic strip via Glyph components (read from scenarios.json).
- Renders the 6 phrases as a static phrase pool (no drag yet).
- Renders the 6-cell grid: top row positive × {Introduce, Explain, Develop}, bottom row negative × same.
- One-line framing caption per spec Section 4.2: *"Discuss-style answers balance one positive and one negative impact. For each, identify the introduction, explanation, and developed consequence. Drag each phrase to the right track and slot."*
- Visual styling consistent with Signal design tokens. Desktop-first responsive layout per spec Section 8.2.

**Done when:** logged-in user navigates to `/content-areas/twin-tracks` and sees the full static composition on desktop and tablet without errors. No interaction yet.

### Increment 4.2: Two-dimensional drag-and-drop

- Wire `@dnd-kit/core` PointerSensor.
- Six draggable phrase cards; six droppable cells encoded as `${track}-${slot}`.
- Drop registers the (track, slot) pair on the phrase's local state.
- Phrases snap to dropped cells visually; pool removes placed phrases; cells show placed phrases.
- No validation yet. Any phrase can be dropped into any cell.

**Done when:** all 6 phrases can be dragged into any of the 6 cells, state updates correctly, manual mouse testing confirms drop behavior is reliable on desktop.

### Increment 4.3: Per-drop validation, stuck mitigation, model answer reveal

- Validate each placement against the (track, slot) pair declared on the phrase in scenarios.json.
- On wrong drop: render diagnostic feedback per spec Section 6.3 (per-error guidance, not a single attempt-level message). Specific wording will be drafted during this increment and reviewed against the examiner-credibility standard before merge.
- 3-attempt stuck mitigation per spec decision TT (locked Sprint 3 pattern). After 3 failed attempts the scenario reveals the model answer in `complete-with-help` state.
- Post-success model answer reveal: render the two-track structured `modelAnswer` (positive × {introduce, explain, develop}, negative × same) with structural distinction visible per spec.
- State machine mirrors Sort & Match: `loading` → `placing` → `feedback` (attempt 2/3) → `complete-correct` | `complete-with-help`.

**Done when:** a user can complete a Hospital session manually with all 6 cells correct, see the model answer reveal in success state; can also fail 3 times and see the with-help reveal. Diagnostic feedback messages are content-reviewed and merged.

### Increment 4.4: Session loop

- `src/lib/twin-tracks/sessionPicker.ts` mirroring Sort & Match's seeded picker. Returns up to SESSION_LENGTH=3 distinct scenarios from the available pool (today: returns N=1 against Hospital alone).
- Unit tests at `src/lib/twin-tracks/sessionPicker.test.ts` (target 10 tests, mirroring Sort & Match coverage).
- Multi-scenario component cycling in `TwinTracks.tsx`: completes one scenario, advances to next, ends in `session-complete` state.
- End-of-session summary with score (correct on attempt 1 vs with-help) and time.

**Done when:** a logged-in user can complete a full session start to finish (N=1 today; the same component works unchanged when more scenarios land).

### Increment 4.5: Firestore persistence and adversarial rules tests

- `src/lib/twin-tracks/firestore.ts`: `startSession`, `writeAttempt`, `completeSession` following Sort & Match's signatures and silent-failure-with-console-error pattern. Use module imports from `../../firebase`, not the legacy `window.MSM_APP` pattern.
- Extend `firestore.rules` with a `twin-tracks` dataKey block matching Sort & Match's pattern (per-user write only, no cross-user reads, no orphan attempts).
- vitest tests at `tests/rules/twin-tracks.test.ts` using projectId `"demo-signal-twin-tracks-rules"`. Target 20+ adversarial tests covering: unauthenticated denial, cross-user write denial, schema enforcement on session and attempt documents, malformed payload denial, completed-session immutability, attempt-without-session denial.
- Run vitest locally before pushing (per the gotcha: don't push and rely on CI).
- Manual production rules deploy after merge: `firebase deploy --only firestore:rules --project mark-scheme-method-3efe9`.

**Done when:** a logged-in user completing a session produces the expected Firestore documents in staging; all rules tests pass locally; staging Firebase Console shows the documents.

### Increment 4.6: Playwright smoke and full-session tests

- `tests/twin-tracks.smoke.spec.ts`: page loads, components render, phrases visible, cells visible.
- `tests/twin-tracks.full-session.spec.ts`: full session via test API (`window.__signalTwinTracksTestApi.placePhrase(phraseId, track, slot)`), all attempts paths covered (1-attempt success, 2-attempt success, 3-attempt with-help).
- `tests/fixtures/twin-tracks.ts` for the activity-specific fixture, mirroring Sort & Match's `tests/fixtures/sort-and-match.ts`.
- Drag-and-drop driven exclusively through the test API. Real drag automation does NOT work with `@dnd-kit/core` PointerSensor (Sprint 3 trap, documented).

**Done when:** Playwright suite green in CI; manual mouse testing also green on the Cloudflare branch preview.

---

## 5. Sprint exit criteria

Sprint 4 is complete when all of the following are true:

- Page at `/content-areas/twin-tracks` accessible when logged in.
- Renders Hospital scenarioPanels (4 to 6 panels) via Glyph components.
- Renders 6-phrase pool and 6-cell grid (positive top row, negative bottom row; introduce/explain/develop columns).
- Drag-and-drop into cells works on desktop with `@dnd-kit/core`.
- Per-drop validation with diagnostic feedback per spec Section 6.3.
- 3-attempt stuck mitigation triggers the with-help model answer reveal.
- Post-success two-track model answer reveal renders correctly.
- Session loop: SESSION_LENGTH=3, seeded picker, multi-scenario component.
- Firestore persistence: `startSession`, per-attempt writes, `completeSession`.
- Adversarial Firestore rules tests pass (target 20+ tests).
- Playwright smoke and full-session tests pass in CI.
- All seven increments landed to main via squash-merge PRs in sequence.
- `firestore.rules` deployed to production manually post-merge of 4.5.

---

## 6. What this sprint does not do

This section is pre-registered so the sprint writeup cannot quietly omit it.

- Does not author a second Twin Tracks scenario. Hospital is the v1 example. Additional scenarios are post-sprint content-only PRs.
- Does not amend spec v0.3. The spec is locked; if a build problem surfaces a spec gap, the spec bumps to v0.4 with a separate PR and a Section 8 re-agreement log entry.
- Does not add a content-areas hub view linking Sort & Match and Twin Tracks. Hub navigation is post-sprint per spec Section 9.
- Does not unify Sort & Match and Twin Tracks Firestore wrappers. Per-activity wrappers stay separate.
- Does not backport diagnostic feedback patterns to Sort & Match. Sort & Match keeps whole-attempt validation; Twin Tracks introduces per-drop feedback.
- Does not add teacher-dashboard support for Twin Tracks. Dashboard parity follows in Sprint 5 or later.
- Does not implement self-service contributor authoring for Twin Tracks scenarios. Edits to `scenarios.json` remain git operations.

---

## 7. Risks

Six known risks, named pre-build.

**Risk 1. Two-dimensional drop is net-new in this repo.**
Sort & Match used three buckets; Twin Tracks uses six (track × slot). Drop target ID encoding (`${track}-${slot}`) and the decoding step at drop time are simple but untested in Signal. Increment 4.2 surfaces this early. Mitigation: the composite string approach is the most common @dnd-kit pattern for grid drops; ample community precedent.

**Risk 2. 6-cell layout cognitive load on mobile.**
Spec Section 10 risk row 1 flags this. Mitigation: desktop-first commitment per spec Section 8.2, with a responsive collapsed track-stacking layout for mobile. Empirical validation is pilot observation, not in scope for the build.

**Risk 3. Per-drop diagnostic feedback authoring.**
Six cells produce up to 30 wrong-drop combinations (each phrase has one correct cell and five wrong cells). Diagnostic feedback per Section 6.3 must be specific enough to teach but not so prescriptive it gives away the answer. Mitigation: spec Section 6.3 already defines the four-cell truth table (both correct, right track wrong slot, wrong track right slot, both wrong) so 4.3 authors four parameterised templates with `[track]` and `[slot]` substitution, not 30 individual messages. Authoring reviewed against examiner-credibility standard before merge.

**Risk 4. Single scenario limits session value.**
SESSION_LENGTH=3 with N=1 means students see Hospital three times per session. The seeded picker does not currently shuffle phrase order. Mitigation accepted: this is a content depth problem, not a build problem. Sprint 4 ships the mechanism; subsequent content PRs ship more Twin Tracks scenarios. Pilot prep should add at least one more Twin Tracks scenario before launch; that authoring happens in parallel with Sprint 4 build, not inside it.

**Risk 5. Pilot date uncertainty.**
Dave Smith has not confirmed the new pilot date. Sprint 4 build continues regardless; the only schedule consequence is whether the pilot evaluation plan needs amending to include Twin Tracks metrics (spec Section 14 flags this). Tracked as a known unknown, not a build blocker.

**Risk 6. Firestore production rules deploy step is manual.**
Production deploy after 4.5 merges is a `firebase deploy --only firestore:rules --project mark-scheme-method-3efe9` from local. Forgetting the step ships a production app that writes against staging-grade rules. Mitigation: 4.5 PR description includes a literal post-merge checklist line "MANUAL ACTION REQUIRED: deploy production rules" and the merge is held until Chris confirms staging tests pass and the deploy is on his immediate action list.

---

## 8. Re-agreement log

Changes to this document during Sprint 4 are logged here.

*None logged yet.*
