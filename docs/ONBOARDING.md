# Onboarding a Contributor

Short checklist for the editorial lead, not the contributor. Run through
this when inviting a new teacher to author for Signal.

## Before they arrive

- [ ] Decide what you are asking them to write. Pick a specific topic, not
      "have a go at something from Paper 1." Unfocused asks produce
      unfocused content.
- [ ] Confirm the content area they will write in is already seeded. If it
      is not, seed it yourself before they arrive.
- [ ] Read their author agreement (see `AGREEMENT.md` once drafted) to
      confirm they have signed.

## Access

- [ ] Add them as a collaborator on the Signal repo with Write access.
      Settings → Collaborators → Add people.
- [ ] Do not give them admin. Branch protection on `main` is the safety
      net; admin bypasses it.
- [ ] Confirm branch protection on `main` is enabled. Settings → Branches.
      Require pull requests, require at least one approval, require status
      checks to pass.

## First contact

- [ ] Share the link to `AUTHORING.md`. Ask them to read it before
      starting. Do not explain it verbally; the document exists so you do
      not have to.
- [ ] Walk them through one topic in Keystatic. One fifteen-minute screen
      share replaces an hour of text explanation.
- [ ] Tell them the first topic will take longer than subsequent ones.
      Budget their expectations accordingly.

## Their first PR

- [ ] Review the content on its own terms first. Ignore the schema and
      formatting on the first pass. Is the teaching good?
- [ ] Then check the schema. CI will catch the hard failures; you check
      the things CI cannot, such as whether the feedback text is actually
      helpful.
- [ ] Request changes in the PR, not over Slack. The PR thread is the
      audit trail.
- [ ] Merge when approved. Add yourself to `reviewers` and set
      `last_reviewed` during review, not on the contributor.

## After the first PR is merged

- [ ] Ask the contributor for honest friction feedback. What confused
      them? What was slower than expected?
- [ ] Log any authoring friction in a separate issue. Do not fix it mid-
      flow; batch the improvements.
- [ ] If the content is good, tell them so. If it is not good yet, tell
      them what specifically needs to improve and why. Vague
      encouragement trains contributors to ship weaker work.

## Ongoing

- [ ] Review within 48 hours of PR open. Longer delays kill contributor
      momentum.
- [ ] Keep self-review to zero once two or more contributors are active.
      The CI warning exists for a reason.
- [ ] Once three or more contributors are active, rotate review duty. One
      person doing all editorial becomes a bottleneck and then a single
      point of failure.
