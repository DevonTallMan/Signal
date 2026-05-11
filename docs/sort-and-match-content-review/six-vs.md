# Sort & Match content review — Six Vs and Data Quality

**Worked example:** Six Vs and Data Quality (Content Area 6.4.1)
**Protocol:** Spec v0.2 Section 11 two-pass review (updated for v0.3)
**Date:** 9 May 2026
**Run by:** Chris (Pass 1 author + Pass 2 conductor)
**Last updated:** 9 May 2026 — framework-fit observation resolved by spec v0.3.

## Outcome

Five phrases ship into `src/data/sort-and-match/scenarios.json`. One phrase dropped (originally Pass 1 phrase 2, an N candidate). Disagreement rate 1/6 = 17%, under the 20% rethink threshold.

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

## Resolution (shipping)

**Drop phrase 2.** Ship a 5-phrase set with distribution 1N / 2E / 2I. Phrase IDs renumbered sequentially (ph1–ph5) in `scenarios.json`; the Pass 1 numbering is preserved here for audit.

Rationale:

- 17% disagreement is under the 20% rethink-the-approach threshold; the extraction approach for Six Vs holds.
- Phrase 2 violates spec v0.3 decision SM7 ("N phrases must be pure naming acts"). It mixes naming with describing evolution. Dropping is the correct call under SM7, not a trade-off.
- Spec allows 5–8 phrases (Section 4). 5 is in band.
- Replacing with another N phrase from the source prose is not viable. The Name paragraph has three sentences; phrase 1 is the only cleanly-decoupled N candidate. The other two carry the same describing-as-naming problem.

The 1 N out of 5 distribution is light on N-classification practice. Accepted because shipping a phrase that violates SM7 would teach students the wrong recognition pattern. SM7 discipline takes precedence over phrase-count parity.

## Framework-fit observation (resolved by spec v0.3)

**Original observation (kept here for audit trail):**

The Six Vs Name paragraph as authored produced only one cleanly-decoupled N phrase out of three candidate sentences. The other two sentences carried describing-as-naming content that pulled their classification toward E. By contrast, the spec's example Hospital legislation pattern produces clean N from sentences like "this situation is governed by the Data Protection Act 2018" without difficulty.

Two interpretations were on the table at the time of this log's first version:

- **A. Six Vs-specific.** The Name paragraph is authored loosely. Tightening it to identification-only at the source would yield 2–3 clean N phrases.
- **B. Framework-level.** N's scope legitimately varies by content type. Legislation N is one-line; framework N may carry historical/structural context.

The original resolution path was: "Do not change the spec yet. Run the Hospital worked example through the same Section 11 protocol."

**What actually happened:**

Hospital was run through the protocol. Both Hospital N phrases failed Pass 2 blind classification (2/6 = 33%, over threshold). A re-drafted set of pure-naming Hospital N phrases ALSO failed. The cold reader's reasoning was decisive: in a Discuss-style answer, the N is naming an impact, and impacts are themselves consequences — there is no analytically-distinct N to extract.

This was a third interpretation neither A nor B captured:

- **C. N's stability depends on question type.** For concept-explanation (Six Vs) and legislation (Hospital's spec example), N has stable analytical content. For Discuss-style questions, N is rhetorical scaffolding around impact content, not an independent analytical move.

**Resolution: spec v0.3.**

The Sort & Match spec was amended to v0.3 to reflect this finding. Major changes:

- v0.3 Section 2.5 maps question types to activities. Sort & Match handles concept-explanation and legislation. A new activity, Twin Tracks, handles Discuss.
- v0.3 decision SM7 captures the pure-naming discipline derived from this run.
- v0.3 introduces Twin Tracks as a separate two-dimensional recognition activity. Hospital becomes a Twin Tracks worked example, validated by Section 11 blind classification under the new framework.

**What this means for Six Vs:**

Interpretation A (Six Vs-specific worked-example revision) is now optional rather than necessary. The Six Vs Name paragraph could be tightened to produce 2–3 clean N phrases by removing the describing-as-naming sentences, but the current 1-N phrase set ships under SM7 discipline and is consistent with spec v0.3. Revision of the Six Vs Name paragraph is deferred to a future content-authoring pass and is not a blocker for this PR.

The framework-fit observation that opened this section is **closed**.

## Outstanding

- `scenarioPanels` array empty in `scenarios.json`. Comic panels blocked on icon vocabulary design (spec v0.3 Section 8.0, Section 10 risk row 1). Will be populated when icon vocabulary is locked.
- ~~`modelAnswer` structured as object with `name` / `explain` / `impact` keys. Spec Section 5 example shows it as a string.~~ **Resolved by v0.3:** spec Section 5.2 now specifies the structured object shape for Sort & Match content. The shape used in this `scenarios.json` matches the spec.
- ~~Hospital phrase extraction is the next Section 11 protocol run. Outcome informs whether the framework-fit observation above is acted on.~~ **Resolved:** Hospital extraction was completed under the original framework (failed), then under Twin Tracks framework (passed). See `docs/sort-and-match-content-review/hospital-twin-tracks.md` for the Hospital protocol record.
