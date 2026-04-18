## What changed

<!-- One or two sentences. What topic, what type of change. -->

## Type of change

- [ ] New topic (first publish)
- [ ] Content revision to a published topic
- [ ] New content area or author record
- [ ] CI, schema, or infrastructure change

## Author checklist

- [ ] I have taught this topic to real students
- [ ] The explanation is in my own words (no verbatim from Pearson, IfATE, or textbooks)
- [ ] Every MCQ has feedback text for both correct and incorrect answers
- [ ] Every NEI question has `name_expected`, `explain_expected`, and `impact_expected` filled in the mark scheme
- [ ] I wrote an exemplar answer and it demonstrates all three Answer Arc components
- [ ] Question IDs are unique within the topic and follow the `<section>-<type>-<nn>` pattern
- [ ] `npm run check:content` passes locally
- [ ] `npm run check:lifecycle` passes locally

## Reviewer checklist (fill on approval)

- [ ] Explanation teaches the concept; no filler
- [ ] Assessments test what the explanation covers
- [ ] NEI mark schemes are specific enough that vague student answers cannot score
- [ ] No copyright-risky phrasing from exam board materials
- [ ] Add self to `reviewers` in the topic frontmatter
- [ ] Set `last_reviewed` to today's date
- [ ] Change `status` to `published` if approved

## Notes for reviewer

<!-- Anything the reviewer should pay particular attention to. Ambiguity in
the spec, a phrasing choice you're unsure about, a question you couldn't
decide between two distractors. -->
