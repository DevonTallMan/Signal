# Risk Classifier: UK Legislation Classifier

## Review status: author-generated, unreviewed

The scenarios in `scenarios.json` were drafted by the AI author (Claude) working under the direction of Chris Morris. They have not been independently reviewed by a qualified examiner or FE practitioner before pilot deployment.

This is a deliberate choice, not an oversight. The decision was recorded on 24 April 2026 as Option C in a set of three options considered that evening:

- **Option A.** Chris reviews the scenarios himself before pilot deployment.
- **Option B.** A second practitioner reviews the scenarios before pilot deployment.
- **Option C.** Content ships unreviewed, with the limitation pre-registered in the pilot evaluation plan so that any ambiguity in pilot results must consider content quality as a legitimate alternative explanation.

Chris selected Option C with open eyes.

## Pilot evaluation caveat (pre-registered, not retrofit)

If the pilot produces ambiguous or negative results, content quality is a legitimate alternative explanation alongside the intended variables (student engagement with the N·E·I framework, time-on-task, assessment-score improvement). Evaluation must therefore distinguish between:

- The mechanic itself failing (scenario classification game does not improve student outcomes)
- The content failing (scenarios were poorly drafted, misaligned with the spec, or pitched at the wrong level)
- The students not engaging sufficiently with the content

This caveat was agreed in writing before the pilot started. It may not be dropped or softened in the pilot writeup without explicit re-agreement between author and reviewer.

## Content scope

Twelve scenarios covering four tiers of UK legislation named in T-Level Digital spec Content Area 4.1:

- Data Protection Act 2018 / UK GDPR (spec 4.1.2): uklaw-001, uklaw-004, uklaw-009
- Computer Misuse Act 1990 (spec 4.1.3): uklaw-002, uklaw-005, uklaw-010
- Equality Act 2010 (spec 4.1.4): uklaw-003, uklaw-007, uklaw-011
- Intellectual Property (spec 4.1.5): uklaw-006, uklaw-008, uklaw-012

Three scenarios per tier. Three difficulty levels spread across the set: clean, grey, edge.

## Spec source

T-Level Technical Qualification in Digital Production, Design and Development. Version 1.4, April 2024. Content Area 4: Legislation and regulatory requirements.

## Citations

All citations to UK legislation (sections of the Computer Misuse Act, Equality Act, UK GDPR articles) were verified against legislation.gov.uk, ICO guidance, CPS guidance, and NCSC guidance on 24 April 2026.

Two caveats on IP citations specifically:

1. The T-Level spec sub-section 4.1.5 is titled "Intellectual Property Act." The relevant primary legislation for source code copyright is the Copyright, Designs and Patents Act 1988, not the Intellectual Property Act 2014 (which is largely amendments to design law). Scenarios in the IP tier name both. Whether this matches Pearson's marking convention is not confirmed.

2. Specific section numbers within the CDPA are not stated in the IP scenarios because they were not independently verified. The Acts are named with the rele