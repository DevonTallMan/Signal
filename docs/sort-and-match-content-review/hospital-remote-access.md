# Twin Tracks content review — Hospital Remote Access

**Worked example:** Hospital Remote Access (T Level Core Paper 2 SAM, Question 10)
**Protocol:** Spec v0.3 Section 11 two-pass review (Twin Tracks variant)
**Date:** 9 May 2026
**Run by:** Chris (Pass 1 author + Pass 2 conductor across three runs)
**Activity:** Twin Tracks (introduced in spec v0.3)

## Outcome

Six phrases ship into `src/data/twin-tracks/scenarios.json`. Two-dimensional classification (track × slot) validated by blind classification on first pass under the Twin Tracks framework. Zero rewrites required.

This worked example is also the empirical foundation for the introduction of Twin Tracks as a separate activity in spec v0.3. The full extraction journey is documented below for audit purposes.

## Extraction journey

This worked example went through three protocol runs before producing the shipping phrase set. The journey is preserved here as the empirical record behind spec v0.3.

### Run 1 — Original Sort and Match N·E·I framework (FAILED)

Six phrases drafted with intended distribution 2N / 2E / 2I, following the original Sort and Match content model.

Pass 2 result: 4/6 match. Both N phrases failed (33%, over threshold).

| # | Intent | Result | Reason |
|---|---|---|---|
| 1 (N) | N | I | "States a consequence (access anywhere, anytime) resulting from the system, not what it is or how it works." |
| 2 (N) | N | I | "States a downstream consequence (increased cyber attack exposure), even though it briefly references the mechanism." |
| E phrases | E | E | Matched |
| I phrases | I | I | Matched |

Failure mode: the cold reader correctly identified that the body of each N phrase contained impact content and weighted that over the structural "One [label] impact is that..." marker.

### Run 2 — Re-drafted pure naming N phrases (FAILED)

Pure-naming hypothesis tested: rewrite the two N phrases as category-naming acts only, with no embedded mechanism or impact content.

- Re-drafted phrase 1: "Continuous availability of patient records is one positive impact for the hospital."
- Re-drafted phrase 2: "Exposure to cyber attacks is one negative impact for the hospital."

Pass 2 result on these two phrases: 0/2. Both classified as I.

| Phrase | Result | Reason |
|---|---|---|
| 1 | I | "States a downstream outcome ('continuous availability') for the hospital." |
| 2 | I | "States a consequence ('exposure to cyber attacks') affecting the hospital." |

Failure mode: even with no embedded mechanism or specifics, the cold reader treated the named impact category itself as a consequence claim. The deeper insight: for Discuss-style questions, what is being "named" doesn't exist independently of the scenario; it IS the consequence created by the scenario. There is no analytically-distinct N to extract.

### Run 3 — Twin Tracks framework (PASSED)

The two failed runs surfaced that N has different semantics across question types. Spec v0.3 introduced Twin Tracks as a separate two-dimensional recognition activity for Discuss-style questions.

Six new phrases drafted under the Twin Tracks framework, distributed 1 per track × slot cell (positive/negative × Introduce/Explain/Develop).

Pass 2 result: 6/6 match on both dimensions. Zero failures. Zero hedges. Zero clarification requests from the cold reader.

| # | Track | Slot | Result | Match |
|---|---|---|---|---|
| 1 | positive | Introduce | positive / Introduce | ✓ |
| 2 | positive | Explain | positive / Explain | ✓ |
| 3 | positive | Develop | positive / Develop | ✓ |
| 4 | negative | Introduce | negative / Introduce | ✓ |
| 5 | negative | Explain | negative / Explain | ✓ |
| 6 | negative | Develop | negative / Develop | ✓ |

The highest-risk distinction (Introduce vs Develop, since both carry impact content and differ only in specificity) held cleanly. The cold reader's reasons explicitly cited "general statement, no mechanism" for Introduce phrases and "specific scenario / named consequences" for Develop phrases. That is the specificity weighting the framework needs.

## Final phrase set (shipping)

| # | Track | Slot | Text |
|---|---|---|---|
| 1 | positive | introduce | One positive impact is continuous availability of patient records for authorised staff. |
| 2 | positive | explain | Because the server is reachable from hospital-issued smartphones and laptops, on-call doctors can retrieve patient records remotely instead of needing to be physically present. |
| 3 | positive | develop | Faster clinical decisions in time-critical situations, like an on-call consultant reviewing patient history, improve outcomes and meet the hospital's continuous-availability requirement. |
| 4 | negative | introduce | One negative impact is increased exposure to cyber attacks on the server holding sensitive medical information. |
| 5 | negative | explain | Lost or stolen devices and phishing-compromised credentials let attackers authenticate to the server like an authorised user. |
| 6 | negative | develop | A confidentiality breach would be a notifiable data breach under UK GDPR, exposing the hospital to ICO regulatory action and reputational damage. |

## modelAnswer

The post-success reveal uses the verbatim sentences from the original worked example, not the distilled phrases. Students see the actual exam-quality prose with structural components colour-coded inline.

Source: T Level Technical Qualification in Digital Software Development (Level 3), Core Examination Paper 2, Specimen Assessment Material for first teaching September 2025, Question 10.

## Resolution

The Twin Tracks framework was committed to spec v0.3 ahead of this PR. Spec changes:

- Section 2.5 maps question types to activities; Discuss-style questions map to Twin Tracks.
- Section 3.2 captures Twin Tracks design decisions (TT1–TT8).
- Section 4.2 specifies the Twin Tracks user journey.
- Section 5.3 specifies the Twin Tracks content model (used by this `scenarios.json`).
- Section 6.3 specifies the diagnostic feedback per drop.
- Section 8.2 specifies the Twin Tracks visual layout.
- Section 11.4 captures decision TT8 (Introduce phrases must state impact at general level only).

The framework-fit observation that originated in the Six Vs review log is now resolved: N has different semantics across question types; Twin Tracks handles the Discuss-style case.

## Outstanding

- `scenarioPanels` array empty in `scenarios.json`. Comic panels blocked on icon vocabulary design (spec v0.3 Section 8.0, Section 10 risk row 1). Will be populated when icon vocabulary is locked. Shared infrastructure with Sort and Match.
- `modelAnswer` structured per spec v0.3 Section 5.3 (positive/negative each with introduce/explain/develop). Reveal component (when built) reads this structure directly for colour-coding.
- Two-dimensional drag interaction (track × slot) and diagnostic feedback (Section 6.3) are net-new build work in Sprint 3. Risk row in spec v0.3 Section 10 acknowledges the cognitive load risk for mobile layouts; will be validated by pilot observation.
