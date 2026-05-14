# Signal Risk Classifier: Pilot Pre/Post Assessment

**Status: draft for review.**
**Drafted: 7 May 2026.**
**Author: Claude.**
**Reviewer: Chris Morris.**
**Sense-check: Dave Smith (cohort-appropriate language) before pilot deployment.**

This document provides the ten candidate assessment questions called for by Section 3.2 of the pre-registered Pilot Evaluation Plan (`docs/pilot-evaluation-plan.md`). Five questions form the pre-test, administered before any platform use; five form the post-test, administered after the final platform session.

The pre/post split is matched on legislation distribution (2 DPA + 1 CMA + 1 Equality + 1 IP per test) and on difficulty profile (3 clean + 2 grey per test, where the grey items are the second DPA question and the Equality question). Both tests use the same scoring framework (3 marks per question, 15 marks total) so pre/post results are directly comparable.

All ten scenarios are distinct from the twelve platform scenarios in `src/data/risk-classifier/scenarios.json`, in line with the "unseen scenarios" requirement of Section 3.2.

**Strand-level overlap on Equality:** both Pre Q4 and Post Q4 test indirect discrimination, as do platform scenarios uklaw-003 and uklaw-011. The protected characteristic, proxy variable, and sectoral context differ across all four. The mark scheme requires students to identify the specific protected characteristic and the indirect mechanism, so pattern-matching alone does not produce full marks. Acknowledged as an unavoidable strand-level overlap given the T-Level spec's emphasis on algorithmic indirect discrimination (Content Area 4.1.4).

**Content caveat:** same as the platform scenarios — author-generated, unreviewed by a qualified examiner. See `docs/pilot-evaluation-plan.md` Section 2.3 for the full caveat. This document inherits that caveat and is itself subject to Dave's sense-check before deployment.

---

## Pre-test (5 questions, 15 marks total)

### Q1 [3 marks] · Data Protection Act / UK GDPR · clean

**Scenario:** An HR officer at a manufacturing company photographs the printed pile of candidate CVs on her desk using her personal phone so she can review them at home that evening. The CVs include candidates' names, contact details, and previous employers.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme:**

