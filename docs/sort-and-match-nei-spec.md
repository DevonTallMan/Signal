# Sort & Match for N·E·I — Specification v0.1

**Status:** Draft, awaiting review
**Date:** 8 May 2026
**Author:** Chris Morris (drafted with Claude)
**Related docs:** `docs/pilot-evaluation-plan.md`, `docs/pilot-pre-post-test.md`, `docs/sprint-2-scope.md`
**Replaces:** Sprint 3 A1 (N·E·I structural highlighting on worked example)

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

1. **Entry.** Lands on the activity page (proposed route: `/content-areas/sort-and-match`). Sees a brief intro line ("Sort each statement into Name, Explain, or Impact") and a "Start" button. No prose worked example. No tutorial.
2. **Round start.** Activity loads one worked example. Top region: 4–6 icon-driven comic panels showing the scenario (e.g. for Hospital Remote Access: a hospital glyph, a clinician-with-tablet glyph, an unsecured-network glyph, a data-exposure indicator). Below: three buckets labelled **N**ame, **E**xplain, **I**mpact, colour-coded per Signal's existing convention (red / amber / green). To one side: a phrase pool of 5–8 whole-sentence draggable items extracted from the worked example.
3. **Drag.** Student drags a phrase into a bucket. On drop, immediate visual feedback (correct → green flash and persistent placement; incorrect → amber flash, snap-back to pool, brief one-line redirect of the form "This is more about how the law applies than what it's called — try [E]xplain" — informative but not a full explanation).
4. **Round progression.** Student continues until all phrases are placed correctly. The round insists on correctness; wrong placements do not auto-advance.
5. **Round completion.** On all phrases correctly placed: short success state. Then the **model-answer reveal**: the full worked example surfaces with N/E/I components colour-coded inline, so the student sees how the phrases fit together as a coherent answer.
6. **Continue.** "Next worked example" if another is available; "Return" if not. Persistence: round completion written to Firestore (Section 7).

---

## 5. Content model

Each worked example is one content record:

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

### 6.1 Drag-and-drop

Native HTML5 drag-and-drop with React state for placement tracking. **No Phaser** for v1 — Risk Classifier uses Phaser because it's a canvas-driven game; Sort & Match is a DOM interaction and should stay React-native for simpler accessibility, mobile responsiveness, and component reuse.

### 6.2 Wrong-drop handling

Incorrect drop snaps back to phrase pool with brief amber flash and a one-line redirect. The redirect is informative but not a full explanation; the student must still find the correct bucket through their own reasoning.

### 6.3 Feedback timing

Immediate per-drop. No batched "check answers" button. Per-drop feedback keeps the student in flow and prevents the all-wrong-at-end demoralisation pattern.

### 6.4 Keyboard accessibility (WCAG AA)

Drag-and-drop must have a keyboard alternative for AA compliance. Proposed: each phrase has hidden keyboard-focusable "Move to N / E / I" buttons that activate when the phrase has focus. Same scoring and feedback path as drag.

---

## 7. Persistence model

Mirrors Risk Classifier patterns:

- Path: `users/{uid}/data/sort-and-match/sessions/{sessionId}` and `…/attempts/{attemptId}`
- `source: 'signal'` field on writes
- Module imports of Firebase (not `window.MSM_APP` — see firestore.ts pattern note in repo memory)
- Per-attempt write at the moment of correct placement; per-session write on round completion

Owner-only security rules; same adversarial-test pattern as Risk Classifier (vitest + `@firebase/rules-unit-testing`). Unique `projectId` per test file (e.g. `"demo-signal-sort-match"`).

---

## 8. Visual specification

### 8.1 Comic panels

Icon-driven vector compositions in Signal's existing aesthetic:
- **Background:** Signal `--void` token (dark)
- **Accents:** `--green` neon for active/affirming; `--amber` for warning/incident
- **Typography:** Orbitron for panel captions; Share Tech Mono for any data/UI mockups within panels
- **Style:** Glyphs and stylised UI mockups (terminal windows, network diagrams, schematic representations) over photographic or character-driven art

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

