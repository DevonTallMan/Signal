# Risk Classifier — Technical Architecture

**Status**: Sprint 1, draft 1
**Scope**: EU AI Act Risk Classifier, as the first of four planned gamified modules
**Constraint reminder**: Rollback criterion in `docs/risk-classifier-rollback.md` binds this work

---

## Summary

A gamified learning module on Signal that teaches EU AI Act risk tier classification via a drag-to-classify interaction. Built as an Astro page with Phaser.js for the canvas-based scoring, animation, and mascot rendering. Persists to Firestore for both student progress and pilot instrumentation.

Target URL: `/risk-classifier`.

Follow-on classifiers (CMA, DUAA, IP) are out of scope for this build and only proceed if the rollback criterion is met.

---

## Key decisions

### 1. Phaser.js over PixiJS

**Decision**: Phaser.js 3.90+.

**Reasoning**. Both libraries can do this job. Phaser ships with higher-level scene management, an input system, and a physics layer — none of which we need, but its cost is bundle size we're already paying. Phaser's community around educational games is larger and the documentation for drag-and-drop and state machines is more tutorial-friendly. For a builder who is learning the tooling alongside shipping the feature, Phaser is the lower-risk choice. PixiJS would be leaner and would ship faster for a team already fluent in canvas APIs; that is not our situation.

**Trade-off accepted**. Phaser's bundle is ~900KB gzipped. For a single-purpose module this is acceptable. We lazy-load the Phaser bundle only on the `/risk-classifier` route so the rest of Signal is unaffected.

### 2. Astro page + React island + Phaser canvas

**Decision**. The route is an Astro page for SEO, SSR, and auth-guarding. Inside that page is a single React island (`<RiskClassifier client:only="react" />`) that mounts the Phaser canvas.

**Why `client:only` and not `client:load`**. Phaser hits `window` at import time and fails SSR. `client:only` skips SSR for that island. The rest of the page (frame, nav, intro copy) renders server-side normally.

**Why React wraps Phaser and not the other way around**. Signal's existing state (Firebase user, dashboard context) is already exposed to React components. Giving Phaser a React wrapper means the Phaser scene receives the user UID as a prop and writes to Firestore using the existing `firebase-config.js` pattern. Reimplementing that inside Phaser would duplicate authentication logic.

### 3. Firestore schema

```
users/{uid}/data/risk-classifier/
  sessions/{sessionId}
    startedAt: Timestamp
    completedAt: Timestamp | null
    totalScenarios: number
    score: number
    mode: "first-attempt" | "replay-wrong"

  attempts/{attemptId}
    sessionId: string
    scenarioId: string
    tierChosen: "minimal" | "limited" | "high" | "unacceptable"
    correctTier: string
    isCorrect: boolean
    timeToAnswerMs: number
    viewedReasoning: boolean
    attemptedAt: Timestamp
```