- **1 mark** for naming Data Protection Act 2018 / UK GDPR.
- **Up to 2 marks** for the explanation, which should reference: (a) personal data (the candidates' details on the CVs) is being captured on a personal device outside the controller's environment, with no technical or organisational safeguards; (b) this engages the security principle (Article 5(1)(f)) requiring appropriate technical and organisational measures.
- Award 1 explanation mark for answers that name security/storage but don't cite the principle. Award 0 for explanations that just describe the scenario without identifying the wrong.

**Author note (for Dave's sense-check):** Tests recognition of a less common DPA breach pattern: photographing personal data on a personal device. The wrong is the transfer of personal data onto an uncontrolled device, regardless of whether the photos are subsequently shared, deleted, or backed up. Distinct in mechanic from platform scenarios uklaw-001 (USB stick) and uklaw-004 (request to email roll to personal Gmail), both of which test the same security principle via different routes.

---

### Q2 [3 marks] · Data Protection Act / UK GDPR · grey

**Scenario:** An online clothing retailer keeps every customer's order history on file indefinitely. A customer who has not ordered anything for nine years emails to ask for her records to be deleted. The retailer refuses, telling her the records are "useful for marketing in case you come back."

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme:**

- **1 mark** for naming Data Protection Act 2018 / UK GDPR.
- **Up to 2 marks** for the explanation, which should reference: (a) the right to erasure (Article 17) entitles individuals to have their personal data deleted where the data is no longer necessary for the original purpose; (b) "useful in case you come back" does not establish ongoing necessity after nine years of inactivity. The retailer's reason also describes direct-marketing processing, against which the customer has an absolute right to object under Article 21.
- Award 1 explanation mark for answers that mention "the right to be deleted" without naming the article or explaining why "useful for marketing" doesn't suffice.

**Author note:** Grey case. Students may pick "no Act applies because the retailer has a business reason." The teaching point is that lawful bases for refusing erasure must be specific and recognised under UK GDPR; "we want to keep the data" is not one of them. Tests whether students know DPA contains rights as well as security obligations.

---

### Q3 [3 marks] · Computer Misuse Act 1990 · clean

**Scenario:** A warehouse worker discovers that her supervisor has stepped away and left his workstation logged in. While the supervisor is on his break, the worker uses the logged-in session to open the staff bonus spreadsheet, which is restricted to managers. She does not download or change anything.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme:**

- **1 mark** for naming Computer Misuse Act 1990.
- **Up to 2 marks** for the explanation, which should reference: (a) Section 1 makes it an offence to cause a computer to perform a function with intent to secure unauthorised access to material; (b) the worker had no authority to view the staff bonus spreadsheet, and accessing it through the supervisor's session is unauthorised even though the worker did not bypass any technical control.
- Award 1 explanation mark for answers that recognise unauthorised access without citing Section 1, or that note "she didn't have permission" without explaining why the supervisor's logged-in state doesn't grant it.

**Author note:** Clean Section 1 CMA case. Common student error: thinking the offence requires "hacking" or technical bypass. The teaching point is that Section 1 covers any unauthorised access, including via someone else's logged-in session.

---

### Q4 [3 marks] · Equality Act 2010 · grey

**Scenario:** A council redesigns its planning portal so that all objections to planning applications must now be submitted through a new smartphone app. A long-term elderly resident, who has used the previous web form for years to make objections, does not own a smartphone. When she contacts the council, she is told there is no other route to submit her objection.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme:**

- **1 mark** for naming Equality Act 2010.
- **Up to 2 marks** for the explanation, which should reference: (a) public-sector service providers must avoid indirect discrimination on protected characteristics; (b) requiring all submissions through a smartphone app puts older people, who are less likely to own smartphones, at a particular disadvantage with no obvious justification, engaging Section 19 (indirect discrimination on age, a protected characteristic under Section 5).
- Award 1 explanation mark for answers that mention "discrimination" without identifying the protected characteristic or the indirect mechanism. Award 1 explanation mark for answers focused on disability/reasonable adjustments — partly right, since the underlying logic of "barrier to access" is correct, but the scenario doesn't actually establish a disability.

**Author note:** Clean indirect discrimination case on age. Students may want to invoke disability (because the resident is "elderly"), but the scenario doesn't establish a disability — only smartphone non-ownership, which correlates with age. The cleanest answer engages Section 19 on age.

**Difficulty:** Grey, not clean. The question requires students to recognise that smartphone non-ownership is a proxy for age, which is a sociological inference rather than a fact in the scenario. If indirect discrimination has not been taught explicitly, this question is closer to edge than grey.

---

### Q5 [3 marks] · Intellectual Property · clean

**Scenario:** A small indie games studio is making a trailer for its new game. The team finds a popular instrumental music track on YouTube and embeds it directly in the trailer, which they then upload to their own social media channels and YouTube channel. They do not contact the track's composer or pay any licence fee.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme:**

- **1 mark** for naming the Intellectual Property framework. Acceptable answers: "Copyright, Designs and Patents Act 1988" or "copyright law."
- **Up to 2 marks** for the explanation, which should reference: (a) the music track is a copyrighted work; (b) using it in another work and re-publishing without the rights-holder's permission infringes the composer's copyright, regardless of where the track was found.
- Award 1 explanation mark for answers that mention "copyright" without explaining that finding a work online does not grant a licence to reuse it.

**Author note:** Clean copyright infringement. Common student misconception: "if it's free to listen to on YouTube, it's free to use." The teaching point is that public availability is not a licence.

---

## Post-test (5 questions, 15 marks total)

### Q1 [3 marks] · Data Protection Act / UK GDPR · clean

**Scenario:** A solicitor's clerk takes a printed list of clients' names, addresses, and case numbers home in her work bag so she can prepare for a meeting the following morning. She loses the bag on the train and is unable to recover it.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme:**

- **1 mark** for naming Data Protection Act 2018 / UK GDPR.
- **Up to 2 marks** for the explanation, which should reference: (a) personal data has been lost outside the controller's secure environment; (b) this engages the security principle (Article 5(1)(f)) requiring appropriate technical and organisational measures, and may trigger breach notification obligations under Articles 33 and 34.
- Award 1 explanation mark for answers that recognise "data loss" without citing the security principle.

**Author note:** Distinct from Pre Q1 (transmission via personal email): this is loss of physical media. Same act, different mechanic. Tests that students recognise DPA applies regardless of medium (paper, electronic, USB).

---

### Q2 [3 marks] · Data Protection Act / UK GDPR · grey

**Scenario:** A bank's customer-records system has recorded a customer's date of birth incorrectly, which is causing him repeated problems passing age verification on the bank's online portal. He emails customer services with a scan of his passport and asks the bank to correct the error. The bank replies that "our records were imported from your original application and we cannot edit them."

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme:**

- **1 mark** for naming Data Protection Act 2018 / UK GDPR.
- **Up to 2 marks** for the explanation, which should reference: (a) the right to rectification (Article 16) entitles individuals to have inaccurate personal data corrected without undue delay; (b) "imported from your original application and we cannot edit them" is not a recognised ground for refusing rectification where the data is demonstrably inaccurate and the customer has supplied evidence.
- Award 1 explanation mark for answers that mention "the right to have data corrected" without naming Article 16 or explaining why "we can't edit it" doesn't suffice.

**Author note:** Grey case matched to Pre Q2 in difficulty. Single concept (Article 16 rectification) parallel to Pre Q2's single concept (Article 17 erasure). Tests that students recognise DPA contains correction rights as well as deletion rights, and that "the system won't let us" is not a lawful basis to refuse.

---

### Q3 [3 marks] · Computer Misuse Act 1990 · clean

**Scenario:** A receptionist at a doctor's surgery has access to the patient records system as part of her job, which involves checking patients in and booking appointments. Curious about a recent argument with her ex-partner, she logs in and reads through his medical history.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme:**

- **1 mark** for naming Computer Misuse Act 1990.
- **Up to 2 marks** for the explanation, which should reference: (a) Section 1 makes it an offence to cause a computer to perform a function with intent to secure unauthorised access; (b) her authorisation to use the patient records system is bound to her work purposes (check-in and booking), so accessing records out of personal curiosity is outside that purpose and therefore unauthorised, regardless of whether the system technically permits the access.
- Award 1 explanation mark for answers that recognise "she shouldn't be looking up his records" without distinguishing between technical access and authorised purpose.

**Author note:** Clean Section 1 CMA case based on a canonical pattern in UK case law (NHS curiosity-snooping prosecutions). Distinct from Pre Q3 (warehouse worker via supervisor's session): there the access uses someone else's session; here the access uses her own credentials but for a purpose outside what was authorised. Distinct in mechanic from platform scenarios uklaw-002 (post-employment, stolen credentials), uklaw-005 (stale permission), and uklaw-010 (external attack).

---

### Q4 [3 marks] · Equality Act 2010 · grey

**Scenario:** A logistics company introduces a new automated shift-allocation system. The system schedules all overnight shifts, which carry a higher hourly rate, for drivers who indicated "fully flexible availability" on their application form. After six months, a manager notices that women drivers, who on average had less flexibility because of caring responsibilities, are concentrated in the lower-paid daytime shifts.

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme:**

- **1 mark** for naming Equality Act 2010.
- **Up to 2 marks** for the explanation, which should reference: (a) a neutral-sounding rule (allocating overnight shifts based on declared flexibility) puts women at a particular disadvantage because of caring responsibilities; (b) this engages Section 19 (indirect discrimination on sex, a protected characteristic under Section 11) unless the company can justify the rule as a proportionate means of achieving a legitimate aim.
- Award 1 explanation mark for answers that recognise "discrimination against women" without identifying the indirect mechanism.

**Author note:** Distinct from Pre Q4 (council planning portal — age) by protected characteristic and mechanism. Tests whether students recognise indirect discrimination via algorithm or workplace policy, with sex as the protected characteristic.

**Difficulty:** Grey, not clean. The question requires students to recognise that declared flexibility is a proxy for caring responsibilities, which correlate with sex. Same fragility as Pre Q4: if indirect discrimination has not been taught explicitly, this becomes very hard.

---

### Q5 [3 marks] · Intellectual Property · clean

**Scenario:** A graphic-design agency uses Adobe Photoshop on its office computers. The agency holds 3 valid Photoshop licences but has installed the software on 12 machines because, in the words of the office manager, "we don't all use it at once anyway."

**Question:** Which piece of legislation is the primary one engaged by this scenario? Briefly explain your answer.

**Mark scheme:**

- **1 mark** for naming the Intellectual Property framework. Acceptable answers: "Copyright, Designs and Patents Act 1988," "copyright law," or "software licensing law."
- **Up to 2 marks** for the explanation, which should reference: (a) Adobe Photoshop is licensed software; (b) installing it on more machines than the licence permits exceeds the scope of the agreement and infringes Adobe's copyright in the software, regardless of how often the additional machines are actually used.
- Award 1 explanation mark for answers that recognise "they don't have enough licences" without explaining that licence terms govern installation, not just simultaneous use.

**Author note:** Distinct from Pre Q5 (YouTube music in trailer): there the issue was using a copyrighted work without licensing it at all; here the issue is exceeding the scope of an existing licence. Both engage IP; the teaching point is that licences are limits on what specific use is permitted, not "you bought one, do what you like."

---

## Notes for Dave (sense-check items)

The author has tried to use cohort-appropriate language throughout, but the following items would benefit from your read on whether they will land for Mid-Sussex College T-Level Digital learners:

1. **Reading load.** Each scenario is 2-3 sentences. Total per test: roughly 5-6 minutes of reading + 9-12 minutes of writing for explanations + 3-5 minutes admin (paper distribution, instructions, collection) = roughly 17-23 minutes per administration.

2. **Cultural references.** Smartphone-only portal in Pre Q4 and Photoshop in Post Q5. Are either going to confuse the cohort or feel dated?

3. **Time budget against your lesson slot.** The 17-23 minute administration estimated in note 1 runs in your lesson time *around* the 30-minute platform window, not against it. Per the evaluation plan Section 2.2, the 30 minutes is platform time scheduled in the second half of your Monday double-period, so the pre-test fits in the non-platform half of session 1 and the post-test fits in the non-platform half of session 4. Is 17-23 minutes realistic for the slot you can give us, accounting for register, late arrivals, technical setup, and any post-test debrief? If the slot is too tight, flag and we'll discuss reducing the question count — though cutting from 5 to 4 questions per side would unbalance the legislation distribution (currently 2 DPA + 1 CMA + 1 Equality + 1 IP per side), so we would want to think about which axis to compress.

4. **Section vs Article numbers.** The mark scheme references specific sections of CMA and Equality Act, plus specific articles of UK GDPR. If your teaching has not gone to that level of specificity, please flag — the mark scheme can be adjusted to credit higher-level descriptions without specific citations.

5. **The Equality Act questions.** Pre Q4 (age + smartphones) and Post Q4 (sex + caring responsibilities) both rely on students recognising that an apparently-neutral rule can produce discriminatory outcomes. If the cohort hasn't been taught indirect discrimination as a concept distinct from direct discrimination, both questions become much harder than the difficulty rating suggests.

6. **Anything else.** Anything in any scenario that feels off for the cohort — flag it. The author has no contact with the cohort and is working only from the spec.

---

## Audit trail

Drafted on 7 May 2026 by Claude as the deliverable for Section 3.2 of the pilot evaluation plan. Per the plan, Chris reviews; Dave sense-checks for cohort-appropriate language; finalised version is locked before the pilot begins.

Filling this document is not a methodological change to the pre-registered plan and does not require re-agreement under Section 8 of `docs/pilot-evaluation-plan.md`. Any subsequent modification to the questions or mark schemes after Dave's sense-check, however, would require re-agreement.