Whole-sentence cards in the phrase pool. Sans-serif body (system stack), `--green` border, `--void` background. Drag-handle indicator on hover.

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
| Phrase extraction quality insufficient under decoupled architecture | High | High | Phrase content review before any code: each phrase must be classifiable by an N·E·I-literate reader without seeing the comic. Two-pass review (Chris + structured self-check). |
| Whole sentences too long for mobile drag UX | Medium | Medium | Limit sentence length to ~25 words; design phrase cards for two-line mobile display. |
| Keyboard alternative slows build | Low | Medium | Implement alongside drag from start, not as retrofit. |
| Comic style drift between Six Vs and Hospital | Medium | Low | Use shared icon vocabulary; design Six Vs first (simpler scenario), then Hospital. |
| Recognition→production gap is wider than mitigation reveals can bridge | Medium | Low | Honest scoping in copy; defer to confidence-calibration adaptation in later sprints. |

---

## 11. Out of scope for v1

Explicit deferrals (so scope doesn't drift):

- Tightly coupled phrase-panel layout (Gate 1 option 3)
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

## 12. Open questions for review

These are intentionally not locked in v0.1 — flagged for Chris's review before build start:

1. **Round retry mechanics.** Section 6.2 snaps incorrect drops back. If a student fails repeatedly on one phrase, do we offer a "skip and reveal" option, or insist on completion? Current spec implies the latter.
2. **Session persistence granularity.** Per-attempt writes (every correct placement) or per-round only? Per-attempt gives richer pilot-evaluation analytics; per-round is simpler.
3. **First-time intro.** Section 4 step 1 says no tutorial. Is that defensible, or does N·E·I need a one-line definition surfaced for first-time users? Risk Classifier does not have one. Tools-for-Teaching first-run welcome was deferred per memory.
4. **Mobile-first or desktop-first build.** T-Level cohort device profile is mixed. Pilot cohort device profile unknown until Dave confirms.
5. **Comic panel count.** Section 4 says 4–6 per scenario. Lock at one number or vary by scenario complexity?
6. **Pilot integration.** Does Sort & Match ship before pilot start? Pilot date is now flexible. If yes, pre-registered evaluation plan should be amended to include Sort & Match metrics; if no, post-pilot ship is fine.
7. **Phrase content review process.** Section 10 risk row 2 says "two-pass review" without defining the protocol. Proposed: pass 1 = Chris reviews phrases against worked examples for N·E·I classification correctness; pass 2 = blind classification by an N·E·I-literate reader who hasn't seen the comic, to verify phrases are decoupled-classifiable. Confirm or revise.

---

## 13. Build estimate

The prior memory entry estimated 2–4 weeks for Sort & Match without comics. With comics in scope, revised rough estimate (focused-work hours, not elapsed time):

- Icon vocabulary design system: 3–5 days
- Phrase extraction + content review (Six Vs + Hospital): 2–3 days
- Comic panel composition (10–12 panels total): 3–5 days
- React component + drag interaction: 4–6 days
- Keyboard accessibility: 1–2 days
- Persistence + Firestore rules + adversarial tests: 2–3 days
- Post-success model-answer reveal component: 1–2 days
- Integration, route, page wiring: 1–2 days
- Polish, mobile responsive: 2–3 days

**Total: ~3–5 weeks of focused work.** Real elapsed time depends on review cycles and parallel work.

---

## 14. Review checklist before build

- [ ] All decisions in Section 3 confirmed
- [ ] Open questions in Section 12 answered
- [ ] Phrase extraction pass on Six Vs + Hospital reviewed and approved
- [ ] Icon vocabulary list approved
- [ ] Pilot integration question (12.6) decided
- [ ] Spec committed to `docs/sort-and-match-nei-spec.md` via PR
