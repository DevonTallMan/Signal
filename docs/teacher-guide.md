# Signal Teacher's Guide

**Audience:** T-Level Digital teachers using Signal with their cohort.
**Author:** Chris Morris, with drafting from Claude.
**Status:** draft for examiner review.
**First reader:** Dave Smith, Mid-Sussex College pilot.

This guide explains what Signal is, what it teaches, how to run a
session with your cohort, and what your role looks like during and
after a pilot. It is the document to keep open in another tab while
you are running the platform with students for the first time.

It does not assume you have used Signal before. It does assume you
teach T-Level Digital and are comfortable with the spec content,
exam paper structure, and the mark schemes.

---

## 1. What Signal is

Signal is a T-Level Digital study platform for students preparing for
the Core papers. Its central pedagogical claim is that two skills are
distinct and both need teaching:

- **Knowing the content** (what an Equality Act 2010 indirect-
  discrimination case is, what a CRM does, what a 4G mobile router is)
- **Writing answers that earn the marks the scheme awards**

Most revision platforms teach the first. Signal teaches both, with
disproportionate effort on the second.

The structural claim Signal rests on is the **Answer Arc: Name,
Explain, Impact**. Three components, applied in order, on every
extended-answer question. Students are taught to recognise these
components, sort phrases into them as practice, and write their own
answers around the same structure.

This is what your cohort sees when they sign in.

---

## 2. The Answer Arc, briefly

Every extended-answer question on Paper 1 and Paper 2 rewards the same
analytical movement.

- **Name.** Identify the concept the scenario calls for. Not describe.
  Not allude to. Name it. "A CRM system." "An array of records." "The
  Data Protection Act 2018."
- **Explain.** Show how the named concept fits the specific scenario.
  The Explain mark is for application, not definition. A textbook
  definition of the named concept earns zero Explain marks on a
  scenario question, however accurate.
- **Impact.** Develop the consequence to a concrete real-world outcome
  in the scenario's terms. What can the system now do? What would it
  cost not to do this?

The two failure modes Signal targets most often are:

1. **Missing Impact.** The student names a concept, explains the
   mechanism, and stops. Three marks earned where four were available.
   The most common pattern across both papers.
2. **Generic Explain.** The student writes a textbook definition where
   a scenario-tied explanation was required. The Explain mark is lost
   even though the explanation is correct.

The Method section of Signal contains worked examples demonstrating
both failure modes against real-shape questions. Students who read
the Method section before tackling Paper 1 or Paper 2 content arrive
at the activities already knowing what structure to aim for.

---

## 3. What's on the platform

When a student signs in at `signal-dev.pages.dev` (or your pilot
deployment URL), they land on a home page with three navigable areas.

### 3.1 The Method section (`/content-areas/method`)

The methodology library. Worked examples covering the Answer Arc with
inline colour-coding showing where each structural component lives
within a real student answer. The library currently contains:

- **M.1.1 Worked Examples: Data Structures Question** — a 4-mark
  question on choosing a data structure. Teaches Missing Impact.
- **M.2.1 Worked Examples: Naming versus Describing** — a 4-mark
  business-systems question. Teaches Describing without Naming.
- **M.3.1 Worked Examples: Defining versus Applying** — a 4-mark
  networking question. Teaches Generic Explain.

Each topic contains three student-answer variants (1/4, partial, 4/4)
with marker-style commentary. The full-marks answer demonstrates the
pattern the activities then drill.

### 3.2 The content areas (Paper 1, Paper 2)

Topic pages organised by spec content area, with explanations of the
concepts and assessment blocks for self-check.

### 3.3 The activities

Three interactive activity types:

- **Sort & Match** (`/content-areas/sort-and-match`). Single-dimension
  drag-and-drop. Students drag whole-sentence phrases into Name,
  Explain, or Impact buckets to demonstrate they can recognise each
  structural role. Used for concept-explanation and legislation-
  application questions where the analytical move is N·E·I in
  sequence.

- **Twin Tracks** (`/content-areas/twin-tracks`). Two-dimensional
  drag-and-drop for Discuss-style questions. Students drag phrases
  into a 6-cell grid: positive impact and negative impact across
  Introduce, Explain, and Develop. The shape comes from the T-Level
  Digital Core Paper 2 Discuss question structure, where balanced
  consideration of opposing impacts is the mark scheme expectation.

- **Risk Classifier** (`/content-areas/risk-classifier`). Tier-based
  classification of workplace digital scenarios into the four UK
  legislation tiers in Content Area 4.1 of the spec: Data Protection,
  Computer Misuse, Equality, Intellectual Property. Tests legislation
  recognition, the foundation skill for the Paper 1 legal-context
  questions.

All three activities log per-attempt data to Firestore. We can see
which scenarios students attempted, how many times they got each
right, and how long each session lasted.

---

## 4. Running a session

The pilot format is four consecutive weekly sessions, each containing
30 minutes of platform time scheduled within your normal Monday
double-period. The other half of the double-period is yours for the
pre/post test administration and any debrief or framing you want to
add.

