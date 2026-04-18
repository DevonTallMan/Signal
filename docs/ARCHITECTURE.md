# Signal Architecture

Welcome. This document is for a developer joining Signal on placement
or a similar short-term engagement. Read it once on day one. Come back
to specific sections when you need them.

You should already have Git, Node 20 or newer, and a text editor you
are comfortable with. You should be familiar with React at a basic
level, and you should know what HTML, CSS, and JavaScript do. You do
not need prior experience with Astro, Keystatic, Markdoc, or
Cloudflare. Those are explained below.

## What Signal is and what it does

Signal is a study platform for students taking T-Level Digital
Production, Design and Development (specifically the core component).
Its differentiator is not the content it teaches; other platforms
teach the same syllabus. Its differentiator is that it explicitly
teaches students _how to answer_ extended-response exam questions,
using a framework called the **Answer Arc**: Name, Explain, Impact.

The live site is at `https://signal-dev-3bx.pages.dev`. Look at it
before you read any further. The three top-level sections on the home
page, Paper 1, Paper 2, and Method, encode the whole product
philosophy. Paper 1 and Paper 2 are the content students revise.
Method is the section that teaches them how to answer. A student who
engages with Method before starting Paper 1 is, empirically, a
student who leaves fewer marks on the table.

That framing matters for how you'll work here. Every feature we
consider adding is asked one question first: does this help a student
structure a better answer? If not, it probably does not belong on
Signal, at least not yet.

## Getting it running locally

Clone the repo and install dependencies.

```
git clone https://github.com/DevonTallMan/Signal.git
cd Signal
npm install
```

Run the dev server.

```
npm run dev
```

You should see something like `Local: http://localhost:4321/` in the
terminal. Open that URL in a browser. Signal loads.

In a second browser tab, open `http://localhost:4321/keystatic`. This
is the authoring interface, explained below. It runs locally only,
never in production.

To stop the dev server, press Ctrl-C in the terminal.

To build the production-ready static site:

```
SKIP_KEYSTATIC=true npm run build
```

The output is in `dist/`. You can preview it by running
`npx serve dist`, but for most day-to-day work the dev server is
what you want.

To run the three CI checks locally before pushing:

```
npm run typecheck
BASE_REF=origin/main node scripts/check-assessment-ids.mjs
BASE_REF=origin/main node scripts/check-status-lifecycle.mjs
```

These are the same three checks that GitHub Actions will run on your
PR. Failing them locally means the PR will fail; passing them locally
means it will almost certainly pass on GitHub too.

If any of the above doesn't work, ask. That is a setup bug worth
fixing for the next contributor, not something you should struggle
through.

## The stack, and why each piece is there

Signal is a static site built with **Astro**. Astro compiles the
content collections and page templates into plain HTML at build time.
There is no server rendering a page per request and no client-side
framework hydrating the page after it loads. A student's browser
downloads finished HTML and displays it. This is deliberate. A study
platform that loads in under a second on a three-year-old phone over
patchy college Wi-Fi is a platform students actually use.

Content is authored in **Markdoc**, a markdown dialect from Stripe
that extends plain markdown with structured tags when you need them.
Topic pages are Markdoc files with YAML frontmatter, stored in the
repo at `src/content/topics/`. You'll write new topic files by
copying an existing one and editing the fields.

The content schema is enforced by two systems in tandem.
**Keystatic** provides the authoring UI. When you run `npm run dev`
and visit `/keystatic`, you can create and edit topics in a
form-based interface instead of hand-editing YAML. Keystatic writes
the resulting files back to `src/content/topics/` and you commit
them with a normal `git commit`. **Astro Content Collections** (via
the Zod schema in `src/content.config.ts`) enforce the same shape
at build time, independently of Keystatic, so a topic authored by
hand also has to conform.

Why two schemas for the same thing? Keystatic's schema drives the
form UI. Astro's Zod schema drives the build-time validation. They
mirror each other deliberately. When you extend a field, you update
both. If they drift, the Zod schema wins (Keystatic is just a
convenience layer).

Deployment is **Cloudflare Pages**. Every push to `main` triggers a
Cloudflare build which runs the same `SKIP_KEYSTATIC=true npm run
build` and serves the output at `signal-dev-3bx.pages.dev`. Every PR
gets its own preview URL so you can see your change rendered before
it merges.

A few more components worth naming because you'll see them referenced:

**Firebase** is used by the legacy Edtech site for authentication and
student progress. Signal will eventually talk to Firebase too, but it
does not yet; the Signal repo is currently content-only. When we wire
authentication in, the client-side code will talk directly to
Firestore using the same SDK the old site uses.

**AXIOM-7** is an existing Cloudflare Worker that proxies the Groq
LLM API. Groq serves the `llama-3.3-70b-versatile` model, which
Signal uses to mark students' extended-answer submissions against the
Answer Arc rubric. The Worker exists so the Groq API key is never in
the browser. AXIOM-7 is not part of this repo; it runs at
`msm-axiom-proxy.morrischristopher675.workers.dev`.

