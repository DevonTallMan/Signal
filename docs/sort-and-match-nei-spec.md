# Sort & Match for N·E·I — Specification v0.2

**Status:** Resolved (one outstanding question, 12.6, awaiting Dave's pilot date)
**Date:** 8 May 2026
**Author:** Chris Morris (drafted with Claude)
**Related docs:** `docs/pilot-evaluation-plan.md`, `docs/pilot-pre-post-test.md`, `docs/sprint-2-scope.md`
**Replaces:** Sprint 3 A1 (N·E·I structural highlighting on worked example)
**Changes from v0.1:** Section 12 questions 12.1–12.5 and 12.7 resolved; new Section 11 (Content review protocol) added; minor textual updates to Sections 4, 5, 6, 7, 8 reflecting the resolutions; sections renumbered.

---

## 1. Purpose

Sort & Match for N·E·I is Signal's Sprint 3 build. It teaches recognition of N·E·I structure (Name, Explain, Impact) through a drag-and-drop interaction over short analytical phrases extracted from worked examples.

The activity is designed to address two problems simultaneously:

1. **Methodology depth.** N·E·I is Signal's distinguishing pedagogical claim. Risk Classifier teaches legislation classification; Sort & Match teaches how analytical writing is *structured* into Name / Explain / Impact components — the structure exam mark schemes reward and that students under-deliver on.
2. **Text-disengagement.** The worked examples currently on main (Six Vs, Hospital Remote Access) are 250–700 words of academic prose each. Struggling students bounce off prose at that length regardless of content quality. Sort & Match decomposes the analytical work into draggable phrases and replaces narrative prose with icon-driven comic panels, so the activity works without front-loaded reading.

---

## 2. Pedagogical model and scope

### 2.1 What this teaches

Sort & Match trains **recognition** of N·E·I structure: shown a phrase from an exam-style answer, can the student correctly identify whether it Names a piece of legislation, Explains its application, or describes Impact?

### 2.2 What this does *not* teach

The activity does not directly train **production** of N·E·I-structured answers. Recognition and production are related but distinct skills. A student who can sort N·E·I phrases reliably has a foundation for writing N·E·I-structured answers but is not guaranteed to write them well. The pre/post test (`docs/pilot-pre-post-test.md`) measures production; Risk Classifier and Sort & Match measure recognition.

This honest scoping matters for examiner credibility. Sort & Match is positioned as a recognition-builder, not a writing trainer.

### 2.3 Mitigation: post-success model-answer reveal

To partially bridge recognition → production, on successful completion of a round the student is shown the full worked example as a model answer with N/E/I components colour-coded inline. This is **earned, not gated**: the student must complete the activity first; the model is a reward, not a prerequisite.

### 2.4 v1 scope

Two worked examples in scope:
- **Six Vs of Big Data** (existing in Signal main)
- **Hospital Remote Access** (existing in Signal main)

Future worked examples follow the same content pattern once authored.

---

## 3. Design decisions and rationale

These decisions are locked from the spec conversation. Section 4 derives the user journey from them.

| # | Decision | Alternative considered | Rationale |
|---|---|---|---|
| 1 | **Decompose-first architecture.** No prose front-loaded; the interaction *is* the lesson. | "Hybrid" — prose collapsed but available on tap. | Hybrid keeps prose-on-tap as fallback, undermining the principle that students manipulate N·E·I rather than read about it. |
| 2 | **Post-success model-answer reveal.** | Pre-activity worked-example display. | Reward-not-gate preserves principle (1) while still surfacing prose for students who want to study a model answer. |
| 3 | **Narrative scenario delivered as icon-driven comic, not prose.** | Pure phrase-only activity; hand-illustrated comic; AI-generated character art. | Decompose-first still requires *some* scenario context for phrases to be meaningful. Comics carry scenario without prose; icon-driven sidesteps character-consistency problems and stays brand-consistent. |
| 4 | **Icon-driven illustration in Signal's existing aesthetic.** | Hand-illustrated, AI character art, photo-collage. | Brand-consistent (Orbitron / terminal / neon), no character-consistency problem, lowest sustainable production cost, examiner-credible (reads technical, not childish). |
| 5 | **Comic and phrase pool decoupled.** | Loosely linked (panel indicators) or tightly coupled (phrases-inside-panels). | Accessibility-graceful: extra support present for students who need scenario grounding, no friction for those who don't. Lowest build complexity. Tighter coupling deferred to v2. |
| 6 | **Whole sentences as phrase granularity.** | Clauses, noun phrases. | Decoupled architecture requires phrases to be self-contained enough to classify without comic context — whole sentences carry their own context; clauses and noun phrases don't. Closest to exam answer format. |

---

## 4. User journey

A T-Level Digital student opens Sort & Match for the first time:

1. **Entry.** Lands on the activity page (proposed route: `/content-areas/sort-and-match`). Sees a brief one-line framing: *"N(ame) the legislation, E(xplain) how it applies, I(mpact) on the situation. Drag each statement into the right category."* Plus a "Start" button. No prose worked example. No multi-step tutorial.
2. **Round start.** Activity loads one worked example. Top region: 4–6 icon-driven comic panels in a single horizontal strip showing the scenario (e.g. for Hospital Remote Access: a hospital glyph, a clinician-with-tablet glyph, an unsecured-network glyph, a data-exposure indicator). On mobile the strip wraps. Below: three buckets labelled **N**ame, **E**xplain, **I**mpact, colour-coded per Signal's existing convention (red / amber / green). To one side: a phrase pool of 5–8 whole-sentence draggable items extracted from the worked example.
3. **Drag.** Student drags a phrase into a bucket. On drop, immediate visual feedback (correct → green flash and persistent placement; incorrect → amber flash, snap-back to pool, brief one-line redirect of the form *"This is more about how the law applies than what it's called — try [E]xplain"* — informative but not a full explanation).
4. **Stuck mitigation.** After **3 failed attempts on a single phrase**, a stronger hint surfaces: the actual category the phrase belongs to plus a one-sentence reason. Student must still drag the phrase into the correct bucket to advance. Prevents permanent stuck states without introducing a skip path.
5. **Round progression.** Student continues until all phrases are placed correctly. The round insists on correctness; wrong placements do not auto-advance.
6. **Round completion.** On all phrases correctly placed: short success state. Then the **model-answer reveal**: the full worked example surfaces with N/E/I components colour-coded inline, so the student sees how the phrases fit together as a coherent answer.
7. **Continue.** "Next worked example" if another is available; "Return" if not. Persistence: per-attempt + per-session writes to Firestore (Section 7).

---

## 5. Content model

Each worked example is one content record. Comic panel count varies 4–6 per scenario (Six Vs maps naturally to 6, one per V; Hospital fits 4).

```json
{
  "id": "hospital-remote-access",
  "title": "Hospital Remote Access",
  "scenarioPanels": [
    { "id": "p1", "icon": "hospital", "caption": "Mid-sized NHS Trust" },
    { "id": "p2", "icon": "clinician-tablet", "caption": "Clinician accesses patient records remotely" },
    { "id": "p3", "icon": "unsecured-network", "caption": "Connection over an unsecured home network" },
    { "id": "p4", "icon": "data-exposure", "caption": "Patient data potentially exposed" }
  ],
  "phrases": [
    { "id": "ph1", "text": "This situation is governed by the Data Protection Act 2018 and the UK GDPR.", "category": "N" },
    { "id": "ph2", "text": "Personal health data is being processed by a clinician outside the hospital's secure network.", "category": "E" },
    { "id": "ph3", "text": "Without endpoint security, patient records may be intercepted by unauthorised parties, breaching the integrity and confidentiality principles.", "category": "I" }
    /* …5–8 total */
  ],
  "modelAnswer": "Full worked example as inline-tagged prose for the post-success reveal."
}
```

Content lives in `src/data/sort-and-match/scenarios.json`, parallel to Risk Classifier's `src/data/risk-classifier/scenarios.json`.

---

## 6. Interaction mechanics

### 6.1 Drag-and-drop library

`@dnd-kit/core` (modern React DnD library with strong touch and keyboard support out of the box). Selected over react-dnd (legacy) and native HTML5 drag-and-drop (manual touch handling required). Keeps Sort & Match React-native — no Phaser involvement; Phaser is reserved for canvas-driven game contexts like Risk Classifier.

### 6.2 Wrong-drop handling

Incorrect drop snaps back to phrase pool with brief amber flash and a one-line redirect. The redirect is informative but not a full explanation; the student must still find the correct bucket through their own reasoning.

After **3 failed attempts on a single phrase**, stuck mitigation kicks in: the activity surfaces a stronger hint stating the correct category and a one-sentence reason. Student must still place the phrase correctly to advance — the mitigation reveals the answer but does not bypass the action of classifying.

### 6.3 Feedback timing

Immediate per-drop. No batched "check answers" button. Per-drop feedback keeps the student in flow and prevents the all-wrong-at-end demoralisation pattern.

### 6.4 Keyboard accessibility (WCAG AA)

`@dnd-kit/core` provides a built-in keyboard sensor: phrases focusable with Tab, picked up with Space, moved between buckets with arrow keys, dropped with Space. Same scoring and feedback path as mouse / touch drag. No custom alternative interface required.

---

## 7. Persistence model

Mirrors Risk Classifier patterns:

- Path: `users/{uid}/data/sort-and-match/sessions/{sessionId}` and `…/attempts/{attemptId}`
- **Per-attempt write** at the moment of correct placement (each successful drag is its own attempt record); per-session write on round completion. Per-attempt granularity gives pilot-evaluation analytics meaningful breakdown of which phrases caused trouble; write volume is not a concern at pilot scale.
- `source: 'signal'` field on writes
- Module imports of Firebase (not `window.MSM_APP` — see firestore.ts pattern note in repo memory)

Owner-only security rules; same adversarial-test pattern as Risk Classifier (vitest + `@firebase/rules-unit-testing`). Unique `projectId` per test file (e.g. `"demo-signal-sort-match"`).

---

## 8. Visual specification

### 8.1 Comic panels

Icon-driven vector compositions in Signal's existing aesthetic:
- **Background:** Signal `--void` token (dark)
- **Accents:** `--green` neon for active/affirming; `--amber` for warning/incident
- **Typography:** Orbitron for panel captions; Share Tech Mono for any data/UI mockups within panels
- **Style:** Glyphs and stylised UI mockups (terminal windows, network diagrams, schematic representations) over photographic or character-driven art
- **Layout:** Single horizontal strip, 4–6 panels per scenario depending on content. On mobile (<768px) the strip wraps to two rows; panel size scales to fit width.

Icon vocabulary (proposed minimum-viable set, ~15 glyphs, to be developed as design-system investment before scenarios are authored):
- Buildings: hospital, server room, office, data centre
- Roles-as-glyphs: clinician, employee, attacker (no portraits)
- Network states: secure, unsecured, breached, encrypted
- Data states: at-rest, in-transit, exposed, encrypted
- Outcome indicators: warning, breach, compliance-pass

Panels render as inline SVG or styled React components — no raster asset pipeline needed for v1.

### 8.2 Buckets

Three labelled buckets, side-by-side on desktop, stacked on mobile:
- **N** (Name) — red token
- **E** (Explain) — amber token
- **I** (Impact) — green token

Colour mapping follows Signal Sprint 1 brief convention (Red=N, Amber=E, Green=I).

### 8.3 Phrase cards

Whole-sentence cards in the phrase pool. Sans-serif body (system stack), `--green` border, `--void` background. Drag-handle indicator on hover (and equivalent on focus for keyboard sensor).

### 8.4 Build approach

**Desktop-first, mobile-responsive.** Pilot context is most likely college desktops; build the desktop UX first using `@dnd-kit/core`, verify mobile responsiveness as a second pass. Mobile responsiveness is in scope for v1, not deferred — Signal's brand position includes accessibility — but desktop is the primary target for the pilot.

---

## 9. Routes and integration

- Page route: `/content-areas/sort-and-match` (parallel to `/content-areas/risk-classifier`)
- Page file: `src/pages/content-areas/sort-and-match.astro`
- React island: `src/components/sort-and-match/SortAndMatch.tsx`
- Linked from: existing content-areas hub

---

## 10. Build risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Icon vocabulary undersized for two scenarios | Medium | Medium | Build minimum-viable icon set (~15 glyphs) before any scenario authored. Treat as design-system investment, not per-scenario cost. |
| Phrase extraction quality insufficient under decoupled architecture | High | High | Two-pass content review protocol — see Section 11. Highest-priority risk. |
| Whole sentences too long for mobile drag UX | Medium | Medium | Limit sentence length to ~25 words; design phrase cards for two-line mobile display. |
| `@dnd-kit/core` learning curve / integration cost | Low | Medium | Library is well-documented; touch and keyboard sensors available out of the box; no custom event handling required for accessibility baseline. |
| Comic style drift between Six Vs and Hospital | Medium | Low | Use shared icon vocabulary; design Six Vs first (simpler scenario), then Hospital. |
| Recognition→production gap is wider than mitigation reveals can bridge | Medium | Low | Honest scoping in copy; defer to confidence-calibration adaptation in later sprints. |
| Stuck mitigation triggers too eagerly or too late | Low | Low | Threshold of 3 failed attempts is initial guess; tune based on pilot observation. |

---

## 11. Content review protocol

The decoupled architecture (decision 5 in Section 3) places significant load on phrase quality: each phrase must be classifiable into N, E, or I without reference to the comic. This protocol is a pre-flight check against the most common failure mode — phrases that depend on scenario context to be correctly classified.

### 11.1 Two-pass protocol

**Pass 1 — Author classification.** Chris drafts each phrase from the worked example, annotated with its intended category (N, E, or I) and a brief justification.

**Pass 2 — Blind classification.** A fresh chat session — no prior context, no comic, no scenario notes — receives each phrase one at a time and is asked: *"Is this Name, Explain, or Impact?"* Each answer is recorded.

### 11.2 Resolution

Phrases where Pass 1 and Pass 2 agree pass into `scenarios.json` for v1. Phrases where Pass 1 and Pass 2 disagree are rewritten until they pass — typically by adding context within the phrase itself (e.g. "the Data Protection Act 2018" rather than "the Act").

### 11.3 Threshold

If more than **20% of phrases** need rewriting on first pass for a given worked example, the extraction approach for that example needs rethinking — not just the specific phrases. The decoupling assumption may be incompatible with the source material as written, and the worked example may need restructuring before phrases can be cleanly extracted.

### 11.4 Honest limitation

A fresh Claude classifying phrases is **not equivalent** to a T-Level student classifying them. It is a proxy for "any reasonably N·E·I-literate cold reader." The real validation of phrase quality is the pilot itself; this protocol is a pre-flight check, not a substitute for student trial.

If Dave is available to sense-check a sample of phrases (~20%) ahead of the pilot, that materially strengthens this protocol and is consistent with his sense-check role on the project. If not, Claude-as-cold-reader is the realistic option.

### 11.5 Output

Per worked example:
- A `scenarios.json` content record (per content model in Section 5)
- A content-review log noting which phrases required rewriting and why; committed under `docs/sort-and-match-content-review/<example-id>.md`

The log is informal but versioned — it serves as a record for future content authoring and demonstrates the protocol was applied.

---

## 12. Out of scope for v1

Explicit deferrals (so scope doesn't drift):

- Tightly coupled phrase-panel layout (Section 3 decision 5, alternative considered)
- Confidence calibration per N/E/I component
- Quick-fire MCQ for N·E·I recognition
- More than two worked examples
- AI-generated character-driven panels
- Spaced repetition / Leitner across activities
- Multiplayer / classroom drill mode
- Sharing / export of completion state
- Difficulty levels or adaptive phrase selection
- AXIOM-7 marking of free-text answers (production training is a different track)

---

## 13. Resolved decisions and outstanding question

v0.1 of this spec listed seven open questions. Six are resolved; one remains tied to an external dependency.

### 13.1 Resolved (v0.2)

| # | Question | Resolution | Where in spec |
|---|---|---|---|
| 12.1 | Round retry mechanics | Insist on correctness; stuck mitigation after 3 failed attempts surfaces category + one-sentence reason; student still places phrase to advance. | Sections 4 step 4, 6.2 |
| 12.2 | Session persistence granularity | Per-attempt writes (each successful placement) plus per-session write on completion. Mirrors Risk Classifier. | Section 7 |
| 12.3 | First-time intro | One-line framing in activity intro panel; no separate tutorial. Copy: *"N(ame) the legislation, E(xplain) how it applies, I(mpact) on the situation. Drag each statement into the right category."* | Section 4 step 1 |
| 12.4 | Mobile-first or desktop-first build | Desktop-first, mobile-responsive. `@dnd-kit/core` for cross-input drag handling. | Sections 6.1, 8.4 |
| 12.5 | Comic panel count | Vary 4–6 per scenario; single horizontal strip layout, wraps on mobile. | Sections 4 step 2, 8.1 |
| 12.7 | Phrase content review process | Two-pass protocol: author classification then blind classification by a fresh Claude session; 20% rewrite threshold; Dave sense-check on ~20% sample if available. | Section 11 (new) |

### 13.2 Outstanding

- **12.6 — Pilot integration.** Depends on Dave's pilot date confirmation (which is itself currently TBD per memory). If Sort & Match ships before pilot start, the pre-registered evaluation plan should be amended to include its metrics. If after, no amendment needed. Tracked as a known unknown — not a build blocker.

---

## 14. Build estimate

The prior memory entry estimated 2–4 weeks for Sort & Match without comics. With comics in scope, revised rough estimate (focused-work hours, not elapsed time):

- Icon vocabulary design system: 3–5 days
- Phrase extraction + two-pass content review (Six Vs + Hospital): 2–3 days
- Comic panel composition (10–12 panels total): 3–5 days
- React component + drag interaction (`@dnd-kit/core`): 4–6 days
- Persistence + Firestore rules + adversarial tests: 2–3 days
- Post-success model-answer reveal component: 1–2 days
- Integration, route, page wiring: 1–2 days
- Polish, mobile responsive, stuck-mitigation tuning: 2–3 days

**Total: ~3–5 weeks of focused work.** Real elapsed time depends on review cycles and parallel work. Keyboard accessibility is folded into `@dnd-kit/core` adoption; no separate line item.

---

## 15. Build readiness checklist

- [x] All design decisions in Section 3 confirmed
- [x] All open questions in Section 13 resolved (12.1–12.5, 12.7)
- [ ] Phrase extraction pass on Six Vs + Hospital authored and reviewed (per Section 11)
- [ ] Icon vocabulary (~15 glyphs) designed and approved
- [ ] Pilot integration question (13.2 / 12.6) resolved when pilot date confirmed
- [ ] Spec v0.2 merged to main

When all unchecked items above are checked, build can begin.
