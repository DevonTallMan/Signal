# Signal Starter

Astro 5 plus Keystatic plus Markdoc. Content-as-data foundation for the Signal
platform.

## What this is

A minimal but functional starter that proves the content pipeline end to end.
Three collections (topics, authors, content-areas), three page templates
(home, content-area index, topic detail), and seed data for one author, two
content areas, and one published topic. The assessment runner is not yet
built; topic pages show a placeholder summarising how many MCQs and NEI
questions are attached.

Styling is deliberately minimal. The Signal design tokens are defined in
`src/styles/global.css` so the visual identity is recognisable, but this is
not the production design pass.

## Prerequisites

Node 20 or newer. npm, pnpm, or yarn (the commands below assume npm). A
GitHub account if you intend to use GitHub-backed storage for Keystatic in
production.

## First run

```
npm install
cp .env.example .env
npm run dev
```

The site runs at `http://localhost:4321`. The Keystatic admin UI runs at
`http://localhost:4321/keystatic`.

By default `.env.example` sets `KEYSTATIC_STORAGE_KIND=local`, which means
Keystatic writes directly to the local filesystem. This is the right mode
for early development. No GitHub auth required.

## Switching to GitHub storage

Once you want to author content through the deployed site, comment out the
`KEYSTATIC_STORAGE_KIND` line (or set it to anything other than `local`) and
confirm `KEYSTATIC_GITHUB_REPO` points at the right repo. Keystatic will
then require GitHub authentication and commit changes as pull requests.

Contributor onboarding with GitHub storage is a separate document. The short
version: each contributor is added as a collaborator on the repo with write
access; they log in to `/keystatic` with their GitHub account; their saves
land on a branch named after them; pull requests open automatically when
they mark a topic ready for review.

## Project layout

```
src/
  content/
    authors/          Contributor profiles
    content-areas/    IfATE topic area reference data
    topics/           The teaching units
  pages/
    index.astro       Home (lists content areas by paper)
    content-areas/
      [code].astro    Lists topics in one content area
    topics/
      [slug].astro    Single topic view
  components/
    AuthorByline.astro
    TopicMeta.astro
    AssessmentPlaceholder.astro
  layouts/
    BaseLayout.astro
  styles/
    global.css        Signal design tokens + base styles
  content.config.ts   Astro content collection schemas (mirrors Keystatic)

keystatic.config.ts   Source of truth for the content schema
astro.config.mjs      Astro + integrations
```

## Editing content

The recommended route is the Keystatic UI at `/keystatic`. Open a collection,
create or edit an entry, save. Keystatic writes `.mdoc` files directly into
`src/content/<collection>/`.

Editing the `.mdoc` files in a text editor also works. The frontmatter must
match the schema or Astro will fail to build. A failed build is useful
feedback, not a problem.

## What the build filters out

The topic page `getStaticPaths` filter is `status === 'published'`. Topics
with status draft, review, or archived never render on the live site. This
is intentional. Drafts and in-review content live on main but stay invisible
to students until they are published.

## What is deliberately not here yet

The assessment runner. Topic pages render a summary of how many MCQs and NEI
questions a topic has, but clicking through to a quiz is not implemented.
The schema is stable; the UI is deferred.

The AXIOM-7 integration. Mark schemes are captured in the NEI question
schema and will feed AXIOM-7 when the runner is built. No changes to the
existing Worker are required.

CI checks. Two checks should exist before contributors are added. A guard
against assessment question IDs being renamed on existing topics. A guard
against drafts or in-review content accidentally being promoted to
published without an editorial review field being filled. Both belong in a
GitHub Actions workflow, not in this starter.

Firestore wiring. Student progress tracking is a separate concern and lives
in the existing `DevonTallMan/Edtech` repo for now. Once the new site is at
feature parity with the old one, progress records will start referencing
topic slugs and assessment question IDs from this schema.

## Deploying

This is a static Astro build. Two reasonable hosts.

Cloudflare Pages. Connect the repo, set build command to `npm run build`,
output directory to `dist`. Environment variables for Keystatic need to be
set in the Pages project settings, not in `.env` (which is gitignored).

GitHub Pages. Works but has no preview deployments per PR, which matters
once contributors are arriving. Cloudflare is the better default.

Neither host supports the Keystatic admin UI in production for GitHub
storage without additional configuration. The pattern documented in the
Keystatic community (static Astro site served from one host, admin UI
served from Netlify or equivalent for the `/keystatic` route) is the right
setup once you need remote authoring. For the first few weeks a local dev
setup is sufficient.

## Known gaps worth fixing early

Before inviting a second contributor, add the two CI checks described
above, a one-page contributor guide covering the status lifecycle (draft to
review to published), and a PR template that prompts the reviewer to
confirm learning outcomes match the content.

## Honest caveats

This starter has not been run through `npm install` and `npm run dev` by
the person who wrote it. Expect one or two small fixes in your first session.
The most likely issue is the Astro content collection `id` for entries
loaded via `glob` not matching what the page route expects; if a topic page
404s despite the file existing, inspect `topic.id` in the page frontmatter
and adjust the glob pattern or `slug` field accordingly.