### 4.1 Session 1

- **First half of double-period.** Administer the pre-test on paper.
  Five legislation-classification questions, 3 marks each, 15 marks
  total. Format matches Paper 1 exam style. See
  `docs/pilot-pre-post-test.md` for the questions and mark scheme.
  Estimated administration time: 17 to 23 minutes including paper
  distribution and collection.
- **Second half of double-period (30 min platform time).** Students
  sign in to Signal and work on the platform. For a first session,
  Risk Classifier is the natural starting point — it covers the
  legislation content the pre-test just measured, and the platform's
  feedback per-classification means students start building pattern
  recognition immediately.

### 4.2 Sessions 2 and 3

- **30 minutes of platform time each.** Students work on the platform
  at their own pace. Encourage them to explore the Method section if
  they haven't already, then return to the activities. The activities
  re-pick scenarios each session via a seeded picker, so students see
  varied content across sessions.

### 4.3 Session 4

- **First half (30 min platform time).** Final platform session. Some
  students may want to consolidate by re-running a familiar activity;
  others may want to push into new ones. Either is fine.
- **Second half.** Administer the post-test on paper. Five different
  legislation-classification questions, same format and mark scheme
  as the pre-test.

### 4.4 What the students see

A student's experience on each activity:

1. Sign in (one-time per session unless they've cleared cookies).
2. Land on the activity page. See a brief framing and an inline
   scenario comic strip.
3. Work through the scenario. For Sort & Match, drag phrases into
   buckets and click Check. For Twin Tracks, drag phrases into cells
   with immediate per-drop validation. For Risk Classifier, click
   the tier they think applies.
4. See feedback: a marker-style explanation on correct, a common-
   mistakes panel on incorrect.
5. Advance to the next scenario or, after the session-length scenarios
   are done, see a session summary.

The student never needs your help to navigate. If they hit a problem,
they'll tell you.

### 4.5 The review queue and the session-opener prompt

From Sprint 6 onwards, Signal tracks which drill cards each student has
already rated and brings those cards back on a spaced schedule: 1 day,
3 days, 7 days, 21 days, 60 days. The spacing follows the standard
Leitner pattern. A card the student rates correctly at each interval
advances through the boxes and graduates from the active queue after a
successful rating at the 60-day box.

There are three surfaces students may see related to this:

1. **A review-queue widget on the home page.** When the student has
   cards due, the home page shows a small panel above the content
   areas reading "N cards due" with a button linking to the review
   page. The widget is hidden when no cards are due.
2. **A soft session-opener prompt above the widget.** When the student
   has cards due AND has not dismissed the prompt within the previous
   12 hours, the home page also shows a banner asking "Start with N
   reviews before new content?" with two options: start the reviews,
   or dismiss and start with new content. Dismissing is recorded in
   the browser's localStorage and the prompt is suppressed for 12
   hours. The prompt is never mandatory; both choices remain available
   at all times.
3. **The `/review` page.** A dedicated page that pulls all due cards
   across all topics into one continuous review session, using the
   same cue / reveal / rate UX as the per-topic drill panels.

For your Year 1 pilot, students arrive at session 1 with empty review
queues. Cards enqueue during the first one or two sessions and start
coming due in sessions 2 to 4. The review queue is therefore a
late-pilot signal at best within the four-week window; its main
intended effect is at the 6-month mark, not the 4-week mark. This is
documented in the pre-registered evaluation plan as a known
measurement-integrity caveat.

Likely student questions and short answers:

- **"Do I have to do the reviews?"** No. The widget and prompt are
  optional. Skipping them does not affect access to new content.
- **"Why is it asking me to do reviews?"** Because you rated some
  drill cards last session, and the system spaces them out so you
  re-encounter them when re-encounter is most efficient.
- **"How long does it take?"** A typical review is one cue and a
  rating, roughly 10 to 20 seconds per card.
- **"What if I get it wrong?"** The card resets to the shortest
  interval and comes back sooner. Getting things wrong on review is
  the system working as intended.

If a student is confused or frustrated by the prompt, the right move
is to tell them to dismiss it ("Start with new content") and carry on.
The dismissal lasts 12 hours.

---

## 5. What the pilot measures, and what it does not

This section is honest about what the pilot can and cannot show. The
pre-registered evaluation plan (`docs/pilot-evaluation-plan.md`) is
the authoritative document; this is the readable summary.

### 5.1 What it measures

- **Engagement.** Completion rate per session. Time on task per
  scenario. Number of scenarios attempted. Return rate across sessions.
- **Pre-to-post performance.** Whether students score higher on the
  post-test than the pre-test, on five different unseen scenarios.
- **Qualitative feedback.** A short post-session survey for students
  and a written reflection from you.

### 5.2 What it does not measure

- **Causal learning gain from the platform.** The pilot has no control
  group. Any pre-to-post improvement may be due to your normal
  teaching during those weeks, due to novelty, due to the test format
  becoming familiar, or due to the platform. The data cannot
  distinguish these.
- **Educational impact versus alternative teaching methods.** The
  platform is not compared to paper practice, group discussion, or
  any other intervention.
- **Performance on cohorts other than yours.** Sample size, your
  teaching, and institutional context are all uncontrolled.

The pilot writeup is pre-committed to leading with these limits. We
will not retrospectively claim "the platform improved performance"
from data that cannot demonstrate causation.

---

## 6. What we need from you

### 6.1 Before the pilot starts

- Sense-check the pre/post test questions in
  `docs/pilot-pre-post-test.md` for cohort-appropriate language and
  fairness. The mark scheme cites specific Articles and Sections; if
  your teaching has not gone to that level of specificity, flag it and
  we'll adjust the scheme to credit higher-level descriptions.
- Confirm the pilot dates and the cohort year group (Year 1 or Year 2,
  and whether they have covered Content Area 4.1 in class). This drives
  whether the pre-test is calibrated as a baseline measure or as an
  introduction-effect measure.
- Confirm in writing that the pilot is going ahead. The audit-trail
  discipline of the evaluation plan requires written evidence of date
  and cohort confirmation before we mark placeholders as confirmed.

### 6.2 During the pilot

- Run sessions as described in Section 4.
- Administer the pre-test and post-test on paper.
- Mark the pre-test and post-test against the supplied mark scheme.
  We're aware this is non-trivial; the test is short by design.
- Note anything that surprises you about cohort engagement — high or
  low.

### 6.3 After the pilot

- Hand the marked pre-test and post-test scripts back to Chris with
  pseudonymous student IDs (no names; the Firestore data uses
  pseudonymous IDs too).
- Write a short reflection on what you observed across the four
  sessions. No prescribed format. A paragraph each on engagement,
  content quality, and anything you'd change for a wider rollout is
  ideal.

---

## 7. What to flag to Chris

During the pilot, please flag any of the following as they happen:

- **Content errors.** Anything in a scenario, model answer, or mark
  scheme that is wrong, misleading, or off for the cohort. The Risk
  Classifier scenarios in particular are author-generated and
  unreviewed by a qualified examiner; legitimate alternative
  classifications are possible on some.
- **Technical issues.** Anything that prevents a student from working
  with the platform. Login problems, broken pages, scenarios that fail
  to load.
- **Engagement patterns.** If a session collapses (students lose
  interest, finish in 5 minutes, refuse to engage), tell Chris. The
  pilot is feasibility-stage; that data is signal, not failure.
- **Anything you'd want changed for a wider rollout.** The pilot is
  the chance to surface issues before the platform is offered to
  other colleges.

Chris is contactable at the email you have. There is no fixed turnaround
expectation; flag as you go and we'll batch into a post-pilot debrief.

---

## 8. Brief glossary

- **Answer Arc.** The three-component structure of an extended exam
  answer: Name, Explain, Impact.
- **N·E·I.** Shorthand for the Answer Arc components. Used throughout
  the platform.
- **Method section.** The methodology library at
  `/content-areas/method`. Worked examples showing the Answer Arc in
  action.
- **Activity.** An interactive drill. Signal currently ships three:
  Sort & Match, Twin Tracks, Risk Classifier.
- **Scenario.** A short workplace digital situation a student
  classifies, sorts, or writes about. Each activity has multiple
  scenarios.
- **Pre-test / Post-test.** Paper-based 5-question assessments
  administered before and after the four platform sessions to give a
  performance reading. See `docs/pilot-pre-post-test.md`.
- **Pseudonymous ID.** A non-identifying student identifier used in
  Firestore data. Used so the pilot data can be linked to a specific
  student's pre/post scripts without exposing names.
- **Firestore.** The Google database Signal uses to record sessions
  and attempts. Owner-only access via Firebase security rules.

---

## 9. Honest caveats

- **Content has not been independently examiner-reviewed.** All
  scenarios, model answers, and mark schemes are author-generated.
  Content quality is a legitimate alternative explanation for any
  pilot result, positive or negative.
- **The pre-registered evaluation plan binds the writeup.** We cannot
  reframe the pilot's findings retrospectively. If engagement is low,
  the writeup says so. If pre-to-post performance is flat, the
  writeup says so.
- **Your cohort is your cohort.** Findings from one pilot do not
  generalise to other Year 1 or Year 2 T-Level Digital cohorts at
  other colleges. The pilot is a feasibility check on this specific
  group.

Thank you for hosting the pilot. The platform exists because teachers
like you were willing to try something new with their cohort before
it had been validated anywhere else.

---

## Audit trail

Drafted on 2026-05-14 by Claude as the deliverable for Phase 1 C3.
This guide is a working document for the pilot host and is subject to
revision based on Dave's sense-check before pilot deployment. Any
change after Dave's sign-off requires explicit re-agreement with the
pilot evaluation plan's Section 8 audit trail.