**GitHub Actions** runs the three required CI checks on every PR.
These are explained in their own section below.

## Repository layout

Start in the top-level `src/` directory and work outwards.

```
src/
  content.config.ts         Zod schema for content collections
  content/
    content-areas/          One file per top-level section (e.g. 6-1.mdoc)
    topics/                 One file per topic (e.g. 6-1-1-data-types.mdoc)
  components/               Astro components used by pages
  layouts/                  Shared page shells
  pages/
    index.astro             Home page
    content-areas/[code].astro   Content area index pages
    topics/[slug].astro     Individual topic pages
  styles/                   Global CSS
keystatic.config.ts         Keystatic admin UI schema (mirrors content.config.ts)
astro.config.mjs            Astro build config
scripts/                    The three CI check scripts
.github/workflows/          GitHub Actions CI definitions
public/                     Static assets copied to dist/ unchanged
docs/                       You are here
```

The split between `content/content-areas/` and `content/topics/` is
worth understanding. A content area is a top-level grouping such as
"6.1 Data and Information" or the special "Method" section. Topics
live within areas. A topic has a `content_area` frontmatter field
that references an area by its filename slug.

The split between `pages/` directories and their bracketed filenames
is Astro's dynamic routing. `[slug].astro` means "build one HTML page
per topic, using the topic's `slug` as the URL path." You write the
template once; Astro generates the pages.

## Content and the authoring loop

Every topic has the same shape: YAML frontmatter with structured
metadata, followed by Markdoc body. The frontmatter is the most
opinionated part of the system. Look at `src/content/topics/
m-1-1-worked-examples-data-structures.mdoc` for an example of a
published topic.

The fields that matter most:

- `status` is one of `draft`, `review`, `published`, or `archived`.
  Only `published` topics appear on the site for students. The CI
  enforces rules about what a published topic must have.
- `section_id` is the unique identifier. It persists forever; once a
  topic is published with a given section ID, that ID is part of
  students' progress records in Firestore and cannot change.
- `content_area` and `paper` are the two fields that control where
  the topic appears in navigation.
- `authors` and `reviewers` are lists of author IDs. A published
  topic must have at least one reviewer. The same person can
  currently be both author and reviewer (you'll get a warning, not a
  failure, about self-review).
- `last_reviewed` is the date editorial review was signed off. If
  you modify a published topic's content, you must also update this
  date. The CI enforces this.
- `assessments` is the structured list of questions for the topic.
  Multiple-choice and extended-answer (N.E.I.) are both supported.
  Each question has a stable ID that, like `section_id`, must not
  change once the topic is published.

The authoring loop for adding a new topic:

1. Pull the latest `main`, create a feature branch.
2. Copy an existing topic as a template.
3. Either edit the copy directly, or run `npm run dev`, open
   `/keystatic`, and edit through the UI.
4. Set `status: draft` or `status: review` while you work.
5. When ready, set `status: published`, make sure `reviewers` has at
   least one entry, and make sure `last_reviewed` is today.
6. Commit, push, open a PR.
7. CI runs three checks. Fix any failures. Merge when green.
8. Cloudflare Pages deploys automatically from `main` and the topic
   appears on the live site within 2 to 4 minutes.

Do not change the `section_id` or any question ID on a published
topic. The CI will stop you. If you genuinely need to, the procedure
is documented in `AUTHORING.md`, and it involves explicitly
archiving the old topic and publishing a new one.

## The CI system

Every PR runs three GitHub Actions jobs that must all pass before the
branch can merge to `main`. The checks exist because content errors
in a production study platform waste students' time and damage
trust. Catching them in CI is cheap; catching them after a student
has revised with a broken topic is not.

**Assessment ID stability** (`scripts/check-assessment-ids.mjs`).
Compares the assessment question IDs on each topic in the PR against
the same topic on `main`. If a topic was previously published with
question `6-1-1-mcq-1` and the PR changes that ID, the check fails.
This protects student progress records that reference questions by
ID. Renaming is not a backwards-compatible change; it is a silent
data corruption waiting to surface later.

**Status lifecycle** (`scripts/check-status-lifecycle.mjs`).
Enforces three rules about topics marked `status: published`:
R1 they must have at least one reviewer; R2 they must have a
`last_reviewed` date; R3 if their content changed from `main`, they
must have a new `last_reviewed` date. There's also a warning (W1)
if every reviewer is also an author, which is the self-review case
and fine for now but worth flagging for future multi-author
workflows. This check is the structural evidence of editorial
review. It doesn't verify that review happened; it verifies that
someone claimed it did.

