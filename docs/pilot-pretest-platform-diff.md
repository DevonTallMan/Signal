# Pilot Pre/Post Test — Pre-Dave-Forward Review

**Status: review document, prerequisite for forwarding `docs/pilot-pre-post-test.md` to Dave for sense-check.**
**Date: 2026-05-14.**
**Author: Claude.**
**Reviewer: Chris Morris.**

This document fulfils two pilot-logistics checks from the project backlog:

1. **Memory-versus-transfer diff.** Does the 10-question pre/post test in `docs/pilot-pre-post-test.md` overlap with the 12 platform scenarios in `src/data/risk-classifier/scenarios.json` to a degree that would compromise the test's measurement of transfer learning rather than memorisation?
2. **Time-budget realism check.** Does the pre/post test fit the time available in Dave's pilot session structure?

Both checks must pass before the pre/post test is forwarded to Dave for cohort-appropriate-language sense-check.

---

## Executive summary

**Memory-versus-transfer diff: PASS with two flagged residual concerns.** The 10 test questions do not duplicate any of the 12 platform scenarios at the specific-mechanism level. Acknowledged strand-level overlap exists on Equality (indirect discrimination tested in both Pre Q4, Post Q4, uklaw-003, uklaw-011) and is defensible. Two additional residual concerns are flagged for explicit review before forwarding.

**Time-budget realism check: PASS, with a correction to author note 3 in the pre/post test doc.** The 15-to-18-minute test administration fits comfortably within Dave's lesson around the 30-minute platform window. The author note worry about fitting in a 30-minute window is based on a misreading of the eval plan: the 30-minute window is *platform time*, not total lesson time. Recommend updating that note.

**Recommendation:** forward to Dave for sense-check after Chris confirms the two flagged residual concerns are acceptable, and after the author note 3 correction lands.

---

## 1. Memory-versus-transfer diff

### 1.1 Method

For each of the 10 test questions, I identified the closest platform scenario(s) by legislation tier and assessed overlap on three dimensions:

- **Strand-level overlap.** Same teaching strand (e.g. "indirect discrimination via apparently-neutral rule"). Defensible if the protected characteristic, proxy variable, or specific mechanism differs.
- **Mechanism-level overlap.** Same core failure mechanism (e.g. "personal data taken home on portable medium"). Higher concern; risks pattern-matching.
- **Near-duplicate.** Same specific scenario details. Would invalidate transfer measurement.

A near-duplicate would be a blocker. Mechanism-level overlap is acceptable only if the mark scheme requires students to identify the specific mechanism (not just the legislation). Strand-level overlap is the floor: every test question of the same legislation will share *something* with platform scenarios of that legislation.

### 1.2 Question-by-question diff

