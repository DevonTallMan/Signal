# Signal Risk Classifier: Pilot Evaluation Plan

**Status: pre-registered plan, agreed before pilot data collection.**
**Date of agreement: 24 April 2026.**
**Parties: Chris Morris (author), Claude (review partner).**

This document is pre-registered. Its methodological commitments may not be altered after pilot data collection has begun without explicit written agreement between the parties. The point of pre-registration is to protect post-pilot analysis from the pressure to overclaim once the data is known.

Logistical details marked `[TO CONFIRM]` will be filled in as pilot timetabling resolves. Filling placeholders is not a methodological change. See Section 8 for the audit trail.

---

## 1. Purpose of the pilot

This pilot is designed to generate early evidence of student engagement with the Signal Risk Classifier, suitable for preliminary conversations with potential institutional buyers, FE college procurement leads, and education partners.

The pilot is **not** designed to produce evidence of educational impact versus alternative teaching methods. See Section 5 for the specific limits this places on any claims.

---

## 2. Pilot design

### 2.1 Cohort

- **Host:** Dave Smith, teaching his T-Level Digital class at Mid-Sussex College, Crawley campus.
- **Students:** Year 1 T-Level Digital cohort, 14 students on the register. Confirmed in writing by Dave Smith on 2026-05-14. The "expected 11 to 12 active per session" working assumption from the original plan is retained pending Dave's confirmation of typical session attendance; this is a separate question from the register count and was not part of the 2026-05-14 confirmation.
- **Consent and data handling:** Pseudonymous Firestore IDs are sufficient under Mid-Sussex College's Curriculum Delivery policy. Institutional agreement obtained. No PII collected. Confirmed by Chris Morris, 24 April 2026, on the basis of agreement with the college.

### 2.2 Timing and duration

- **Format:** Four consecutive weekly sessions.
- **Start date:** Monday 21 September 2026, with four consecutive weekly sessions running on Monday 21 September, Monday 28 September, Monday 5 October, and Monday 12 October 2026. Confirmed in writing by Dave Smith on 2026-05-14. (The original working assumption was Monday 11 May 2026; the slip from May to September 2026 is logged in Section 8.)
- **End date:** Monday 12 October 2026 (session 4).
- **Session length:** [Working assumption pending Dave's written confirmation: 30 minutes of platform time per session, scheduled in the second half of Dave's Monday morning double-period].

### 2.3 Content

- **Material:** The twelve UK Legislation Classifier scenarios committed to main on 24 April 2026 (`src/data/risk-classifier/scenarios.json`).
- **Review status of content:** Author-generated, unreviewed. See `src/data/risk-classifier/README.md` for the full content caveat. This caveat is a pre-registered component of this evaluation plan.

### 2.4 Platform access

- Students access the Risk Classifier through their existing Signal accounts. Sessions and classification attempts are logged to Firestore via the helpers committed in PR #29 (`startSession`, `writeAttempt`).

---

## 3. What gets measured

### 3.1 Engagement metrics (captured automatically via Firestore)

For each student, across the four-session window:

- **Completion rate.** Percentage of sessions started that are completed to the end.
- **Time-on-task per scenario.** Median seconds between scenario presentation and classification.
- **Scenarios attempted per session.** Count.
- **Return rate.** Whether students who began session one continued to sessions two, three, and four.

### 3.2 Performance metrics (pre/post assessment)

