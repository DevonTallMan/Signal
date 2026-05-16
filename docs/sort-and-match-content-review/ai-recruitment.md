# Twin Tracks content review — AI in recruitment

**Worked example:** AI in recruitment (CA 4.1 cross-tier: Equality + Data Protection)
**Protocol:** Spec v0.3 Section 11 two-pass review, Twin Tracks shape (6 phrases, 2 tracks × 3 slots)
**Date:** 16 May 2026
**Run by:** Claude (Pass 1 author and Pass 2 best-effort blind classifier, in a single session)

## Honest caveat on Pass 2 isolation

Same caveat as the Computer Misuse Act review log (PR #119):
the two-pass protocol's strongest form has Pass 2 in a fresh chat.
This review was run in a single session, so the Pass 2 classifier is
the same agent that drafted Pass 1. Best-effort isolation was attempted
by classifying each phrase against the track × slot definitions
before re-reading the Pass 1 intent column. The reliability of the
agreement-rate signal is weaker than a fresh-chat Pass 2.

Chris can re-run a true blind Pass 2 in a separate chat if any phrase
later proves to confuse students in the pilot.

## Outcome

Six phrases ship into `src/data/twin-tracks/scenarios.json`.
Distribution: 3 positive (introduce / explain / develop) + 3 negative
(introduce / explain / develop). Disagreement rate 0/6 = 0% under
best-effort isolation, under the 20% rethink threshold.

## Pass 1 — author classification

Six candidate phrases drafted, one per track-slot cell.

| # | Intent (track / slot) | Text |
|---|---|---|
| 1 | positive / introduce | One positive impact for the retailer is the operational efficiency of automated CV screening at scale. |
| 2 | positive / explain | Because AI can sift through tens of thousands of applications in minutes against the same scoring criteria, the recruitment team is freed from the most time-consuming part of the early funnel. |
| 3 | positive / develop | This lets recruiters spend more time on shortlisted-candidate engagement and reduces the time-to-hire, both of which improve the retailer's competitiveness for talent and the candidate experience for those who progress. |
| 4 | negative / introduce | One negative impact is the risk of indirect discrimination against applicants in protected groups. |
| 5 | negative / explain | AI trained on the retailer's historical hiring data inherits patterns of who has been hired before, so any historical preference for one demographic over another shows up as a learned scoring rule that disadvantages similar candidates today. |
| 6 | negative / develop | This creates simultaneous exposure under the Equality Act 2010 (likely indirect discrimination under section 19, since the screening rule applies uniformly but disadvantages protected groups) and under the UK GDPR (Article 22 restricts solely automated decisions producing legal or similarly significant effects on data subjects, with required safeguards including human review and the right to challenge). |

Phrase 6 was pre-flagged before Pass 2 as the highest-risk phrase.
Risk: the two-Act statutory tie-back is long, and the within-phrase
parenthetical structure could pull toward a hybrid intro+develop
read if the reader treats "creates simultaneous exposure" as
introductory rather than as the consequence of the explain.
The phrase was kept; the framework-fit risk is noted here for audit.

## Pass 2 — best-effort blind classification

Each phrase read in isolation against the introduce / explain /
develop slot definitions from the spec, before the Pass 1 intent
column was re-read. Pass 2 classifier is the same session-instance
as Pass 1, so the result is not independent. See "Honest caveat"
above.

| # | Intent | Result | Match | Pass 2 reason |
|---|---|---|---|---|
| 1 | positive / introduce | positive / introduce | ✓ | "One positive impact..." is the canonical Twin Tracks introduce phrasing. Headline claim only. |
| 2 | positive / explain | positive / explain | ✓ | "Because..." signals mechanism. Explains how the efficiency claim is produced. |
| 3 | positive / develop | positive / develop | ✓ | "This lets..." picks up the mechanism and traces it to consequences (competitiveness, candidate experience). Develop. |
| 4 | negative / introduce | negative / introduce | ✓ | "One negative impact is..." mirrors the positive intro form. Headline only. |
| 5 | negative / explain | negative / explain | ✓ | Mechanism: how the bias enters the AI's scoring rules. |
| 6 | negative / develop | negative / develop | ✓ | "This creates simultaneous exposure under..." is consequence-tied-to-statute. Long because two Acts are engaged, but unambiguously develop. The pre-flagged risk did not materialise; reading the phrase in isolation, the opening "This creates" reads as a develop continuation, not a fresh introduce. |

## Resolution (shipping)

**Ship all 6 phrases as drafted.** Twin Tracks scenarios are locked
at exactly 6 phrases per spec decision TT2; the 3-positive +
3-negative distribution is structurally required.

Rationale:

- 0% disagreement under best-effort Pass 2.
- All phrases respect the spec's slot definitions: introduce is a
  pure claim, explain is the mechanism, develop is the consequence
  with statutory tie-back where relevant.
- The two-Act statutory analysis in phrase 6 is the substantive
  pedagogical payload of the scenario. Splitting it across two
  phrases would either inflate the phrase count (breaking TT2)
  or strip detail (weakening the cross-tier drill). Keeping it as
  one rich develop phrase is the correct call.

## Framework-fit observation

Cross-tier Discuss scenarios (two Acts engaged simultaneously) fit
Twin Tracks naturally: the positive track stays single-tier (clean
operational benefit), the negative track carries the multi-Act
statutory exposure (where most Paper 1 marks live). The Twin Tracks
shape is therefore well-suited to scenarios where the positive and
negative sides have asymmetric complexity, which is most real-world
"Discuss the impact" questions.

By contrast, the Hospital Remote Access scenario is symmetric in
complexity: both tracks engage UK GDPR (positive: continuous
availability; negative: confidentiality breach exposure). Both shapes
are valid; they exercise slightly different recognition skills.

## Pedagogical fit with existing CA 4.1 content

The AI-in-recruitment scenario directly extends the visual upgrade
preview's drill scenario #6 (PR #117), which calibrated a similar
multi-Act analysis as a Sort & Match item. This Twin Tracks scenario
turns the same scenario shape into a six-phrase placement exercise
across the two tracks.

The scenario also reinforces the existing 4-1-3 Equality topic's
emphasis on indirect discrimination under section 19 (per the
handover note: "Equality NEI drills the indirect-discrimination
route") and the 4-1-1 Data Protection topic's coverage of Article 22
automated-decision restrictions.