| Test question | Closest platform scenario(s) | Overlap level | Verdict |
|---|---|---|---|
| **Pre Q1** HR officer photographs CVs on personal phone | uklaw-001 (USB stick of customer list), uklaw-004 (email roll to personal Gmail) | Strand | Distinct: phone-photo medium ≠ USB stick ≠ Gmail. Same security-principle teaching point applied via different vector. Author note already flags. **Pass.** |
| **Pre Q2** Online retailer refuses 9-year deletion request | None | None | Tests DPA Article 17 (erasure). No platform scenario tests DPA rights; all three platform DPA scenarios (uklaw-001, uklaw-004, uklaw-009) test the security principle. **Pass.** |
| **Pre Q3** Warehouse worker uses supervisor's logged-in session | uklaw-002 (post-employment, stolen credentials), uklaw-005 (stale permission), uklaw-010 (password-cracking attempt) | Strand | All four test CMA Section 1 unauthorised access. The "logged-in session left unlocked" mechanism is distinct from any platform variant. **Pass.** |
| **Pre Q4** Council planning portal requires smartphone (age + indirect) | uklaw-003 (CV screening, age + indirect) | **Strand (acknowledged)** | Both test indirect age discrimination via apparently-neutral rule. Different sectoral context (council services vs recruitment), different proxy variable (smartphone vs graduate qualifications). Author flags as acknowledged strand-level overlap. **Pass with caveat.** |
| **Pre Q5** Indie games studio uses YouTube music in trailer (IP, no licence) | None on mechanism | None | All three platform IP scenarios (uklaw-006, uklaw-008, uklaw-012) test licence-terms-violation. Pre Q5 tests no-licence-at-all. Distinct sub-issue within copyright. **Pass.** |
| **Post Q1** Solicitor's clerk loses work bag on train | uklaw-001 (USB stick of customer list taken home) | **Mechanism (flagged)** | Both involve taking personal data home on a portable physical medium, with a security failure as the wrong. Specific medium differs (paper vs USB). See §1.3.1. |
| **Post Q2** Bank refuses to correct DOB record | None | None | Tests DPA Article 16 (rectification). No platform scenario tests rectification. **Pass.** |
| **Post Q3** Doctor's receptionist looks up ex-partner's records | uklaw-002, uklaw-005, uklaw-010 | Strand | All four test CMA Section 1. Post Q3's "authorised credentials, unauthorised purpose" mechanism is genuinely novel relative to the three platform CMA variants (none of which test the curiosity-snooping pattern). **Pass.** |
| **Post Q4** Logistics company shift allocation (sex + indirect) | uklaw-003 (age + indirect), uklaw-011 (race + indirect) | **Strand (acknowledged)** | Same indirect-discrimination pattern as Pre Q4. Author flags as acknowledged overlap. Different protected characteristic (sex) than uklaw-003 (age) and uklaw-011 (race + disability). **Pass with caveat.** |
| **Post Q5** Agency installs Photoshop on more machines than licensed | uklaw-008 (GPL violation), uklaw-012 (MIT attribution removal) | **Strand (flagged)** | All three test licence-terms-violation. Post Q5's "exceeded permitted install count" is distinct from "incompatible derivative work" and "removed attribution notice". Author note flags Pre Q5 distinction but does not explicitly flag overlap with platform IP. See §1.3.2. |

### 1.3 Flagged residual concerns

#### 1.3.1 Post Q1 vs uklaw-001 (mechanism-level overlap on physical-media loss)

Author note (line 119 of `docs/pilot-pre-post-test.md`): *"Distinct from Pre Q1 (transmission via personal email): this is loss of physical media. Same act, different mechanic. Tests that students recognise DPA applies regardless of medium (paper, electronic, USB)."*

The author distinguishes Post Q1 from **Pre Q1**, which is correct (phone-photo vs lost paper). But the closer comparison is **uklaw-001**, which is itself an "unencrypted USB stick taken home" scenario. Both Post Q1 and uklaw-001 share:

- The same teaching point (DPA security principle, Article 5(1)(f))
- The same mechanism class (portable physical medium taken outside the controlled environment)
- The same wrong-flavoured outcome (loss/exposure of personal data)

They differ in:

- Medium (paper bag vs USB stick)
- Trigger (lost on transport vs unencrypted retention)
- Data subject (clients vs customers)

**The risk:** a student who saw uklaw-001 during the pilot may pattern-match "physical medium + personal data taken home" without engaging with the specific security failure. If they answer Post Q1 correctly because they remember the pattern, not because they applied Article 5(1)(f), the test measures memorisation.

**Mitigation options:**

- **Accept the overlap.** The mark scheme requires identifying the security principle and explaining why the medium is a vector. Pattern-matching alone produces 1 mark (naming DPA) but not the 2 explanation marks. The 1-mark floor is acceptable.
- **Revise Post Q1** to a different DPA mechanism (e.g. unauthorised disclosure during a phone call, transmission via fax to wrong recipient). This breaks the physical-media pattern while staying within DPA security.
- **Revise uklaw-001** away from the "USB stick taken home" pattern. Out of scope for this pilot (would touch live platform content).

**Recommendation:** Chris decides. I'd accept the overlap; the mark scheme already requires the explanation step that defeats pattern-matching.

#### 1.3.2 Post Q5 vs uklaw-008 and uklaw-012 (strand-level overlap on licence-terms violation)

Author note (line 185) flags Post Q5 vs **Pre Q5** distinction (licence-violation vs no-licence-at-all). Does not flag platform IP scenarios.

uklaw-008 (GPL violation) and uklaw-012 (MIT attribution removal) both test licence-terms violation. Post Q5 also tests licence-terms violation (exceeded install count). All three share:

- The teaching point (licence terms govern use; violation = copyright infringement)
- The mechanism class (using licensed material outside permitted scope)

They differ in:

- Specific term violated (count vs copyleft vs attribution)
- Software domain (off-the-shelf creative tool vs library vs library)

