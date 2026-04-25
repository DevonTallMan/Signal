# Sprint 2 Scope: Risk Classifier UI Build

**Status: pre-build scope document, agreed before Sprint 2 implementation begins.**
**Date of agreement: 24 April 2026.**
**Parties: Chris Morris (author), Claude (review partner).**

This document defines what Sprint 2 builds, in what order, with what exit criteria. It is a working artefact: changes during the sprint are logged in Section 8 with date and reason.

Cross-references:
- Pilot evaluation plan: `docs/pilot-evaluation-plan.md`
- Scenario content and caveat: `src/data/risk-classifier/`

---

## 1. Risk and timeline note (read first)

The pilot is scheduled to start on Monday 11 May 2026, pending Dave Smith's written confirmation. That is 16 days from the agreement date of this document.

Sprint 2 as scoped in this document includes seven increments covering Phaser interaction, mobile-responsive layout, multi-tenant Firestore security, a class-membership data model, and a teacher dashboard.

The author has stated that additional development time is available beyond standard project hours, on the basis of which the timeline is judged feasible by the author. The review partner judges the scope ambitious for the available window and accepts the author's assessment on the basis of stated additional capacity.

If Sprint 2 cannot ship by the pilot start date, three options apply, in priority order:
1. Cut Increments 6 and 7 (teacher dashboard and class-membership) and ship the core classifier on time. Dashboard work moves to Sprint 3.
2. Slip the pilot start date by one week (subject to Dave's confirmation that this remains within his pre-placement window).
3. Slip the pilot to a later term, requiring revisions to the pilot evaluation plan.

Cuts and slips are logged in Section 8.

---

## 2. Sprint goal

Build a working Risk Classifier UI that loads the twelve scenarios committed in PR #30, allows students to classify each into one of four legislation tiers, logs sessions and attempts to Firestore using the helpers from PR #29, and provides Dave with real-time visibility into his class's activity through a teacher dashboard. The build must be ready to deploy to the pilot cohort by [TO CONFIRM: Monday 11 May 2026, pending Dave's written confirmation].

---

## 3. Scope decisions

Six decisions agreed on 24 April 2026, plus an additional dashboard scope agreed during this drafting.

### 3.1 Interaction framework: Phaser
The Risk Classifier renders inside a Phaser scene mounted in an Astro page.

### 3.2 Mobile support: in scope
Phone, tablet, and desktop viewports all supported. Windows PCs are the primary target for the classroom (per cohort hardware confirmed by Dave).

### 3.3 Scenarios per session: 5, fixed
Across the four pilot sessions a student sees 20 scenarios with deliberate repetition from the pool of 12.

### 3.4 Scenario ordering: difficulty-progressive AND tier-balanced
Each session draws from a defined difficulty pool and ensures one scenario from each of the four tiers. Difficulty progresses across the four sessions.

### 3.5 Sprint exit criteria: as listed in Section 5

### 3.6 Build sequence: seven increments, each separately committable
Defined in Section 4.

### 3.7 Teacher dashboard: in scope
A real-time view for Dave covering his class's session attempts, completion, and performance. Requires a class-membership data model and a teacher-vs-student auth distinction. Detailed in Increments 6 and 7.

---

## 4. Build sequence (seven increments)

### Increment 1: Phaser scaffolding
- Add Phaser dependency to `package.json`
- Create page at `src/pages/risk-classifier.astro`
- Boot a Phaser scene that renders an empty placeholder
- Confirm the framework loads in the existing Astro build pipeline
- Confirm the page is accessible only when logged in

**Done when:** logged-in user navigates to `/risk-classifier` and sees an empty Phaser canvas without errors.

### Increment 2: Static scenario rendering
- Render one hardcoded scenario inside the Phaser scene
- Display scenario text, four tier buttons, basic layout
- Click handlers log to console only
- Establish mobile-responsive layout: viewport-based sizing, touch-target dimensions
- Visual styling consistent with Signal's design tokens

**Done when:** the page renders one full scenario on phone, tablet, and desktop, buttons respond visibly to clicks, no Firestore activity yet.

### Increment 3: Feedback panels
- Wire buttons to read scenarios.json properly
- On correct: render `examinerReasoning`
- On incorrect: render the matching `commonMistakes` entry for the chosen wrong tier
- Visual distinction between correct and incorrect feedback
- Continue button to advance

**Done when:** clicking any button produces the right feedback panel for any of the 12 scenarios. Tested manually against all 12.

### Increment 4: Firestore wiring
- Call `startSession` on session start
- Call `writeAttempt` on each classification
- Handle the unauthenticated case: classifier still works locally, no logging
- Verify Firestore writes by checking the database directly

**Done when:** a logged-in user completing one classification produces the expected Firestore documents.

### Increment 5: Multi-scenario session loop
- Implement difficulty-progressive, tier-balanced ordering
- Serve 5 scenarios per session
- Track session state across the 5
- Show end-of-session summary
- Call `completeSession` to mark done in Firestore

**Done when:** a logged-in user can complete a full 5-scenario session start to finish, with correct ordering, Firestore logging, and summary.

### Increment 6: Class-membership data model and teacher auth
- Design Firestore schema for classes: `classes/{classId}` documents containing teacher uid and student uids
- Implement teacher-vs-student auth distinction (custom claim, role field on user document, or equivalent — design choice in this increment)
- Update Signal's auth helpers to expose the role to client code
- Build a way to populate the class membership for Dave's pilot cohort (one-off admin action; not a self-service feature)
- Update Firestore security rules: a teacher can read attempts for students in their classes, and only those students. A student cannot read other students' attempts.
- Test the security rules adversarially: a teacher account cannot read students from a class they don't own, a student account cannot read other students' attempts.

**Done when:** a teacher account can authenticate, the system identifies it as teacher-role, the teacher's class membership is correctly populated for Dave's cohort, and Firestore security rules pass adversarial tests.

### Increment 7: Teacher dashboard UI
- New page at `/risk-classifier/teacher` accessible only to teacher-role accounts
- List of students in the teacher's class
- For each student: most recent session date, completion count, accuracy percentage
- Click into a student to see their full attempt history (scenarios attempted, tier chosen, correct/incorrect)
- Mobile-responsive layout (Dave may use a tablet during sessions)
- Visual styling consistent with Signal's design tokens

**Done when:** Dave logs in as teacher, sees his class roster, can drill into any student's attempt history, and the page works on his actual classroom device.

---

## 5. Sprint exit criteria

Sprint 2 is complete when all of the following are true:

- A page at `/risk-classifier` is accessible from Signal navigation when logged in
- Reads scenarios.json and presents one scenario at a time
- Four tier buttons render, click to classify, immediate visual feedback
- On correct: examiner reasoning panel shows
- On incorrect: matching common-mistakes entry shows
- Sessions and attempts log to Firestore using the helpers from PR #29
- 5 scenarios per session in difficulty-progressive, tier-balanced order
- Works on desktop, tablet, and mobile (Windows PC coverage essential for the classroom)
- Phaser is the interaction layer
- A class-membership data model exists in Firestore
- Teacher-vs-student auth distinction is implemented and tested
- Firestore security rules prevent cross-class and cross-student data access (verified adversarially)
- A teacher dashboard at `/risk-classifier/teacher` shows class roster, per-student summary, and per-student detail view
- The dashboard works on Dave's actual classroom device

Out of scope for Sprint 2:
- Animations beyond simple state transitions
- Sound or music
- Class leaderboards (student-visible)
- Social features (sharing, comparing scores)
- Adaptive difficulty within a session
- Authoring tools for scenarios
- Self-service teacher onboarding (Dave's class is set up by Chris manually)
- Multi-class teachers (Dave only has the one pilot class; multi-class support is post-pilot)

---

## 6. What this sprint does not do

This section is pre-registered so the sprint writeup cannot quietly omit it.

- It does not produce content. The 12 scenarios remain the content for the pilot.
- It does not implement the assessment questions. Pre/post assessment is paper-based, administered by Dave.
- It does not implement examiner review. Author-generated, unreviewed status of the scenarios remains.
- It does not implement self-service teacher signup. Teacher accounts are created and class memberships populated by Chris.
- It does not implement scenario authoring tools. Edits to scenarios.json remain git operations.

---

## 7. Risks

Four known risks, named pre-build.

**Risk 1. Phaser-Astro integration friction.**
Phaser is Canvas-based and Astro is SSG-first. Mounting Phaser scenes in Astro pages is documented but non-trivial. Increment 1 surfaces this early.

**Risk 2. Mobile responsiveness in Phaser.**
Phaser does not give responsive layout out of the box. Manual viewport scaling and dynamic layout code required. Increment 2 establishes the pattern.

**Risk 3. Firestore security rules for multi-tenant teacher access.**
This is the single highest-risk piece of Sprint 2. A misconfigured rule could expose all student data across all classes to any teacher account. Increment 6 includes adversarial testing as part of "done." If adversarial tests fail, the increment does not ship until they pass.

**Risk 4. Timeline.**
The author has stated additional development time is available. The review partner judges the seven-increment scope ambitious for 16 days. If Sprint 2 has not completed Increments 1-5 by Monday 4 May 2026, Increments 6 and 7 are cut and the dashboard work moves to Sprint 3, to protect the pilot start date.

---

## 8. Re-agreement log

Changes to this document during Sprint 2 are logged here.

*None logged yet.*