- **Pre-test:** Administered by Dave at the start of session one, before any platform use. Five legislation-classification questions on unseen scenarios. Format matches Paper 1 exam style. Marked to a documented mark scheme.
- **Post-test:** Administered at the end of session four, after the final platform session. Five different legislation-classification questions on unseen scenarios. Same format and mark scheme.
- **Assessment questions:** [Working assumption pending Dave's written confirmation: Claude drafts ten candidate questions, Chris reviews, Dave sense-checks for cohort-appropriate language before the pilot begins.]

### 3.3 Qualitative feedback

- **Short post-pilot survey:** Three to five questions asking students how they found the platform. Format and wording [TO CONFIRM]. Delivered at the end of session four, after the post-test.
- **Dave's observations:** A short written reflection from Dave covering what he saw in the classroom across the four sessions. No prescribed format.

---

## 4. How the results will be reported

### 4.1 Descriptive reporting only, no pre-set targets

Numbers will be reported with their context, not against pre-registered thresholds. This is a pre-registered commitment, made on the basis that:

- No baseline completion rate, time-on-task, or pre-platform performance exists for Dave's cohort.
- No control group is available.
- Relative or percentage-improvement thresholds are therefore unmeasurable.

Absolute thresholds would have been possible but would have been arbitrary. Honest descriptive reporting is the version that this pilot can actually support.

### 4.2 Writeup discipline

The pilot writeup will:

1. **Lead with scope and limits.** The first 150 words of any summary will state clearly that this is a feasibility pilot on engagement, not an impact evaluation.
2. **Pair every quantitative finding with its interpretation boundary.** Each metric will be accompanied by a statement of what it does and does not prove. Engagement data will not be presented as learning outcomes.
3. **Use non-causal language throughout.** The writeup will describe what students did, not what the platform caused them to do. "Students classified scenarios with increasing accuracy across the four sessions" is acceptable. "The platform improved student performance" is not.
4. **Include an explicit "What this pilot cannot tell you" section.** This section will list the specific claims a reader might want to make but which the data does not support.

These four commitments may not be relaxed in the writeup without explicit re-agreement between Chris and Claude, in writing, referencing this document.

### 4.3 Author bias declaration (not targets)

This section exists to surface author bias so it can be checked against actual results, not to set thresholds by another name. Section 4.1 and Section 4.2 are the primary lens through which results are reported. Section 4.3 is a bias check that sits under that lens.

Before the pilot runs, the author declares, for the record, what outcomes he is biased toward hoping to see:

- Completion rates that the author would privately consider acceptable for Dave's cohort, based on Dave's knowledge of their engagement with other practice tasks.
- Pre-to-post performance showing students classifying more correctly on the post-test than the pre-test, acknowledged as not attributable to the platform specifically in the absence of a control.
- Qualitative feedback indicating students found the platform tolerable or better.

These are declared biases, not pre-registered thresholds. Their purpose is transparency: if the actual results fall short of what the author privately hoped for, the writeup will say so. If the actual results exceed what the author privately hoped for, the writeup will say so. Either way, the reader can see where author expectation sat before the data arrived.

Any attempt to retrospectively reframe these biases as "what was predicted" or "what was targeted" violates this section's intent and is a breach of the pre-registered plan.

---

## 5. What this pilot cannot tell you

This section is pre-registered so that the writeup cannot quietly omit it.

- **It cannot tell you whether the platform improves learning outcomes compared to paper practice, normal teaching, or no intervention.** No control group was captured.
- **It cannot tell you whether improvements from pre-test to post-test would have happened anyway through normal teaching.** Same reason.
- **It cannot tell you how the platform performs with cohorts other than Dave's class.** Sample size, institutional context, and teacher effects are all uncontrolled.
- **It cannot tell you whether the content is pedagogically sound.** The scenarios are author-generated and not independently reviewed by a qualified examiner. Content quality is a legitimate alternative explanation for any result, positive or negative.
- **It cannot tell you whether engagement patterns would persist beyond four sessions.** Novelty effects are known in gamified interfaces.
- **It cannot tell you whether the post-test performance reflects mastery of the legislation framework or memory of specific scenarios seen during the pilot.** The pre- and post-tests use unseen scenarios to mitigate this, but memory effects cannot be fully ruled out.

Any claim made in the writeup or in subsequent communications that exceeds the data listed in Section 3 violates this pre-registered plan.

---

## 6. Roles and commitments

- **Chris Morris:** Runs the pilot day-to-day with Dave, writes up the findings, is responsible for maintaining the writeup discipline in Section 4.2.
- **Dave Smith:** Hosts the four sessions, administers pre- and post-tests, provides a written reflection.
- **Claude:** Acts as review partner for the writeup, flags any overclaiming, holds the author to the commitments in this document.

---

## 7. What happens after the pilot

Three possible outcomes and the response each triggers. Triggers are qualitative, consistent with the no-thresholds stance in Section 4.1.

1. **Engagement and performance both read as encouraging in descriptive terms.** Writeup produced within the Section 4.2 discipline. Used as conversation-opener for institutional buyer discussions. A second, more rigorous pilot is scoped (with control group and examiner-reviewed content) as the path to any impact claims.

2. **Engagement or performance ambiguous in descriptive terms.** Writeup produced honestly noting the ambiguity. The pre-registered content caveat (author-generated, unreviewed) is one legitimate alternative explanation; novelty effects, cohort specifics, and pilot-size limits are others. Decision point: commission examiner review of content and run a second pilot, or reconsider aspects of the mechanic before further investment.

3. **Engagement, pre-to-post performance, or qualitative feedback lead the author to doubt whether the mechanic, the content, or the fit with the cohort is viable. Pivot Review.** The author, in conversation with Claude as review partner and Dave as teaching partner, determines whether the viable path forward is: a revised mechanic, a revised content direction, a different cohort or institutional partner, or discontinuation of the Risk Classifier as a Signal feature. The outcome of Pivot Review is documented in writing and attached to this plan as an addendum before any further build.

---

## 8. Re-agreement log

Methodological changes to this document after the pilot has begun require explicit written re-agreement between Chris and Claude. Each such change is logged here with date, parties, and reason.

Filling in `[TO CONFIRM]` placeholders is not a methodological change and does not require re-agreement. Each fill is logged below with date and filler, to maintain audit trail integrity.

### Placeholder fills

**24 April 2026, Chris Morris.** Filled the following placeholders:

- Section 2.1 institution name: Mid-Sussex College, Crawley campus. A-status, confirmed by Chris on the basis of institutional agreement obtained.
- Section 2.1 consent and data handling: Pseudonymous Firestore IDs sufficient under college Curriculum Delivery policy, institutional agreement obtained. A-status, confirmed by Chris.
- Section 2.1 cohort size: 14 students with 11 to 12 expected active per session. B-status, working assumption pending Dave Smith's written confirmation.
- Section 2.2 start date: Monday 11 May 2026. B-status, working assumption pending Dave's written confirmation.
- Section 2.2 session length: 30 minutes per session in Monday morning double-period. B-status, working assumption pending Dave's written confirmation.
- Section 3.2 assessment question drafting: Claude drafts, Chris reviews, Dave sense-checks. B-status, working assumption pending Dave's written confirmation.

The four B-status entries will be upgraded to A-status when Dave confirms in writing. Forwarded confirmation will be appended to this log when received.

**2026-05-14, Chris Morris.** Dave Smith confirmed three items in writing. Status upgrades:

- Section 2.1 cohort year group and size: **Year 1 T-Level Digital cohort, 14 students on the register**. Upgraded from B-status to A-status. The "expected 11 to 12 active per session" sub-assumption from the original 24 April fill stays B-status; it was not separately confirmed in the 2026-05-14 reply.
- Section 2.2 start date: **Monday 21 September 2026**, with four consecutive weekly sessions running on 21 September, 28 September, 5 October, and 12 October 2026. Upgraded from B-status to A-status. This is a slip from the original Monday 11 May 2026 working assumption; the slip is methodological context, not a methodological change to the evaluation plan itself.
- Section 2.2 session length: **stays B-status**. The 30-minute platform-time, second-half-of-double-period assumption was not part of the 2026-05-14 confirmation.
- Section 3.2 assessment question sense-check: **stays B-status**. Dave has not yet sense-checked the pre/post test (`docs/pilot-pre-post-test.md`).

Evidence: Dave's written reply forwarded by Chris in the chat session of 2026-05-14. Verbatim text in the commit message of the PR that landed this update.

**Methodological flag raised in the 2026-05-14 confirmation, not yet resolved.** Dave's confirmation of a Year 1 cohort is methodologically significant. The original evaluation plan's measurement framing assumes a cohort with at least some prior teaching on Content Area 4.1 (Legislation), where the platform acts as reinforcement. A Year 1 cohort entering September 2026 will not yet have completed CA 4.1 in lessons, so the platform may act as introduction rather than reinforcement. This affects:

- Pre-test floor effect (naive cohort scores near zero)
- Pre/post delta interpretation (introduction-effect vs reinforcement-effect framing)
- Pre/post test mark scheme calibration (current scheme credits specific Article and Section citations that Year 1s would not be expected to know)

A specific follow-up question was sent to Dave on 2026-05-14 asking which of CA 4.1's four legislation areas the Year 1 cohort will have covered in lessons before the pilot starts. When that answer arrives, a follow-up Section 8 entry will document whether a methodological re-agreement is needed and what the reframed measurement claim says.

### Methodological changes

*None logged yet. The 2026-05-14 Year 1 confirmation raises a candidate for methodological re-agreement (introduction-effect vs reinforcement-effect framing) but the trigger for that re-agreement is Dave's CA 4.1 prior-teaching answer, not yet received.*