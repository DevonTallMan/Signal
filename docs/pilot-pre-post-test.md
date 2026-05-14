# Signal Risk Classifier: Pilot Pre/Post Assessment

**Status: locked for pilot deployment 2026-05-14.**
**Drafted: 7 May 2026.**
**Mark scheme recalibrated: 2026-05-14 (in light of Dave's CA 4.1 confirmation).**
**Sense-check by Dave: complete, 2026-05-14. Dave's reply verbatim: "Doc reads fine".**
**Author: Claude.**
**Reviewer: Chris Morris.**
**Sense-check: Dave Smith.**

Dave's "doc reads fine" reply was the conclusion of the sense-check process pre-registered in Section 3.2 of `docs/pilot-evaluation-plan.md`. In agreeing to the doc without modifications, Dave implicitly accepted the indirect-discrimination questions (Pre Q4 and Post Q4) as drafted, meaning the alternative offered in note 5 below (replace with simpler direct-discrimination questions) was declined in favour of accepting floor scores on that tier as a documented pilot limit. Any subsequent modification to the questions or mark schemes from this point requires explicit re-agreement under Section 8 of the evaluation plan.

This document provides the ten candidate assessment questions called for by Section 3.2 of the pre-registered Pilot Evaluation Plan (`docs/pilot-evaluation-plan.md`). Five questions form the pre-test, administered before any platform use; five form the post-test, administered after the final platform session.

The pre/post split is matched on legislation distribution (2 DPA + 1 CMA + 1 Equality + 1 IP per test) and on difficulty profile (3 clean + 2 grey per test, where the grey items are the second DPA question and the Equality question). Both tests use the same scoring framework (3 marks per question, 15 marks total) so pre/post results are directly comparable.

All ten scenarios are distinct from the twelve platform scenarios in `src/data/risk-classifier/scenarios.json`, in line with the "unseen scenarios" requirement of Section 3.2.

**Mark scheme calibration (recalibrated 2026-05-14):** Dave Smith confirmed on 2026-05-14 that the Year 1 pilot cohort has "DPA plus some patchy prior exposure on one or two strands, but not secure survey-level coverage across all four" of CA 4.1. The mark scheme has been recalibrated to reflect this partial-prior-exposure baseline, in line with the methodological re-agreement logged in `docs/pilot-evaluation-plan.md` Section 8.

The recalibration shape, applied uniformly across all ten questions:

- **The Name mark (1 of 3 per question) stays demanding.** The student must name the Act. Plain-English equivalents are accepted (Data Protection Act / UK GDPR, Computer Misuse Act, Equality Act, copyright law / Copyright Designs and Patents Act).
- **The Explanation marks (2 of 3 per question) are recalibrated.** Specific Article and Section citations are NOT required for full marks. Full marks are awarded for accurate descriptions of the principle engaged in plain English, with scenario tie-back. The Article and Section numbers are retained in the mark scheme as informational context for the marker, not as required citations.

The two Equality questions (Pre Q4 and Post Q4) are flagged separately in note 5 to Dave at the bottom of this document; the indirect-vs-direct discrimination concept may not have been taught explicitly to a partial-prior-exposure Year 1 cohort, which makes those questions structurally harder than the other tiers.

**Strand-level overlap on Equality:** both Pre Q4 and Post Q4 test indirect discrimination, as do platform scenarios uklaw-003 and uklaw-011. The protected characteristic, proxy variable, and sectoral context differ across all four. The recalibrated mark scheme credits recognition of the discriminatory mechanism (apparently-neutral rule producing unequal outcomes by protected characteristic) without requiring the technical "indirect discrimination" term or Section 19 citation, so the strand-level overlap is less load-bearing than in the original draft. Acknowledged as a residual concern.

**Content caveat:** same as the platform scenarios — author-generated, unreviewed by a qualified examiner. See `docs/pilot-evaluation-plan.md` Section 2.3 for the full caveat. This document inherits that caveat and is itself subject to Dave's sense-check before deployment.

---

## Pre-test (5 questions, 15 marks total)

### Q1 [3 marks] · Data Protection Act / UK GDPR · clean

**Scenario:** An HR officer at a manufacturing company photographs the printed pile of candidate CVs on her desk using her personal phone so she can review them at home that evening. The CVs include candidates' names, contact details, and previous employers.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme (recalibrated 2026-05-14):**

- **1 mark** for naming Data Protection Act 2018 / UK GDPR.
- **Up to 2 marks** for the explanation, which should describe in plain English: (a) personal data being captured on an uncontrolled personal device outside the workplace; (b) why this is a security or safeguarding failure on the employer's part. Specific citation of Article 5(1)(f) NOT required.
- Award 1 explanation mark for answers that name security/storage concerns but do not connect them to a duty on the employer. Award 0 for explanations that just describe the scenario.
- *Informational context for marker (not required from student):* Article 5(1)(f) UK GDPR, security of processing.

**Author note (for Dave's sense-check):** Tests recognition of a less common DPA breach pattern: photographing personal data on a personal device. The wrong is the transfer of personal data onto an uncontrolled device, regardless of whether the photos are subsequently shared, deleted, or backed up. Distinct in mechanic from platform scenarios uklaw-001 (USB stick) and uklaw-004 (request to email roll to personal Gmail), both of which test the same security principle via different routes.

---

### Q2 [3 marks] · Data Protection Act / UK GDPR · grey

**Scenario:** An online clothing retailer keeps every customer's order history on file indefinitely. A customer who has not ordered anything for nine years emails to ask for her records to be deleted. The retailer refuses, telling her the records are "useful for marketing in case you come back."

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme (recalibrated 2026-05-14):**

- **1 mark** for naming Data Protection Act 2018 / UK GDPR.
- **Up to 2 marks** for the explanation, which should describe in plain English: (a) a right to have personal data deleted/erased when no longer needed; (b) why "useful in case you come back" is not a recognised reason to refuse, especially after nine years. Specific citation of Article 17 NOT required; "the right to be deleted" or "the right to have data removed" earns full marks if connected to the scenario.
- Award 1 explanation mark for answers that mention deletion rights but do not address why the retailer's marketing-purpose reason fails.
- *Informational context for marker (not required from student):* Article 17 UK GDPR (right to erasure); Article 21 (right to object to direct marketing).

**Author note:** Grey case. Students may pick "no Act applies because the retailer has a business reason." The teaching point is that lawful bases for refusing erasure must be specific and recognised under UK GDPR; "we want to keep the data" is not one of them. Tests whether students know DPA contains rights as well as security obligations.

---

### Q3 [3 marks] · Computer Misuse Act 1990 · clean

**Scenario:** A warehouse worker discovers that her supervisor has stepped away and left his workstation logged in. While the supervisor is on his break, the worker uses the logged-in session to open the staff bonus spreadsheet, which is restricted to managers. She does not download or change anything.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme (recalibrated 2026-05-14):**

- **1 mark** for naming Computer Misuse Act 1990.
- **Up to 2 marks** for the explanation, which should describe in plain English: (a) the worker had no authority to view the staff bonus spreadsheet; (b) accessing it through the supervisor's logged-in session is still unauthorised even though no technical bypass was needed. Specific citation of Section 1 NOT required.
- Award 1 explanation mark for answers that note "she didn't have permission" without explaining why the supervisor's logged-in state doesn't grant authorisation.
- *Informational context for marker (not required from student):* Section 1 CMA 1990 (unauthorised access to computer material).

**Author note:** Clean Section 1 CMA case. Common student error: thinking the offence requires "hacking" or technical bypass. The teaching point is that Section 1 covers any unauthorised access, including via someone else's logged-in session.

---

### Q4 [3 marks] · Equality Act 2010 · grey

**Scenario:** A council redesigns its planning portal so that all objections to planning applications must now be submitted through a new smartphone app. A long-term elderly resident, who has used the previous web form for years to make objections, does not own a smartphone. When she contacts the council, she is told there is no other route to submit her objection.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme (recalibrated 2026-05-14):**

- **1 mark** for naming Equality Act 2010.
- **Up to 2 marks** for the explanation, which should describe in plain English: (a) the smartphone-only requirement disadvantages older people who are less likely to own smartphones; (b) age is a protected characteristic, so the rule produces an unequal outcome on the basis of age even though the rule itself is neutral. Specific citation of Section 19, the term "indirect discrimination", or Section 5 NOT required. Recognition that the apparently-neutral rule has an unequal effect by age earns full marks.
- Award 1 explanation mark for answers that mention "discrimination" or "unfair on older people" but do not connect smartphone non-ownership to age as a protected characteristic. Award 1 explanation mark for answers focused on disability/reasonable adjustments — partly right, since "barrier to access" is the right logic, but the scenario doesn't establish a disability.
- *Informational context for marker (not required from student):* Section 19 Equality Act 2010 (indirect discrimination); age protected under Section 5.

**Author note:** Clean indirect discrimination case on age. Students may want to invoke disability (because the resident is "elderly"), but the scenario doesn't establish a disability — only smartphone non-ownership, which correlates with age. The recalibrated mark scheme credits recognition of the discriminatory mechanism without requiring the indirect-vs-direct technical distinction.

**Difficulty:** Grey, not clean. The question requires students to recognise that smartphone non-ownership is a proxy for age, which is a sociological inference rather than a fact in the scenario. If indirect discrimination has not been taught explicitly, this question is closer to edge than grey — even with the recalibration. See note 5 to Dave.

---

### Q5 [3 marks] · Intellectual Property · clean

**Scenario:** A small indie games studio is making a trailer for its new game. The team finds a popular instrumental music track on YouTube and embeds it directly in the trailer, which they then upload to their own social media channels and YouTube channel. They do not contact the track's composer or pay any licence fee.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme (recalibrated 2026-05-14):**

- **1 mark** for naming the copyright framework. Acceptable: "copyright law", "Copyright, Designs and Patents Act 1988", or "copyright" with scenario tie-back.
- **Up to 2 marks** for the explanation, which should describe in plain English: (a) the music track is copyrighted; (b) finding the track on YouTube does not grant a licence to reuse it in another work. Specific citation of the CDPA 1988 NOT required for the explanation marks.
- Award 1 explanation mark for answers that mention "copyright" without explaining that public availability is not a licence.
- *Informational context for marker (not required from student):* Copyright, Designs and Patents Act 1988.

**Author note:** Clean copyright infringement. Common student misconception: "if it's free to listen to on YouTube, it's free to use." The teaching point is that public availability is not a licence.

---

## Post-test (5 questions, 15 marks total)

### Q1 [3 marks] · Data Protection Act / UK GDPR · clean

**Scenario:** A solicitor's clerk takes a printed list of clients' names, addresses, and case numbers home in her work bag so she can prepare for a meeting the following morning. She loses the bag on the train and is unable to recover it.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme (recalibrated 2026-05-14):**

- **1 mark** for naming Data Protection Act 2018 / UK GDPR.
- **Up to 2 marks** for the explanation, which should describe in plain English: (a) personal data has been lost outside the firm's secure environment; (b) this is a security failure that may trigger the firm's obligation to report the breach. Specific citation of Articles 5(1)(f), 33, or 34 NOT required.
- Award 1 explanation mark for answers that recognise "data loss" without identifying the security/reporting obligation it engages.
- *Informational context for marker (not required from student):* Article 5(1)(f) UK GDPR (security of processing); Articles 33 and 34 (breach notification).

**Author note:** Distinct from Pre Q1 (transmission via personal email): this is loss of physical media. Same act, different mechanic. Tests that students recognise DPA applies regardless of medium (paper, electronic, USB).

---

### Q2 [3 marks] · Data Protection Act / UK GDPR · grey

**Scenario:** A bank's customer-records system has recorded a customer's date of birth incorrectly, which is causing him repeated problems passing age verification on the bank's online portal. He emails customer services with a scan of his passport and asks the bank to correct the error. The bank replies that "our records were imported from your original application and we cannot edit them."

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme (recalibrated 2026-05-14):**

- **1 mark** for naming Data Protection Act 2018 / UK GDPR.
- **Up to 2 marks** for the explanation, which should describe in plain English: (a) a right to have inaccurate personal data corrected; (b) why "we can't edit our records" is not a valid reason to refuse when the customer has supplied evidence. Specific citation of Article 16 NOT required; "the right to have data corrected" or "the right to fix incorrect personal data" earns full marks if connected to the scenario.
- Award 1 explanation mark for answers that mention correction rights but do not address why the bank's technical-limit excuse fails.
- *Informational context for marker (not required from student):* Article 16 UK GDPR (right to rectification).

**Author note:** Grey case matched to Pre Q2 in difficulty. Single concept (rectification) parallel to Pre Q2's single concept (erasure). Tests that students recognise DPA contains correction rights as well as deletion rights, and that "the system won't let us" is not a lawful basis to refuse.

---

### Q3 [3 marks] · Computer Misuse Act 1990 · clean

**Scenario:** A receptionist at a doctor's surgery has access to the patient records system as part of her job, which involves checking patients in and booking appointments. Curious about a recent argument with her ex-partner, she logs in and reads through his medical history.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme (recalibrated 2026-05-14):**

- **1 mark** for naming Computer Misuse Act 1990.
- **Up to 2 marks** for the explanation, which should describe in plain English: (a) her authorisation to use the patient records system is bound to her work purposes (check-in and booking); (b) accessing records out of personal curiosity is outside that purpose and therefore unauthorised, even though the system technically permits her to do so. Specific citation of Section 1 NOT required.
- Award 1 explanation mark for answers that recognise "she shouldn't be looking up his records" without distinguishing between technical access and authorised purpose.
- *Informational context for marker (not required from student):* Section 1 CMA 1990 (unauthorised access to computer material).

**Author note:** Clean Section 1 CMA case based on a canonical pattern in UK case law (NHS curiosity-snooping prosecutions). Distinct from Pre Q3 (warehouse worker via supervisor's session): there the access uses someone else's session; here the access uses her own credentials but for a purpose outside what was authorised. Distinct in mechanic from platform scenarios uklaw-002 (post-employment, stolen credentials), uklaw-005 (stale permission), and uklaw-010 (external attack).

---

### Q4 [3 marks] · Equality Act 2010 · grey

**Scenario:** A logistics company introduces a new automated shift-allocation system. The system schedules all overnight shifts, which carry a higher hourly rate, for drivers who indicated "fully flexible availability" on their application form. After six months, a manager notices that women drivers, who on average had less flexibility because of caring responsibilities, are concentrated in the lower-paid daytime shifts.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme (recalibrated 2026-05-14):**

- **1 mark** for naming Equality Act 2010.
- **Up to 2 marks** for the explanation, which should describe in plain English: (a) the "fully flexible availability" rule disadvantages women who have caring responsibilities; (b) sex is a protected characteristic, so the rule produces an unequal outcome on the basis of sex even though the rule itself sounds neutral. Specific citation of Section 19, the term "indirect discrimination", or Section 11 NOT required. Recognition that the apparently-neutral rule has an unequal effect by sex earns full marks.
- Award 1 explanation mark for answers that recognise "discrimination against women" but do not connect declared flexibility to caring responsibilities or to sex as a protected characteristic.
- *Informational context for marker (not required from student):* Section 19 Equality Act 2010 (indirect discrimination); sex protected under Section 11.

**Author note:** Distinct from Pre Q4 (council planning portal — age) by protected characteristic and mechanism. Tests whether students recognise the discriminatory mechanism via algorithm or workplace policy, with sex as the protected characteristic. The recalibrated mark scheme credits recognition of the discriminatory mechanism without requiring the indirect-vs-direct technical distinction.

**Difficulty:** Grey, not clean. The question requires students to recognise that declared flexibility is a proxy for caring responsibilities, which correlate with sex. Same fragility as Pre Q4: if indirect discrimination has not been taught explicitly, this becomes very hard even with the recalibration. See note 5 to Dave.

---

### Q5 [3 marks] · Intellectual Property · clean

**Scenario:** A graphic-design agency uses Adobe Photoshop on its office computers. The agency holds 3 valid Photoshop licences but has installed the software on 12 machines because, in the words of the office manager, "we don't all use it at once anyway."

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme (recalibrated 2026-05-14):**

- **1 mark** for naming the copyright framework. Acceptable: "copyright law", "Copyright, Designs and Patents Act 1988", or "software licensing law" (all three were already accepted; this acceptance level stays).
- **Up to 2 marks** for the explanation, which should describe in plain English: (a) Photoshop is licensed software; (b) installing it on more machines than the licence permits breaches the licence terms even though the extra installs are not all used simultaneously. Specific citation of the CDPA 1988 NOT required.
- Award 1 explanation mark for answers that recognise "they don't have enough licences" without explaining that licence terms govern installation, not just simultaneous use.
- *Informational context for marker (not required from student):* Copyright, Designs and Patents Act 1988 (software is licensed material).

**Author note:** Distinct from Pre Q5 (YouTube music in trailer): there the issue was using a copyrighted work without licensing it at all; here the issue is exceeding the scope of an existing licence. Both engage IP; the teaching point is that licences are limits on what specific use is permitted, not "you bought one, do what you like."

---

## Notes for Dave (sense-check items)

The author has tried to use cohort-appropriate language throughout, but the following items would benefit from your read on whether they will land for Mid-Sussex College T-Level Digital learners:

1. **Reading load.** Each scenario is 2-3 sentences. Total per test: roughly 5-6 minutes of reading + 9-12 minutes of writing for explanations + 3-5 minutes admin (paper distribution, instructions, collection) = roughly 17-23 minutes per administration.

2. **Cultural references.** Smartphone-only portal in Pre Q4 and Photoshop in Post Q5. Are either going to confuse the cohort or feel dated?

3. **Time budget against your lesson slot.** The 17-23 minute administration estimated in note 1 runs in your lesson time *around* the 30-minute platform window, not against it. Per the evaluation plan Section 2.2, the 30 minutes is platform time scheduled in the second half of your Monday double-period, so the pre-test fits in the non-platform half of session 1 and the post-test fits in the non-platform half of session 4. Is 17-23 minutes realistic for the slot you can give us, accounting for register, late arrivals, technical setup, and any post-test debrief? If the slot is too tight, flag and we'll discuss reducing the question count — though cutting from 5 to 4 questions per side would unbalance the legislation distribution (currently 2 DPA + 1 CMA + 1 Equality + 1 IP per side), so we would want to think about which axis to compress.

4. **Section vs Article numbers (recalibrated 2026-05-14).** Following your 2026-05-14 confirmation that the cohort has "DPA plus some patchy prior exposure on one or two strands, but not secure survey-level coverage across all four", the mark scheme has been recalibrated to NOT require specific Article/Section citations for the explanation marks. The Name mark still requires the Act name (DPA / UK GDPR, Computer Misuse Act, Equality Act, copyright law). The explanation marks credit accurate plain-English descriptions of the principle engaged. Article and Section numbers are retained in each mark scheme as informational context for you as marker, not as required citations from the student. Flag if you want the calibration looser or tighter than this.

5. **The Equality Act questions (Pre Q4 and Post Q4).** Both test indirect discrimination via an apparently-neutral rule (smartphone-only portal disadvantages older people; flexible-availability shift allocation disadvantages women with caring responsibilities). The recalibrated mark scheme credits recognition of the discriminatory mechanism (rule has unequal effect by protected characteristic) WITHOUT requiring the "indirect discrimination" technical term or the Section 19 citation. **Even with that calibration**, indirect discrimination is a sophisticated concept that depends on students recognising an unstated proxy relationship (smartphone non-ownership → age; declared flexibility → caring responsibilities → sex). If your Year 1s haven't been taught indirect discrimination as a distinct concept by 21 September, both questions may produce floor-level scores on the explanation marks even with the recalibration. Worth flagging if you suspect this; we could either replace these two questions with simpler Equality scenarios (e.g. direct discrimination on disability, which uklaw-007 on the platform tests) or accept floor scores on this tier as part of the pilot's documented limits.

6. **Anything else.** Anything in any scenario that feels off for the cohort — flag it. The author has no contact with the cohort and is working only from the spec.

---

## Audit trail

Drafted on 7 May 2026 by Claude as the deliverable for Section 3.2 of the pilot evaluation plan. Per the plan, Chris reviews; Dave sense-checks for cohort-appropriate language; finalised version is locked before the pilot begins.

Filling this document is not a methodological change to the pre-registered plan and does not require re-agreement under Section 8 of `docs/pilot-evaluation-plan.md`. Any subsequent modification to the questions or mark schemes after Dave's sense-check, however, would require re-agreement.
