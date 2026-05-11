# Sort & Match for N·E·I — Specification v0.3

**Status:** Supersedes v0.2. Resolved (one outstanding question, 13.2, awaiting Dave's pilot date).
**Date:** 9 May 2026
**Author:** Chris Morris (drafted with Claude)
**Related docs:** `docs/pilot-evaluation-plan.md`, `docs/pilot-pre-post-test.md`, `docs/sprint-2-scope.md`, `docs/sort-and-match-content-review/six-vs.md`, `docs/sort-and-match-content-review/hospital-twin-tracks.md`
**Replaces:** Sprint 3 A1 (N·E·I structural highlighting on worked example).

## Major changes from v0.2

The Section 11 content review protocol surfaced a framework-fit problem during Hospital phrase extraction. Hospital is a Discuss-style question; the N·E·I framework's "Name" semantics are stable for concept-explanation and legislation question types but break down for Discuss questions, where what is being "named" is itself the consequence under discussion. Cold reader blind classification confirmed this pattern across two phrase-drafting attempts.

Resolution: v1 ships **two distinct recognition activities** rather than one activity covering all question types.

- **Sort & Match** (carried from v0.2, mechanics unchanged): handles concept-explanation and legislation questions where N has stable analytical content. Six Vs of Big Data is its v1 worked example.
- **Twin Tracks** (new in v0.3): handles Discuss-style questions where students must recognise balance between positive and negative impacts. Hospital Remote Access is its v1 worked example.

Twin Tracks was empirically validated by blind classification before being committed to the spec. The Introduce/Explain/Develop framework with positive/negative tracks classifies cleanly under cold reader test.

Sections affected: 2, 3, 4, 5, 6, 8, 9, 10, 11, 14. Section structure is retained from v0.2 with new subsections per activity where needed.

---

## 1. Purpose

This document specifies two recognition activities that train T-Level Digital students to identify the structural moves of analytical exam answers. Both activities are part of Signal's Sprint 3 build.

The activities address two problems:

1. **Methodology depth.** Signal's pedagogical claim is that exam mark schemes reward specific structural moves (Name/Explain/Impact for non-Discuss questions; positive/negative impact tracks each developed through Introduce/Explain/Develop for Discuss questions). Recognition is the foundation for production. These activities train recognition.

2. **Text-disengagement.** Existing worked examples on main are 250–700 words of academic prose each. Struggling students bounce off prose at that length regardless of content quality. Both activities decompose analytical work into draggable phrases and replace narrative prose with icon-driven comic panels.

## 2. Pedagogical model and scope

### 2.1 What these activities teach

Both activities train **recognition** of analytical structure:

- **Sort & Match** trains recognition of N·E·I structure for concept-explanation and legislation questions. Shown a phrase from an exam-style answer, can the student correctly identify whether it Names a concept/law, Explains its application, or describes Impact?
- **Twin Tracks** trains recognition of two-dimensional analytical structure for Discuss-style questions. Shown a phrase from a Discuss answer, can the student correctly identify which impact (positive/negative) it belongs to AND which structural slot (Introduce/Explain/Develop) it occupies?

### 2.2 What these activities do not teach

Neither activity directly trains **production** of structured answers. Recognition and production are related but distinct skills. A student who can sort N·E·I or Twin Tracks phrases reliably has a foundation for writing structured answers but is not guaranteed to write them well. The pre/post test (`docs/pilot-pre-post-test.md`) measures production; the activities measure recognition.

This honest scoping matters for examiner credibility. The activities are positioned as recognition-builders, not writing trainers.

### 2.3 Mitigation: post-success model-answer reveal

To partially bridge recognition → production, on successful completion of a round the student is shown the full worked example as a model answer with structural components colour-coded inline. This is **earned, not gated**: the student must complete the activity first; the model is a reward, not a prerequisite.

### 2.4 v1 scope

Two activities, two worked examples in scope:

- **Sort & Match** — Six Vs of Big Data (concept-explanation, Content Area 6.4.1)
- **Twin Tracks** — Hospital Remote Access (Discuss, T Level Core Paper 2 SAM Q10)

Future worked examples follow the same content patterns, mapped to the appropriate activity by the question's command word and analytical structure.

### 2.5 Question type to activity mapping

| Question type | Command words | Analytical structure | Activity |
|---|---|---|---|
| Concept-explanation | Explain, Identify, Define, Describe (concept) | N·E·I (Name=concept, Explain=mechanism, Impact=consequence) | Sort & Match |
| Legislation-application | Explain, Discuss (legislation context) | N·E·I (Name=law, Explain=application, Impact=consequence) | Sort & Match |
| Discuss (impact-balanced) | Discuss, Evaluate (with balance expectation) | Twin Tracks (positive impact + negative impact, each Introduce/Explain/Develop) | Twin Tracks |

The mapping is determined per worked example by inspection of the command word and the analytical structure the mark scheme rewards. Worked examples are tagged with `questionType` in the content model (Section 5).

## 3. Design decisions and rationale

### 3.1 Sort & Match decisions (carried from v0.2)

| # | Decision | Alternative considered | Rationale |
|---|---|---|---|
| SM1 | **Decompose-first architecture.** No prose front-loaded; the interaction *is* the lesson. | "Hybrid" — prose collapsed but available on tap. | Hybrid keeps prose-on-tap as fallback, undermining the principle that students manipulate structure rather than read about it. |
| SM2 | **Post-success model-answer reveal.** | Pre-activity worked-example display. | Reward-not-gate preserves principle (SM1) while still surfacing prose for students who want to study a model answer. |
| SM3 | **Narrative scenario delivered as icon-driven comic, not prose.** | Pure phrase-only activity; hand-illustrated comic; AI-generated character art. | Decompose-first still requires *some* scenario context for phrases to be meaningful. Comics carry scenario without prose. |
| SM4 | **Icon-driven illustration in Signal's existing aesthetic.** | Hand-illustrated, AI character art, photo-collage. | Brand-consistent, no character-consistency problem, lowest sustainable production cost. |
| SM5 | **Comic and phrase pool decoupled.** | Loosely linked or tightly coupled. | Accessibility-graceful: extra support for students who need scenario grounding, no friction for those who don't. |
| SM6 | **Whole sentences as phrase granularity.** | Clauses, noun phrases. | Decoupled architecture requires phrases self-contained enough to classify without comic context. |
| **SM7** | **N phrases must be pure naming acts.** *(NEW in v0.3, derived from Six Vs and Hospital extraction failures.)* | Hybrid name+describe phrasing. | Cold reader blind classification weights body content over structural markers. N phrases that conflate naming with describing or impact-stating fail blind classification regardless of question type. |

### 3.2 Twin Tracks decisions (new in v0.3)

| # | Decision | Alternative considered | Rationale |
|---|---|---|---|
| TT1 | **Two-dimensional classification (track × slot).** | Single-dimension (Sort & Match with relabelled buckets). | Discuss answers reward recognition of balance between positive and negative impacts. Single-dimension classification doesn't exercise this; two-dimensional does. |
| TT2 | **Six cells (2 tracks × 3 slots).** | More slots per track for richer answers. | v1 worked examples have 2-impact balanced shape. 3+3 (9 phrases) defers to v2. |
| TT3 | **Diagnostic feedback distinguishes track-error from slot-error.** | Undifferentiated "wrong placement" feedback. | Two-dimensional structure makes diagnostic feedback possible; reverting to single-state feedback wastes the activity's pedagogical advantage. |
| TT4 | **Stuck mitigation after 3 failed attempts.** | Different threshold per error type. | Consistency with Sort & Match. Threshold can be tuned based on pilot observation. |
| TT5 | **Same drag-drop library as Sort & Match (`@dnd-kit/core`).** | New library; native HTML5 drag. | Shared infrastructure cost; accessibility benefits transfer; keyboard sensor handles 6-cell sort identically. |
| TT6 | **Visual track distinction by position, not colour.** | Colour-coded tracks. | Slot colour-coding (if used) would conflict with track colour-coding. Position-based track distinction (top/bottom or left/right) keeps colour available for slot distinction or other UI signalling. |
| TT7 | **Whole sentences as phrase granularity.** | Clauses. | Same rationale as SM6. Decoupled-classifiable requirement applies equally to Twin Tracks. |
| TT8 | **Introduce phrases must state impact at general level only.** | Embedded mechanism or specifics. | Cold reader test confirmed: Introduce vs Develop distinction is reliable when Introduce is general and Develop carries specifics. Mixing specificity blurs the structural distinction. |

## 4. User journeys

### 4.1 Sort & Match user journey

A student opens Sort & Match for the first time:

1. **Entry.** Lands on the activity page (`/content-areas/sort-and-match`). Sees a brief one-line framing tailored to the worked example's question type. For Six Vs (concept-explanation): *"N(ame) the concept being applied, E(xplain) how it works, I(mpact) on the situation. Drag each statement into the right category."* Plus a "Start" button.
2. **Round start.** Activity loads one worked example. Top region: 4–6 icon-driven comic panels in a single horizontal strip. Below: three buckets labelled **N**ame, **E**xplain, **I**mpact, colour-coded per Signal's existing convention. To one side: a phrase pool of 5–8 whole-sentence draggable items.
3. **Drag.** Student drags a phrase into a bucket. Immediate visual feedback per Section 6.2.
4. **Stuck mitigation.** After 3 failed attempts on a single phrase, a stronger hint surfaces.
5. **Round progression.** Student continues until all phrases are placed correctly. Round insists on correctness.
6. **Round completion.** Success state, then post-success model-answer reveal (Section 8.1).
7. **Continue.** Next worked example or return.

### 4.2 Twin Tracks user journey

A student opens Twin Tracks for the first time:

1. **Entry.** Lands on the activity page (`/content-areas/twin-tracks`). Sees a brief one-line framing: *"Discuss-style answers balance one positive and one negative impact. For each, identify the introduction, explanation, and developed consequence. Drag each phrase to the right track and slot."* Plus a "Start" button.
2. **Round start.** Activity loads one worked example. Top region: 4–6 icon-driven comic panels in a single horizontal strip. Below: two horizontal tracks stacked vertically. Top track labelled "Positive impact" with three slots left-to-right (**Introduce / Explain / Develop**). Bottom track labelled "Negative impact" with the same three slots. Phrase pool of 6 whole-sentence draggable items to the right (or below on mobile).
3. **Drag.** Student drags a phrase into a (track, slot) cell. Immediate visual feedback per Section 6.3.
4. **Stuck mitigation.** After 3 failed attempts on a single phrase, a stronger hint surfaces stating both correct dimensions.
5. **Round progression.** Student continues until all 6 phrases are correctly placed. Round insists on correctness on both dimensions.
6. **Round completion.** Success state, then post-success model-answer reveal showing both impact paragraphs with slot-level inline coding (Section 8.2).
7. **Continue.** Next worked example or return.

## 5. Content model

### 5.1 Common structure with questionType discriminator

All worked examples share a common envelope:

```json
{
  "id": "...",
  "title": "...",
  "questionType": "concept" | "legislation" | "discuss",
  "scenarioPanels": [...],
  "phrases": [...],
  "modelAnswer": {...}
}
```

The `questionType` field drives activity routing and content shape. The `phrases` and `modelAnswer` shapes vary per question type per Sections 5.2 and 5.3.

Content lives in `src/data/sort-and-match/scenarios.json` and `src/data/twin-tracks/scenarios.json` respectively. Splitting per activity is cleaner than one combined file — each activity's content is independently authored, reviewed, and shipped.

### 5.2 Sort & Match content (concept and legislation)

```json
{
  "id": "six-vs-data-quality",
  "title": "Six Vs and Data Quality",
  "questionType": "concept",
  "scenarioPanels": [...],
  "phrases": [
    { "id": "ph1", "text": "...", "category": "N" },
    { "id": "ph2", "text": "...", "category": "E" },
    { "id": "ph3", "text": "...", "category": "I" }
    /* 5–8 total */
  ],
  "modelAnswer": {
    "name": "...",
    "explain": "...",
    "impact": "..."
  }
}
```

### 5.3 Twin Tracks content (discuss)

```json
{
  "id": "hospital-remote-access",
  "title": "Hospital Remote Access",
  "questionType": "discuss",
  "scenarioPanels": [...],
  "phrases": [
    { "id": "ph1", "text": "...", "track": "positive", "slot": "introduce" },
    { "id": "ph2", "text": "...", "track": "positive", "slot": "explain" },
    { "id": "ph3", "text": "...", "track": "positive", "slot": "develop" },
    { "id": "ph4", "text": "...", "track": "negative", "slot": "introduce" },
    { "id": "ph5", "text": "...", "track": "negative", "slot": "explain" },
    { "id": "ph6", "text": "...", "track": "negative", "slot": "develop" }
  ],
  "modelAnswer": {
    "positive": {
      "introduce": "...",
      "explain": "...",
      "develop": "..."
    },
    "negative": {
      "introduce": "...",
      "explain": "...",
      "develop": "..."
    }
  }
}
```

Locked at exactly 6 phrases for Twin Tracks v1 per decision TT2.

## 6. Interaction mechanics

### 6.1 Common (both activities)

**Drag-and-drop library:** `@dnd-kit/core` (modern React DnD library with strong touch and keyboard support out of the box). Selected over react-dnd (legacy) and native HTML5 drag-and-drop (manual touch handling required). Both activities use the same library.

**Keyboard accessibility (WCAG AA):** `@dnd-kit/core` provides a built-in keyboard sensor: phrases focusable with Tab, picked up with Space, moved between drop targets with arrow keys, dropped with Space. Same scoring and feedback path as mouse/touch drag for both activities.

**Stuck mitigation:** Both activities surface a stronger hint after 3 failed attempts on a single phrase. The student must still place the phrase correctly to advance — the mitigation reveals the answer but does not bypass the action of classifying.

### 6.2 Sort & Match wrong-drop handling

Incorrect drop snaps back to phrase pool with brief amber flash and a one-line redirect. The redirect is informative but not a full explanation; the student must still find the correct bucket through their own reasoning.

### 6.3 Twin Tracks wrong-drop handling

Two-dimensional placement enables diagnostic feedback distinguishing the failure mode:

| Student got | Feedback |
|---|---|
| Both correct | Green flash, phrase locks in cell |
| Right track, wrong slot | Amber flash, snap back: "This belongs in the [positive/negative] impact but a different structural role — try [slot]" |
| Wrong track, right slot | Amber flash, snap back: "This is the right structural role but the wrong impact direction" |
| Both wrong | Amber flash, snap back: "Re-read the phrase and try again" |

A student who consistently gets track right but slot wrong has a different misconception (structural) from one who consistently gets slot right but track wrong (axis). Diagnostic feedback supports both pilot observation and student self-correction.

### 6.4 Feedback timing (both activities)

Immediate per-drop. No batched "check answers" button. Per-drop feedback keeps students in flow and prevents the all-wrong-at-end demoralisation pattern.

## 7. Persistence model

Mirrors Risk Classifier patterns. Per-activity paths to keep analytics cleanly separable.

- Sort & Match: `users/{uid}/data/sort-and-match/sessions/{sessionId}` and `…/attempts/{attemptId}`
- Twin Tracks: `users/{uid}/data/twin-tracks/sessions/{sessionId}` and `…/attempts/{attemptId}`

Per-attempt write at the moment of correct placement; per-session write on round completion. `source: 'signal'` field on writes. Module imports of Firebase (not `window.MSM_APP`).

Owner-only security rules per activity; same adversarial-test pattern as Risk Classifier (vitest + `@firebase/rules-unit-testing`). Unique `projectId` per test file (`"demo-signal-sort-match"`, `"demo-signal-twin-tracks"`).

## 8. Visual specification

### 8.0 Common visual language

- **Comic panels (both activities):** Icon-driven vector compositions in Signal's existing aesthetic. Background `--void`. Accents `--green` for active/affirming, `--amber` for warning/incident. Orbitron for captions; Share Tech Mono for any data/UI mockups within panels. Glyphs over photographic or character-driven art. Single horizontal strip, 4–6 panels, wraps on mobile.
- **Icon vocabulary:** Shared across both activities. ~15 glyph minimum-viable set, designed before any scenarios are authored. Buildings (hospital, server room, office, data centre); roles-as-glyphs (clinician, employee, attacker — no portraits); network states (secure, unsecured, breached, encrypted); data states (at-rest, in-transit, exposed, encrypted); outcome indicators (warning, breach, compliance-pass).

### 8.1 Sort & Match visual specification

- **Buckets:** Three labelled buckets, side-by-side on desktop, stacked on mobile. **N** (Name) red token, **E** (Explain) amber token, **I** (Impact) green token. Colour mapping follows Signal Sprint 1 brief convention.
- **Phrase cards:** Whole-sentence cards in the phrase pool. Sans-serif body (system stack), `--green` border, `--void` background. Drag-handle indicator on hover and equivalent on focus for keyboard sensor.
- **Build approach:** Desktop-first, mobile-responsive.

### 8.2 Twin Tracks visual specification

- **Tracks:** Two horizontal tracks stacked vertically. Top track labelled "Positive impact." Bottom track labelled "Negative impact." Track distinction by position and label, not by colour (per decision TT6). A subtle horizontal divider line between the two tracks acts as a light visual fulcrum.
- **Slots:** Three labelled cells per track, left-to-right: Introduce, Explain, Develop. Cell labels visible at all times (not on hover) to support keyboard navigation and student orientation. Slot colour-coding optional; if used, must avoid conflict with track distinction.
- **Phrase cards:** Same as Sort & Match.
- **Mobile (<768px):** Tracks stack vertically; each track's three slots stack within it. Phrase pool above or below the tracks per scroll pattern.
- **Build approach:** Desktop-first, mobile-responsive.

## 9. Routes and integration

- Sort & Match page route: `/content-areas/sort-and-match`. Page file: `src/pages/content-areas/sort-and-match.astro`. React island: `src/components/sort-and-match/SortAndMatch.tsx`.
- Twin Tracks page route: `/content-areas/twin-tracks`. Page file: `src/pages/content-areas/twin-tracks.astro`. React island: `src/components/twin-tracks/TwinTracks.tsx`.
- Both linked from the existing content-areas hub. Hub navigation organises activities by content area / question type — out of scope for this spec; tracked as a follow-up.

## 10. Build risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Icon vocabulary undersized for two scenarios | Medium | Medium | Build minimum-viable icon set (~15 glyphs) before any scenario authored. Treat as design-system investment shared by both activities. |
| Phrase extraction quality insufficient under decoupled architecture | High | High | Two-pass content review protocol (Section 11). Demonstrated track record: Section 11 has now caught problems in 2 worked examples and validated the Twin Tracks framework. |
| Whole sentences too long for mobile drag UX | Medium | Medium | Limit sentence length to ~25 words; design phrase cards for two-line mobile display. Both activities. |
| `@dnd-kit/core` learning curve / integration cost | Low | Medium | Library is well-documented; touch and keyboard sensors available out of the box. Single library serving both activities reduces overall cost. |
| Comic style drift between worked examples | Medium | Low | Shared icon vocabulary; design simpler scenario first (Six Vs), then more complex (Hospital). |
| Recognition→production gap is wider than mitigation reveals can bridge | Medium | Low | Honest scoping in copy; defer to confidence-calibration adaptation in later sprints. |
| Stuck mitigation triggers too eagerly or too late | Low | Low | Threshold of 3 failed attempts is initial guess; tune based on pilot observation. |
| **Twin Tracks 6-cell layout cognitive load on mobile** | Medium | Medium | Mobile responsive design; collapsed track-stacking layout. Pilot observation will reveal if the layout is too dense. |
| **Twin Tracks Introduce vs Develop distinction confuses students** | Medium | Medium | Empirically validated for cold readers (passed Section 11 protocol). Student validation comes from pilot. Diagnostic feedback (Section 6.3) gives students per-error guidance. |
| **Track polarity ambiguity for neutral phrases** | Low | Low | Phrase extraction discipline excludes neutral phrases. Author must commit each phrase to a track during Pass 1. |

## 11. Content review protocol

The decoupled architecture (decisions SM5 and TT1) places significant load on phrase quality. Each phrase must be classifiable by a cold reader along the activity's classification dimensions without reference to the comic. This protocol is a pre-flight check against the most common failure mode.

### 11.1 Two-pass protocol (common)

**Pass 1 — Author classification.** Chris drafts each phrase from the worked example, annotated with intended classification and a brief justification.

**Pass 2 — Blind classification.** A fresh chat session — no prior context, no comic, no scenario notes — receives each phrase one at a time using a setup prompt that defines the activity's classification framework. Each answer is recorded.

### 11.2 Resolution

Phrases where Pass 1 and Pass 2 agree pass into the activity's `scenarios.json`. Phrases where Pass 1 and Pass 2 disagree are rewritten until they pass — typically by adding context within the phrase itself.

### 11.3 Threshold

If more than **20% of phrases** disagree on first pass for a given worked example, the extraction approach for that example needs rethinking — not just specific phrases. The decoupling assumption may be incompatible with the source material as written, or the framework may need adjustment.

If the threshold is hit on a Twin Tracks example, count phrase-level failure (a phrase fails if either dimension is wrong).

### 11.4 Activity-specific rules

- **Sort & Match.** N phrases must be pure naming acts (decision SM7). Any embedded description, mechanism, or consequence content makes them ambiguous to cold readers.
- **Twin Tracks.** Introduce phrases must state impact at general level only (decision TT8). Develop phrases must carry specifics, scenario tie-back, or named consequences. Mixing specificity levels blurs the structural distinction.

### 11.5 Honest limitation

A fresh Claude classifying phrases is **not equivalent** to a T-Level student classifying them. It is a proxy for "any reasonably literate cold reader." Real validation of phrase quality is the pilot itself; this protocol is a pre-flight check, not a substitute.

If Dave is available to sense-check a sample of phrases (~20%) ahead of the pilot, that materially strengthens this protocol.

### 11.6 Output

Per worked example:

- A `scenarios.json` content record (per content model in Section 5)
- A content-review log noting which phrases required rewriting and why; committed under `docs/sort-and-match-content-review/<example-id>.md`

The log is informal but versioned — it serves as a record for future content authoring and demonstrates the protocol was applied. The Twin Tracks log uses the same structure as the Sort & Match log; the activity-specific framework is recorded in the log header.

## 12. Out of scope for v1

- Tightly coupled phrase-panel layout
- Confidence calibration per analytical component
- Quick-fire MCQ for recognition
- More than two worked examples (one per activity)
- AI-generated character-driven panels
- Spaced repetition / Leitner across activities
- Multiplayer / classroom drill mode
- Sharing / export of completion state
- Difficulty levels or adaptive phrase selection
- AXIOM-7 marking of free-text answers
- 3+3 (9 phrase) Twin Tracks examples
- Hub navigation reorganisation

## 13. Resolved decisions and outstanding questions

### 13.1 Resolved (v0.2 and v0.3)

| # | Question | Resolution | Where |
|---|---|---|---|
| Round retry mechanics (carried) | Insist on correctness; stuck mitigation after 3 failed attempts. | Section 4, 6.2, 6.3 |
| Session persistence granularity (carried) | Per-attempt and per-session writes. Per-activity Firestore paths. | Section 7 |
| First-time intro (carried, expanded) | One-line framing per activity in intro panel; no separate tutorial. | Section 4 |
| Mobile-first vs desktop-first build (carried) | Desktop-first, mobile-responsive, both activities. | Section 8 |
| Comic panel count (carried) | Vary 4–6 per scenario; horizontal strip layout. | Section 8 |
| Phrase content review process (carried, expanded) | Two-pass protocol with activity-specific rules. | Section 11 |
| **N has stable cross-question-type semantics?** *(new)* | No. N's semantics are stable for concept and legislation question types but not for Discuss. Discuss requires a different recognition activity. | Section 2.5, 3.2 |
| **What activity handles Discuss questions?** *(new)* | Twin Tracks: two-dimensional sort across positive/negative tracks and Introduce/Explain/Develop slots. | Section 3.2, 4.2, 6.3, 8.2 |

### 13.2 Outstanding

- **Pilot integration.** Depends on Dave's pilot date confirmation. If activities ship before pilot start, the pre-registered evaluation plan is amended to include Twin Tracks metrics alongside Sort & Match. If after, no amendment needed. Tracked as a known unknown — not a build blocker.

## 14. Build estimate

Two activities with shared infrastructure. Estimates for focused-work hours, not elapsed time.

**Shared:**
- Icon vocabulary design system: 3–5 days
- `@dnd-kit/core` integration baseline: 2–3 days
- Persistence + Firestore rules + adversarial tests (per activity, ~2–3 days each): 4–6 days total

**Sort & Match-specific:**
- Phrase extraction + content review (Six Vs): done as of v0.3
- Comic panel composition (Six Vs, ~6 panels): 2–3 days
- React component + drag interaction: 4–6 days
- Post-success model-answer reveal: 1–2 days
- Integration, route, polish: 2–3 days

**Twin Tracks-specific:**
- Phrase extraction + content review (Hospital): done as of v0.3
- Comic panel composition (Hospital, ~4 panels): 2–3 days
- React component + 2D drag interaction with diagnostic feedback: 6–8 days
- Post-success model-answer reveal (two-paragraph layout): 2–3 days
- Integration, route, polish: 2–3 days

**Total: ~5–8 weeks of focused work for both activities.** Real elapsed time depends on review cycles and parallel work. Twin Tracks is incrementally more expensive than Sort & Match due to the 2D interaction complexity and diagnostic feedback design.

## 15. Build readiness checklist

- [x] All design decisions in Section 3 confirmed (SM1–SM7, TT1–TT8)
- [x] All open questions in Section 13 resolved (carried v0.2 questions plus new framework-fit questions)
- [x] Phrase extraction reviewed and validated for Six Vs (Sort & Match) and Hospital (Twin Tracks)
- [ ] Icon vocabulary (~15 glyphs) designed and approved
- [ ] Pilot integration question (13.2) resolved when pilot date confirmed
- [ ] Spec v0.3 merged to main

When all unchecked items above are checked, build can begin.