**The risk:** smaller than Post Q1 vs uklaw-001 because the specific licence-term violated differs cleanly. A student who saw uklaw-008/012 may recognise the strand but still need to identify the count-based mechanism in Post Q5.

**Recommendation:** Accept. The strand overlap is unavoidable given that three out of three platform IP scenarios are licence-violation flavoured; testing licence violation in the post-test is inevitable to keep IP representation balanced. Document this in the test doc alongside the Equality strand acknowledgment.

### 1.4 Acknowledged strand-level overlap on Equality

The author already flags this in line 15 of `docs/pilot-pre-post-test.md`. Pre Q4, Post Q4, uklaw-003, uklaw-011 all test indirect discrimination via an apparently-neutral rule. Protected characteristic differs across all four (age, sex, age, race+disability). Defensible.

**No further action recommended on this overlap.**

---

## 2. Time-budget realism check

### 2.1 Author note 3 misreads the eval plan

`docs/pilot-pre-post-test.md` note 3 (line 197) frames the time concern as:

> "Time budget. The estimate above is 15-18 minutes for 5 questions × 3 marks of writing in a 30-minute window. That's tight. Realistic for your cohort, or should we cut to 4 questions per side?"

The 30-minute window referenced here is the pilot **platform-time window**, not the total lesson time. Per `docs/pilot-evaluation-plan.md` section 2.2 (line 34):

> "Session length: [...] 30 minutes of platform time per session, scheduled in the second half of Dave's Monday morning double-period."

The pre-test is administered "at the start of session one, before any platform use" (eval plan 3.2). The post-test is administered "at the end of session four, after the final platform session" (3.2). Both run in Dave's lesson time, **outside** the 30-minute platform window.

A UK FE Monday morning double-period is typically 90 to 100 minutes total. If 30 minutes is the platform half, the other half is roughly 45 to 50 minutes. The pre-test and post-test happen in those halves, not against the 30-minute platform timer.

### 2.2 Time budget against the correct window

5 questions × 3 marks each, with each question presenting a 2-to-3-sentence scenario plus a brief-explanation answer:

- **Reading:** 5 to 6 minutes total (estimate cited by author, plausible for 10 to 15 sentences)
- **Writing:** 9 to 12 minutes total (1.5 to 2.5 minutes per 3-mark explanation)
- **Admin overhead:** 3 to 5 minutes (paper distribution, instructions, collection)
- **Total:** roughly 17 to 23 minutes

Against a 45 to 50 minute non-platform-half of the double-period, this fits with substantial slack. Dave has time for the test plus normal teacher activities (register, brief lesson framing, post-test debrief) without cutting platform time.

### 2.3 Recommendations on author note 3

1. **Correct the misreading.** Update note 3 to clarify that the test happens in lesson time, not platform time, and re-frame the question to Dave as "is 17-23 minutes within the slot you can give us at the start of session 1 and the end of session 4?"
2. **Drop the "cut to 4 questions per side" suggestion.** Cutting to 4 sacrifices the legislation balance (2 DPA + 1 CMA + 1 Equality + 1 IP per side) for no time-budget reason. The 5-question structure is the right shape.
3. **Keep the question to Dave open.** He'll know whether 17 to 23 minutes is achievable for his specific cohort and whether the slot at start-of-session-1 conflicts with anything (register, late arrivals, technical setup).

This correction is a one-paragraph edit to `docs/pilot-pre-post-test.md` note 3. Not blocking; can land in a separate small PR alongside this review.

---

## 3. Final recommendation

**Forward `docs/pilot-pre-post-test.md` to Dave for sense-check after:**

1. Chris confirms the §1.3.1 overlap call (accept Post Q1 vs uklaw-001 overlap, or revise Post Q1).
2. Chris confirms the §1.3.2 overlap call (accept Post Q5 vs uklaw-008/012 overlap, or revise Post Q5).
3. Author note 3 correction lands per §2.3.

Once those resolve, the pre/post test is ready for Dave's cohort-appropriate-language read. Dave's input then feeds the final lock under the pre-registration audit trail (eval plan Section 8).

---

## Audit trail

Drafted 2026-05-14 as the deliverable for the "memory-vs-transfer diff" and "time-budget realism check" items in the pilot logistics backlog. Filling these checks is not a methodological change to the pre-registered evaluation plan and does not require re-agreement under Section 8 of `docs/pilot-evaluation-plan.md`.
