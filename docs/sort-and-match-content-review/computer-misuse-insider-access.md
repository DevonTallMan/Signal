# Sort & Match content review — Computer Misuse Act and insider access

**Worked example:** Computer Misuse Act and insider access (Content Area 4.1.2)
**Protocol:** Spec v0.3 Section 11 two-pass review
**Date:** 16 May 2026
**Run by:** Claude (Pass 1 author and Pass 2 best-effort blind classifier, in a single session)

## Honest caveat on Pass 2 isolation

The two-pass protocol's strongest form has Pass 2 run in a fresh chat
with no prior context. This review was run in a single session, so the
Pass 2 classifier is the same agent that drafted Pass 1. Best-effort
isolation was attempted by classifying each phrase in turn against the
N / E / I definitions without reviewing the Pass 1 intent column until
after the Pass 2 result was recorded. The reliability of the
agreement-rate signal is therefore weaker than the Six Vs review,
which used a true fresh-chat Pass 2.

Chris can re-run a true blind Pass 2 in a separate chat if any phrase
later proves to confuse students in the pilot. The 5/5 agreement
recorded below is consistent with each phrase being clean against its
intent, but it is not the same evidence as an independent blind reader
agreeing.

## Outcome

Five phrases ship into `src/data/sort-and-match/scenarios.json`.
Distribution 1 N / 2 E / 2 I, matching the Six Vs shape.
Disagreement rate 0/5 = 0%, under the 20% rethink threshold.

## Pass 1 — author classification

Five candidate phrases drafted, intended distribution 1 N / 2 E / 2 I.

| # | Intent | Text |
|---|---|---|
| 1 | N | The Computer Misuse Act 1990 is the UK legislation governing unauthorised access to computer material, with section 1 as the basic unauthorised-access offence. |
| 2 | E | The Act treats authorisation as a property of the task being performed, not of the person. |
| 3 | E | Section 1 is satisfied by the unauthorised access itself; no further misuse of the data is required for the offence to be complete. |
| 4 | I | A bank employee viewing a celebrity client's records out of curiosity, despite holding legitimate credentials, commits a section 1 offence. |
| 5 | I | The maximum sentence under section 1 is two years' imprisonment, and the same conduct can simultaneously expose the employer to Information Commissioner's Office enforcement under UK GDPR. |

No phrases were pre-flagged as high-risk. The Pass 1 author judged
that the N phrase's second clause ("with section 1 as the basic
unauthorised-access offence") might pull toward E by labelling section
1's role, but read the clause as a naming sub-act (calling section 1
by its descriptive label) rather than explaining how section 1
operates. The phrase was kept; the framework-fit risk is noted here
for audit.

## Pass 2 — best-effort blind classification

Each phrase read in isolation against the N / E / I definitions from
the spec, before the Pass 1 intent column was re-read. Pass 2
classifier is the same session-instance as Pass 1, so the result is
not independent. See "Honest caveat" above.

| # | Intent | Result | Match | Pass 2 reason |
|---|---|---|---|---|
| 1 | N | N | ✓ | Identifies the Act and its key section by role-label. Structure: "[Act] is [definition], with [sub-thing] as [sub-role]" — pure naming. |
| 2 | E | E | ✓ | Substantive claim about how the Act operates. Not naming, not consequence-describing. Mechanism. |
| 3 | E | E | ✓ | Explains the trigger condition for section 1 completion. Mechanism. |
| 4 | I | I | ✓ | Specific scenario showing the offence in action. Outcome at the individual level. |
| 5 | I | I | ✓ | Sentence range and regulatory exposure. Consequence. |

## Resolution (shipping)

**Ship all 5 phrases as drafted.** Distribution 1 N / 2 E / 2 I matches
the Six Vs shape and the spec's 5-8 phrase range.

Rationale:

- 0% disagreement under best-effort Pass 2. Subject to the isolation
  caveat, the phrases read cleanly against their intents.
- All phrases respect SM7 ("N phrases must be pure naming acts").
  Phrase 1's second clause was scrutinised; it labels rather than
  explains.
- Phrases 4 and 5 demonstrate the Impact step at two distinct levels:
  the individual offence (phrase 4) and the regulatory and career
  consequences (phrase 5). Two I phrases let the student practise
  recognising consequence-shaped statements at both individual and
  systemic levels.

## Framework-fit observation

Insider-misuse CMA scenarios produce clean N phrases more easily than
the Six Vs framework did. The Act's structure (named section + named
offence + named statute year) gives a stable Name anchor. The mechanism
(task-specific authorisation) gives a substantive Explain target.
The consequence path (criminal sentence + employer regulatory exposure
+ career impact) gives natural Impact phrasing.

This is consistent with the spec's prediction that legislation
questions yield easier Sort & Match material than concept questions.

## Pedagogical fit with existing CA 4.1 content

The 4-1-2 Computer Misuse topic page already drills the task-specific
reading in its NEI assessment and 10-card drill. This Sort & Match
scenario extends that drill by exercising structural recognition of
the same material in the N·E·I shape, which is the format students
need to produce under exam conditions.

The scenario deliberately uses a bank-employee context rather than
the topic page's hospital-administrator or police-officer examples.
This is a deliberate choice: the topic page teaches the principle,
the Sort & Match scenario shows that the principle generalises beyond
the specific examples used to teach it.
