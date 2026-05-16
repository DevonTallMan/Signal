---
source: Author-generated exemplar drafted by Claude (under Chris's direction) for CA 4.1 Computer Misuse Act 1990 insider-access scenario. Reviewed against the calibration noted in `docs/handover-2026-05-15.md` Section 4 (CMA scenarios drill insider-misuse / task-specific authorisation rather than outside-attacker shapes).
contentArea: 4.1.2
marks: 6
commandWord: Discuss
shape: single legislation tier, full N·E·I cycle. Pairs with Risk Classifier's Act-recognition focus by exercising the harder follow-on step: once you have named the CMA, show that you understand the task-specific reading.
status: v1 draft for Sort & Match scenario
---

# Computer Misuse Act and insider access

## Question

A bank employee uses their valid username and password to log in to the
customer records system as part of their normal work. While logged in,
they look up the account of a celebrity client out of curiosity. No
information is copied, shared or altered.

Discuss the impact of the Computer Misuse Act 1990 on this kind of
insider access.

**[6 marks]**

## Model answer

### Name

The Computer Misuse Act 1990 is the UK legislation governing
unauthorised access to computer material, with section 1 as the basic
unauthorised-access offence. Sections 2 and 3 deal with more serious
variants: section 2 is a section 1 access committed with intent to
commit a further offence, and section 3 is an unauthorised act
intended to impair the operation of the computer, such as releasing
malware or deleting data.

### Explain

The Act treats authorisation as a property of the task being performed,
not of the person. An employee who holds a valid username and password
is authorised to do some things with that login, namely the tasks
their role requires, but not everything that the credentials
technically allow them to access. Access becomes "unauthorised" the
moment the employee acts outside their task-specific scope and knows
that they are exceeding it. Section 1 is satisfied by the unauthorised
access itself; no further misuse of the data is required for the
offence to be complete.

### Impact

This task-specific reading catches insiders who would not consider
themselves attackers. A bank employee viewing a celebrity client's
records out of curiosity, despite holding legitimate credentials,
commits a section 1 offence the moment they query the account.
The maximum sentence under section 1 is two years' imprisonment, and
the same conduct can simultaneously expose the employer to
Information Commissioner's Office enforcement under the integrity and
confidentiality principle of UK GDPR Article 5(1)(f), because the
employer has failed to maintain appropriate access controls. A
criminal record from a section 1 conviction also permanently affects
the individual's future employment in regulated sectors such as
finance, healthcare and policing.

---

## Notes on calibration

Insider misuse is the angle CA 4.1 Paper 1 most often tests for CMA,
per `docs/handover-2026-05-15.md` Section 4 ("CMA scenarios
deliberately drill insider-misuse (task-specific authorisation) rather
than outside-attacker shapes"). The scenario above is calibrated against
that pattern. Outside-attacker shapes (phishing, brute-force) engage
CMA equally but are easier to name; the harder step is recognising
that lawful credentials plus task-overreach is still a section 1
offence.

The scenario is intentionally single-Act: the offence is CMA, with
UK GDPR engaged as a secondary controller-side regulatory exposure. A
student who names "data protection" as the primary Act for this
scenario has misread it — the actor is the employee, not the
organisation, and the act is unauthorised access, not failure to
secure.