**Astro schema check** (`npm run typecheck`, which runs `astro
check`). Runs Astro's type checker over the whole codebase.
Catches broken references (a topic pointing to a content area that
doesn't exist), duplicate slugs, frontmatter that doesn't match the
Zod schema, and TypeScript errors in `.astro` component code. This
is the structural contract between content and the code that
renders it.

You will hit these checks. When you do:

- If Assessment ID stability fails, you probably changed a question
  ID on a published topic. Either restore the old ID or archive the
  old topic and create a new one.
- If Status lifecycle R3 fails, you modified a published topic's
  body but didn't bump `last_reviewed`. Update the date.
- If Astro schema check fails, the error message points at the
  file and line. Read it. Nine times out of ten it's a typo in
  frontmatter or a reference to something that doesn't exist.

Branch protection is set so that none of these can be bypassed. If
one fails, the merge button greys out until you fix it and push
again. This is not to be annoying; it is the only thing preventing
silent content bugs from shipping to students.

## Why we don't use a traditional CMS

You might wonder why Signal doesn't use Contentful, Strapi, Sanity,
or one of the many hosted headless CMS products. Each was
considered and rejected.

A hosted CMS puts the content in someone else's database, behind
their API, under their pricing. Signal's content is its core asset.
Keeping it in Git means it's versioned, branchable, diff-able,
backup-able as part of the code repo, and owned. It also means the
editorial workflow (PR, review, merge) is the same for content as
for code, which is a significant simplification.

Keystatic is specifically a Git-based CMS. It writes files to the
repo and commits them. The authoring experience is CMS-shaped; the
storage is Git-shaped. This pattern is called _content as code_ and
it's well-suited to small, editorially-careful projects like
Signal. A hosted CMS would be the right choice if we had hundreds
of authors editing concurrently; we have one.

## How this repo was built (a note on AI collaboration)

Signal was built primarily by one person with AI assistance. Claude
(an AI assistant from Anthropic) was used to draft CI scripts,
produce the initial worked-example content, explain architectural
trade-offs, and act as a code reviewer. The repo was curated by a
human editor (the project owner) who made every decision, reviewed
every PR, and approved every merge.

This is flagged here for two reasons. First, because you may find
the same pattern useful on placement work. Signal is an existence
proof that a small team plus AI assistance can ship a real product
in a reasonable timeframe. Second, because you'll encounter
artefacts in the repo (commit messages, doc prose, some of the
Method content) that were AI-drafted before human review. These are
still committed under the human owner's git identity because the
human curated them; this is the norm for this repo.

You are encouraged to use AI tools on your work here. The only rule
is that a human is accountable for every line that merges to `main`.
The CI checks, the PR review, and your own judgement are the
filters. Nothing lands in production that a human hasn't explicitly
signed off.

## Lessons learned (for your own toolkit)

This repo was not built perfectly. A few mistakes made during
construction are worth knowing so you can avoid them or spot them.

The first CI workflow had `cache: 'npm'` enabled in the GitHub
Actions setup-node step, but no `package-lock.json` existed in the
repo yet. The first CI run failed with "Dependencies lock file is
not found." Fix was to remove the cache directive. Lesson: workflow
features are not free; enable what you need and can support.

The Content Integrity workflow had a `paths` filter limiting it to
PRs touching content files. This interacted badly with the branch
protection rule requiring the check to pass: PRs not matching the
filter left the check in `Expected` state forever, blocking merge.
Fix was to remove the filter and let the check run on every PR.
Lesson: path filters and required status checks are a bug surface;
prefer always-run checks at this scale.

A production deployment was initially set up as a Cloudflare Worker
rather than a Cloudflare Pages project, because Cloudflare's UI
subtly leads you there. Static sites belong on Pages. Lesson: when
a cloud provider's UI offers two similar-sounding options, confirm
which one you actually need.

Commits were occasionally pushed directly against main-branch
expectations that didn't hold, resulting in non-fast-forward push
failures that had to be resolved with rebases. The pattern that now
prevents this is: every GitHub Actions workflow that does anything
mutating includes a "fetch origin main, merge fast-forward only"
step immediately after checkout. Not strictly necessary for a
pure-check workflow like the ones here, but the reflex is a useful
one to have.

Branch protection on a single-author repo needs to be configured
with "Require approvals" set to 0 or unticked. GitHub doesn't allow
you to approve your own PR, so a requirement for 1 approval on a
solo repo creates a deadlock. Turn it on properly once a second
contributor exists.

These are small issues. Bigger ones will arrive during your
placement. The expectation is that you spot them, document them the
same way, and leave the project better than you found it.

## Where to go next

When you have this doc loaded and the repo running locally:

1. Read `AUTHORING.md` in the same `docs/` directory. It covers the
   content-author's perspective, which is the other half of how
   Signal works.
2. Read the two Method topics at `src/content/topics/
   m-1-1-worked-examples-data-structures.mdoc` and
   `src/content/topics/m-2-1-worked-examples-naming.mdoc`. They
   are both the content Signal actually serves and a good example
   of the house voice for student-facing prose.
3. Look at the two CI scripts in `scripts/`. They are small, well-
   commented Node scripts with no dependencies beyond `gray-matter`.
   Understanding them is a quick way to understand what the system
   cares about.
4. Make a trivial PR to prove the workflow works for you. Fix a
   typo, tweak a phrase, update a comment. See it go through CI,
   see it merge, see it deploy. That's the loop. Every change you
   make will follow the same path.

Welcome to Signal. Ask for help early, not late.
