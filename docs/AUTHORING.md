# Authoring for Signal

This is the guide for teachers contributing content to Signal. It is short on
purpose. Read it once before you author your first topic. Come back to the
specific sections when you hit them.

If you know GitHub and you are comfortable writing in Markdown, you can start
authoring in about twenty minutes.

## What Signal is, in one paragraph

Signal is a T-Level Digital study platform built by practising FE teachers.
It covers content from both core papers, and it teaches students to structure
extended answers using a framework called the Answer Arc. The content you
write sits alongside that framework. A student reads your explanation, tests
their recall with your MCQs, then practises a full extended answer against
your scenario using the Answer Arc.

Signal is not a textbook. It is not a revision app. It is not YouTube. It
earns its place by being written by the teachers actually delivering this
course and by giving students structured feedback on their answer writing
that nothing else in the market provides.

## The Answer Arc, quickly

Every extended answer question on Signal is marked against three components.

**Name.** The student must name the relevant technical concept, process, or
piece of terminology. Naming is not the same as describing. "A CRM" is a
name. "A system that stores customer data" is a description that dodges the
name.

**Explain.** The student must explain the mechanism by which the named
concept works or the distinction that makes it the right answer. Explain
without Name is a description floating free. Explain after Name is the
candidate demonstrating understanding.

**Impact.** The student must describe the concrete business or technical
consequence of the concept being present, absent, or chosen. Impact is the
mark students most often miss. They name the concept, they explain it, they
stop. An answer without Impact is an essay without a conclusion.

Every NEI question you author needs a mark scheme that covers all three. The
Impact expectation is the one to spend the most time on. If you find
yourself writing a vague impact, the question is probably not well-formed
yet.

## Before you write anything

Decide three things before you open Keystatic.

**Which topic.** Pick a topic that you have actually taught, not one you have
researched. The authority of Signal content comes from the writer having
stood in front of students and watched them fail to answer it properly. If
you have never taught it, you will write a textbook summary rather than a
pedagogical intervention.

**Which paper and which content area.** Check the spec PDF in the shared
drive. Confirm the topic you have in mind sits inside an IfATE content area
that is already seeded in Signal. If it does not, flag in the Slack channel
before writing, because the content area needs to exist first.

**What the weakest answer looks like.** In your head or on paper, write the
worst plausible student answer to the extended question you are going to
set. That bad answer is the thing your explanation, your MCQs, and your
mark scheme are all implicitly arguing against. Holding it in mind keeps the
content focused on the real teaching gap rather than on the content area in
general.

## The authoring workflow

Open Keystatic at `your-signal-url/keystatic`. Log in with GitHub. You are
now looking at three collections.

**Authors.** If this is your first contribution, create an author record for
yourself. ID is lowercase hyphenated (example: `priya-patel`). Keep the bio
short, two or three sentences. Your name is going on every topic you write.

**Content Areas.** You should not need to create these. If the area you need
is missing, stop and raise it in Slack.

**Topics.** This is where you spend most of your time. Create a new entry.
The fields step you through what you need.

Fill the fields top down. Title, section ID, content area, paper. Set
`status` to `draft` while you work. Add yourself to `authors`. Leave
`reviewers` empty until editorial review is complete.

Write the explanation in the main content area. Use the headings, the
callouts, the code blocks as you need them. Aim for 400 to 800 words for a
typical 25 minute topic. If you find yourself writing 2000 words, the topic
is actually two topics.

Add assessments at the bottom. Three to five MCQs plus one or two NEI
questions is the standard shape for a topic. The assessments are not
optional; a topic without assessments does not teach answer structure, and
without that there is no reason for the topic to be on Signal.

Save. Keystatic commits the file to a branch named after you, and when you
are ready it opens a pull request.

## The review gate

A topic can be `draft`, `review`, `published`, or `archived`. A pull request
to move a topic to `published` will fail CI unless the topic has at least
one entry in `reviewers` and a `last_reviewed` date set. This is
deliberate. It is the structural evidence that a human editor signed off
before students saw the content.

The flow is: you author in `draft`, you change `status` to `review` when
you think the topic is ready, you open the PR, the editorial lead reviews,
they add themselves to `reviewers`, set `last_reviewed` to today, change
`status` to `published`, and merge.