Two collections, not one. Sessions for the aggregate view (how many times has this student classified, what's their overall accuracy). Attempts for the per-scenario detail that the pilot evaluation depends on.

**Why not a single collection**. Nested arrays grow unboundedly and make querying specific scenarios (e.g. "which scenario do students get wrong most often") painful. Two flat collections keep each document small and queryable.

**Security rules**. Additive to existing rules. Student can read and write their own subtree only. Teachers read via the existing teacher-dashboard aggregation pattern, which reads from `users/*/data/risk-classifier/sessions` with a class-membership check.

### 4. Scenario content lives in JSON, not Keystatic

**Decision**. Scenarios live at `src/content/risk-classifier/scenarios.json`. Not a Keystatic schema.

**Reasoning**. Keystatic is appropriate for content that non-developers author regularly. Twelve scenarios authored once, with authorial precision required per scenario (correct tier, defensible reasoning, common-mistake explanation), is closer to configuration than to content. Editing JSON is faster for this volume. If the rollback criterion is met and we build three more classifiers, revisit whether Keystatic pays off at that point.

**Authoring flow**. Chris or Dave opens a PR editing `scenarios.json`. Preview deploys on Cloudflare branch preview. Review, merge, scenarios ship.

### 5. Drag-and-drop: Phaser's native input, not `@dnd-kit`

**Decision**. Phaser handles all drag-and-drop itself.

**Reasoning**. Mixing Phaser's input system with a React DOM drag library at the React-Phaser boundary creates two sources of truth for pointer events. Phaser's built-in drag works on mouse and touch out of the box and we get scene-relative coordinates for free.

**Accessibility note**. Phaser drag is not keyboard-accessible by default. We add a keyboard-mode fallback: arrow keys to move selection between tier zones, Enter to confirm. This is a documented sprint-four task and part of the accessibility non-negotiable.

### 6. Animation and audio

**Mascot**. Authored in Lottie (JSON animation format). Chris designs in a free tool (LottieFiles has a web-based editor, or Rive if preferred). Lottie renders via `lottie-web` inside Phaser as an HTML overlay positioned above the canvas. Not ideal but avoids re-authoring the mascot in Phaser's spritesheet format.

**Sound**. Howler.js for sprite-based audio (one audio file with multiple sound effects at known offsets, avoiding per-file HTTP overhead). Sounds are:
- Correct answer ding
- Wrong answer buzz
- Tier-locked-in click
- Session complete fanfare
- Optional ambient loop (mutable)

**Glitch shader**. CSS filter on the canvas container, not a WebGL shader. `filter: hue-rotate(180deg) contrast(1.5)` for 300ms on wrong answer is visually sufficient and avoids the complexity of a real shader.

### 7. File structure in the Signal repo

```
src/
  pages/
    risk-classifier.astro              # route
  components/
    RiskClassifier.jsx                  # React island (mounts Phaser)
    RiskClassifierIntro.astro          # pre-game framing (static)
  lib/
    risk-classifier/
      game.js                           # Phaser scene definition
      scenarios.js                      # scenario loader and shuffler
      firestore.js                      # session and attempt writers
      audio.js                          # Howler sprite config
      mascot.js                         # Lottie state machine
  content/
    risk-classifier/
      scenarios.json                    # the twelve scenarios
      mascot/
        idle.json                       # Lottie animation files
        correct.json
        wrong-mild.json
        wrong-bad.json
        victory.json
  styles/
    risk-classifier.css                 # module-scoped styling
```

### 8. Dependencies to install

```
npm install phaser howler
npm install --save-dev @types/howler
```

Lottie is already browser-native (`<lottie-player>`) — no install if using the web component. If using `lottie-web` directly, add `npm install lottie-web`.

No `@dnd-kit` (see decision 5).

---

## Performance budget

- First contentful paint on `/risk-classifier`: under 1.5s on a 4G connection
- Phaser bundle lazy-loaded: initial page load does not include Phaser until the student clicks "Start"
- Mobile Android mid-range device (e.g. Pixel 4a): 60fps during drag, 60fps during mascot animation

---

## Deployment notes

Deploys through existing Cloudflare Pages setup (`signal-dev-3bx.pages.dev` and branch previews). Build command and output unchanged from current Signal config.

Environment variables: none new. Firestore config is already available on the client via `firebase-config.js`.

---

## Sprint mapping

- **Sprint 1** (weeks 1-2): Scaffold. Deliverable is a `/risk-classifier` page that loads, shows four empty tier zones, and logs a session-start to Firestore. No real scenarios, no interaction, no animation.
- **Sprint 2** (weeks 3-4): Interaction and scoring. Twelve scenarios play through, drag works, feedback panels appear, Firestore writes are live, replay-wrong mode works.
- **Sprint 3** (weeks 5-7): Aesthetic layer. Mascot integrated, sounds integrated, glitch and particle effects integrated, Scoville-themed tier colours finalised.
- **Sprint 4** (week 8 + buffer): Accessibility, mobile polish, pilot assessment questions, Dave preview.

---

## Open questions

- **Mascot design**: Chris is designing himself. Needs two weeks budgeted inside sprint 3. If the mascot is blocking sprint 3 completion, fall back to a styled SVG glyph with state changes (see rollback criterion, process-based trigger).
- **Assessment questions**: Draft in sprint 4, reviewed by Dave. Five NEI questions on the EU AI Act, same set given to both arms of the A/B pilot.
- **Teacher dashboard view**: Out of scope for this build. Data is captured in Firestore; rendering it for Dave's class view happens post-pilot if the rollback criterion is met.
