# Risk Classifier — Rollback Criterion

**Status**: Pre-registered before sprint 1. Binding.
**Last amended**: Sprint 1, draft 1

This document pre-registers the conditions under which we stop or scale back the Risk Classifier build. It exists to protect against sunk-cost reasoning after the build is complete. Agreed by Chris before sprint 1 started.

---

## Outcome-based trigger

After the A/B counterbalanced pilot in Dave's class completes, we evaluate three metrics:

1. **Completion rate**: percentage of students who reached the end-of-session summary
2. **Time-on-task**: median minutes of engaged interaction per student
3. **Assessment score**: mean score on the five NEI questions taken after each lesson

If the Risk Classifier arm of the pilot does not show a meaningful improvement on **at least two of three** metrics compared to the static-content arm:

- Pause all further gamified-module development
- Do not build the CMA, DUAA, or IP classifiers
- Keep the EU AI Act Risk Classifier live as a single feature (do not remove)
- Return to retrieval-prompt-based development for the remaining topic pages

If the improvement is present on two or more metrics, build the next three classifiers in sequence (CMA, DUAA, IP, in that order).

"Meaningful improvement" is defined as:
- Completion rate: +10 percentage points or more
- Time-on-task: +25% or more
- Assessment score: +10% relative improvement in mean score

---

## Process-based trigger

If the build estimated at eight weeks slips beyond twelve weeks end-to-end (that is, four weeks over the original estimate), we stop and ship whichever sprint is complete. We do not chase the full feature past three months.

Specifically:
- If sprint 3 is incomplete at the twelve-week mark, ship sprint 2 as the MVP (no mascot, no shaders, no sounds) with a commit message and release note explaining the scope reduction
- If sprint 4 is incomplete at the twelve-week mark, ship without the accessibility layer and file the omissions as tech debt tickets
- Do not extend the timeline past twelve weeks without a new rollback criterion agreed in advance

---

## What this document does not do

It does not decide whether the Risk Classifier is a success. Meeting the outcome criteria means "continue building gamified modules"; failing them means "the hypothesis that gamified mechanics outperform serious content for this cohort is not supported by this pilot, adjust accordingly."

It does not prevent iteration. If after the pilot the data is ambiguous (one metric up, one neutral, one down), we run the pilot again with adjustments. Rollback triggers when the data is clearly against the hypothesis, not when it's uncertain.

---

## Agreement

This criterion was pre-registered before any code was written. It was proposed by Claude and agreed by Chris in the planning conversation. Neither party may unilaterally relax the triggers; changes require explicit re-agreement in writing.
