# Sort & Match content review — Six Vs and Data Quality

**Worked example:** Six Vs and Data Quality (Content Area 6.4.1)
**Protocol:** Spec v0.2 Section 11 two-pass review
**Date:** 9 May 2026
**Run by:** Chris (Pass 1 author + Pass 2 conductor)

## Outcome

Five phrases ship into `scenarios.json`. One phrase dropped (originally Pass 1 phrase 2, an N candidate). Disagreement rate 1/6 = 17%, under the 20% rethink threshold.

## Pass 1 — author classification

Six candidate phrases drafted, intended distribution 2N / 2E / 2I.

| # | Intent | Text |
|---|---|---|
| 1 | N | The Six Vs framework assesses big data quality across six dimensions: volume, variety, velocity, variability, value, and veracity. |
| 2 | N | Volume, variety, and velocity were the original three Vs, with variability, value, and veracity added as big data use grew. |
| 3 | E | Velocity is the speed at which data is generated, transmitted, and processed in real time. |
| 4 | E | Variety covers the range of sources and formats, including structured database records, semi-structured CSV files, and unstructured content such as text, images, and video. |
| 5 | I | High volume without sufficient storage causes processing bottlenecks. |
| 6 | I | Low veracity destroys confidence in business decisions and damages stakeholder trust. |

Phrase 2 was pre-flagged before Pass 2 as the highest-risk phrase. Risk: the temporal clause "added as big data use grew" pulls toward E (explaining how the framework evolved) rather than N (naming what it is).

## Pass 2 — blind classification

Conducted in a fresh chat session with no prior context, no spec exposure, no worked-example exposure. Each phrase sent individually with a category-definitions setup prompt.

| # | Intent | Result | Match | Fresh-chat reason |
|---|---|---|---|---|
| 1 | N | N | ✓ | Matched. |
| 2 | N | E | ✗ | "Describes the historical composition of the framework, explaining how it evolved rather than naming it fresh or stating an outcome." |
| 3 | E | E | ✓ | Matched. |
| 4 | E | E | ✓ | Matched. |
| 5 | I | I | ✓ | Matched. |
| 6 | I | I | ✓ | Matched. |

The Pass 2 reason for phrase 2 is a near-paraphrase of the Pass 1 risk note. The failure was predicted with the right mechanism. Signal of structural difficulty, not random phrasing failure.

## Resolution

**Drop phrase 2.** Ship a 5-phrase set with distribution 1N / 2E / 2I. Phrase IDs renumbered sequentially (ph1–ph5) in `scenarios.json`; the Pass 1 numbering is preserved here for audit.

Rationale:
- 17% disagreement is under the 20% rethink-the-approach threshold; the extraction approach for Six Vs holds.
- Rewriting phrase 2 would paper over a known framework-fit borderline. Dropping is honest.
- Spec allows 5–8 phrases (Section 4 step 2). 5 is in band.
- Replacing with another N phrase from the source prose is not viable. The Name paragraph has three sentences; phrase 1 is the only cleanly-decoupled N candidate. The other two carry the same temporal/evolutionary problem.

Trade-off accepted: 1 N phrase out of 5 is light on N-classification practice. Acceptable rather than shipping a known-borderline phrase.

## Framework-fit observation (open, do not act on yet)

The Six Vs Name paragraph as authored contains:

1. Framework identification + components ("The Six Vs framework assesses... volume, variety...") — clean N.
2. Sub-grouping identification ("Volume, variety, and velocity are commonly identified as the three main factors.") — borderline N/E.
3. Historical evolution ("Variability, value, and veracity have been added as the gathering and use of big data has grown.") — same problem as phrase 2.

So 1 of 3 sentences decouple cleanly to N. By contrast, the spec's example Hospital N pattern produces clean N from "this situation is governed by the Data Protection Act 2018 and the UK GDPR" without difficulty.

Two possible interpretations:

- **A. Six Vs-specific.** The Name paragraph is authored loosely. Tightening it to identification-only at the source would yield 2–3 clean N phrases without changing the post-success model-answer reading materially.
- **B. Framework-level.** N's scope legitimately varies by content type. Legislation N is one-line; framework N may carry historical/structural context. Sort & Match should accept this and adapt extraction.

**Resolution path:** Do not change the spec yet. Run the Hospital worked example through the same Section 11 protocol. If Hospital's Name section produces 2–3 clean N phrases naturally, this is Six Vs-specific (interpretation A) and the worked example needs revision. If Hospital's Name section also produces only 1 clean N, this is framework-level (interpretation B) and the spec needs a note.

Until that data arrives, the Six Vs phrase set ships as-is with documented underweighting on N.

## Outstanding

- `scenarioPanels` array empty in `scenarios.json`. Comic panels blocked on icon vocabulary design (spec Section 8.1, Section 10 risk row 1). Will be populated when icon vocabulary is locked.
- `modelAnswer` structured as object with `name` / `explain` / `impact` keys. Spec Section 5 example shows it as a string; structured object preserves the inline-tagged intent more robustly. Confirm format with implementer when post-success reveal component is built.
- Hospital phrase extraction is the next Section 11 protocol run. Outcome informs whether the framework-fit observation above is acted on.