Until the second contributor lands, the lead author reviews their own work.
CI will warn about self-review but will not block. Once a second
contributor is active, self-review stops being acceptable.

## Writing style, the short version

Short sentences. Plain language where plain language works. Technical
precision where the topic demands it. Never sacrifice precision to sound
approachable; T-Level Digital students are learning a technical vocabulary
and softening it patronises them.

Address the reader as "you" sparingly. The explanation is not a pep talk;
it is a teacher leaning over the desk and pointing at the part of the
problem they keep getting wrong. Most paragraphs should be doing one of
three things: setting up a concept, contrasting two concepts, or showing
the consequence of getting a concept wrong.

Do not narrate your own structure. "In this topic we will learn about X
and then Y" is noise. Get to the thing.

Do not reproduce text from Pearson materials, textbooks, or the IfATE
specification. Paraphrase everything in your own words. If you find
yourself copying a sentence, stop and write what you actually know about
the concept from teaching it.

Do not use the words "examiner," "mark scheme," or "model answer" in
student-facing content. Signal's credibility comes from being written by
practising teachers; we do not claim exam board endorsement we do not have.

## Writing good assessments

MCQs are for recall and common misconceptions. Good MCQs test a specific
confusion you have actually seen students make. Bad MCQs have one
obviously right answer and three obviously wrong answers, which tests
nothing.

The distractor for each MCQ should be something a student with partial
understanding would plausibly pick. "Which is a primitive data type:
integer, list, boolean, float?" works because "list" is exactly what a
student who half-remembers the lesson will reach for.

Feedback after an incorrect answer is required. It is not "the correct
answer is B." It is a sentence that explains why the chosen distractor was
plausible and what separates it from the right answer. This is the most
valuable prose a contributor writes; spend as long on feedback as on the
question itself.

NEI questions are where Signal earns its subscription fee. A good NEI
question gives the student a scenario with enough specificity that a vague
answer is obviously vague, and demands an answer that names, explains, and
impacts within a business or technical context. "Explain one data
structure suitable for this task" is a good stem. "Describe data
structures" is not.

The mark scheme for an NEI question is read by AXIOM-7 and used to mark
student answers. It needs to be precise and complete. The `name_expected`
field lists the acceptable concepts the student might name. The
`explain_expected` field states the mechanism that makes it right. The
`impact_expected` field states the concrete consequence, with enough
specificity that a student answer of "it helps the business" does not
earn the mark.

Write an exemplar answer yourself. If you cannot write an answer that
demonstrates all three components in under 60 words, the question is
probably underspecified.

## Question IDs and why they must never change

Every MCQ and NEI question has an `id` field. CI will reject your PR if
you rename an ID on a topic that is already published. This is because
student progress records in the backend reference questions by ID.
Renaming an ID orphans data silently.

If you notice a typo in a question ID after publish, do not fix it in
place. Raise it with the editorial lead. The fix is always a migration,
never a rename.

## Before you open the PR

Run the checks locally if you can. From the repo root:

```
npm run check:content
npm run check:lifecycle
```

These are the same checks CI runs. Catching failures locally is faster
than waiting for a failed CI run.

Read the topic once more as if you were a student who knows nothing.
Every sentence must either teach something or set up the next sentence.
If you hit a sentence that does neither, cut it.

Confirm your assessments actually test the explanation. A common failure
is an explanation about concept A with an MCQ about concept B. The two
halves of the topic must be tightly coupled.

## What happens after merge

Astro rebuilds the site. The topic appears at
`/topics/<your-slug>` within one or two minutes. Your byline appears at
the top. Your work is now load-bearing for a real student's exam
preparation. Take it seriously.

## Getting help

Slack channel for editorial questions and spec ambiguities. Pull request
comments for content feedback. Issues on the repo for bugs or
suggestions about the authoring experience.

Do not Slack DM the editorial lead for topic feedback. Public channels
and PR threads preserve the reasoning for future contributors.

## One final thing

Signal is only as good as the teachers writing for it. You were invited
because your teaching is good. Write the content the way you would
explain the topic to a student sitting next to you who is three weeks
from the exam and has realised they do not understand. That voice is the
one the platform needs.
