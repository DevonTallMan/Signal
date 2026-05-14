# Navigation Test Guide

**Scope:** acceptance testing for the Signal site's navigation surface.
**Audience:** a developer or QA tester who does NOT need to know the
codebase, only the live site.
**First applied to:** PR #100 (feat: navigation overhaul) merged
2026-05-14. The guide remains usable for any subsequent navigation
change; update the "expected build" and the branch preview URL as
appropriate.

This guide is structured as a checklist a tester works through
sequentially. Each section tests one navigation feature plus its
interactions with the rest. The bug-watch section at the end
captures things to specifically look out for during the walkthrough.

## 0. Setup

- [ ] Open the live site (or the relevant Cloudflare branch preview URL)
  in a desktop browser. Branch preview URLs follow the pattern
  `https://feat-{branch-with-dashes}.signal-dev-3bx.pages.dev`.
- [ ] Open DevTools (F12) and keep the console visible. **No console
  errors should appear at any point during this guide.** If one does,
  capture the URL and the error message.

## 1. Home page (`/`)

### Cyberpunk top nav

- [ ] Top nav shows: `SIGNAL.` brand, then nav links `CONTENT AREAS`,
  `ACTIVITIES`, `ANSWER ARC`, `GITHUB`, plus a sign-in CTA.
- [ ] Clicking `CONTENT AREAS` scrolls smoothly to the `#papers` section.
- [ ] Clicking `ACTIVITIES` scrolls smoothly to the `#activities` section.
- [ ] Clicking `ANSWER ARC` scrolls smoothly to the `#answer-arc` section.
- [ ] Clicking `GITHUB` opens `https://github.com/DevonTallMan/Signal`
  in a **new tab**.

### Hero CTAs

- [ ] `ACCESS THE PLATFORM →` button navigates to `/signin`.
- [ ] `SEE CONTENT AREAS` button scrolls to `#papers`.

### Papers section

- [ ] Two cards: `// CORE PAPER ONE` and `// CORE PAPER TWO`.
- [ ] Hovering each card produces a subtle lift (border colour, shadow).
- [ ] Paper One card links to `/content-areas/6-1`.
- [ ] Paper Two card links to `/content-areas/7-2`.

### Activities section

- [ ] Section title: **"Three drills. One Answer Arc."**
- [ ] Three cards in a row on desktop (≥768px): Risk Classifier,
  Sort & Match, Twin Tracks.
- [ ] Each card has: green eyebrow (e.g. `// UK LEGISLATION`), Orbitron
  title, description paragraph, italicised "Drills the..." line with a
  green left border, green `START... →` CTA.
- [ ] Hovering each card produces a lift effect with a green border.
- [ ] Risk Classifier card navigates to `/content-areas/risk-classifier`.
- [ ] Sort & Match card navigates to `/content-areas/sort-and-match`.
- [ ] Twin Tracks card navigates to `/content-areas/twin-tracks`.
- [ ] Below the cards: `SEE ALL ACTIVITIES IN ONE PLACE →` link
  navigates to `/activities`.

### Answer Arc section

- [ ] `AnswerArcDemo` interactive component renders.
- [ ] Below it: `SEE THE ANSWER ARC APPLIED ACROSS WORKED EXAMPLES →`
  link navigates to `/content-areas/method`.

## 2. BaseLayout persistent nav

Use any non-home page (for example, `/content` or
`/topics/m-1-1-worked-examples-data-structures`).

- [ ] Top nav shows: `SIGNAL` brand (green), then `Home`, `Activities`,
  `Content`, `GitHub`, then the auth nav on the right.
- [ ] `SIGNAL` brand links to `/`.
- [ ] `Home` links to `/`.
- [ ] `Activities` links to `/activities`.
- [ ] `Content` links to `/content`.
- [ ] `GitHub` opens the repo in a new tab.
- [ ] The nav is visible at the same position on every BaseLayout page.
  Test on at least three different page types: a topic page, a
  content-area page, and an activity page.

## 3. `/activities` landing page

- [ ] Visit `/activities` directly or via a nav link.
- [ ] Breadcrumb at top reads: `HOME / ACTIVITIES` (last item is
  marked as the current page, with no link).
- [ ] `HOME` link in the breadcrumb navigates to `/`.
- [ ] Page title: **Activities**.
- [ ] Three cards listed vertically: Risk Classifier, Sort & Match,
  Twin Tracks.
- [ ] Each card has an eyebrow, title, description paragraph, and a
  green "Drills..." line.
- [ ] Clicking each card navigates to the correct activity page.

## 4. `/content` landing page

- [ ] Visit `/content`.
- [ ] Breadcrumb reads: `HOME / CONTENT`.
- [ ] Three sections shown: `Paper 1`, `Paper 2`, `Method`.
- [ ] Under Paper 1: cards for `5-1 …` and `6-1 …` with topic counts.
- [ ] Under Paper 2: card for `7-2 …` with "0 published topics"
  (expected; no Paper 2 topics exist yet).
- [ ] Under Method: card for `M How to Answer` with a non-zero topic
  count.
- [ ] Clicking any card navigates to the corresponding
  `/content-areas/{code}` page.

## 5. Content-area pages

### `/content-areas/5-1`

- [ ] Breadcrumb: `HOME / CONTENT / PAPER 1 · 5-1 …`.
- [ ] Five topic cards listed (5-1-1 through 5-1-5).
- [ ] Each card links to its `/topics/5-1-{slug}`.
- [ ] "← Back to home" link at the bottom works.

### `/content-areas/6-1`

- [ ] Breadcrumb: `HOME / CONTENT / PAPER 1 · 6-1 …`.
- [ ] One topic card: 6-1-1 Data Types.
- [ ] Card links to `/topics/6-1-1-data-types`.

### `/content-areas/7-2`

- [ ] Breadcrumb: `HOME / CONTENT / PAPER 2 · 7-2 …`.
- [ ] Page shows "No published topics in this area yet."
- [ ] Back-to-home link works.

### `/content-areas/method`

- [ ] Breadcrumb: `HOME / CONTENT / METHOD · M HOW TO ANSWER`.
- [ ] Renders the methodology library layout (not the generic topic
  list).
- [ ] Answer Arc legend at the top with inline Name/Explain/Impact
  colour highlights.
- [ ] Three or more worked-example cards (M.1.1, M.2.1, M.3.1 at
  minimum).
- [ ] Each card links to its `/topics/m-…` page.

## 6. Activity pages

### `/content-areas/risk-classifier`

- [ ] Breadcrumb: `HOME / ACTIVITIES / RISK CLASSIFIER`.
- [ ] Activity loads (React island renders the classifier).
- [ ] Methodology callout below the lede with the
  `// WHAT THIS DRILLS` kicker.
- [ ] Footer block with `// WHAT TO DO NEXT` plus links to
  `/content-areas/sort-and-match` and `/content-areas/method`. Both
  links work.

### `/content-areas/sort-and-match`

- [ ] Breadcrumb: `HOME / ACTIVITIES / SORT & MATCH`.
- [ ] Activity loads.

### `/content-areas/twin-tracks`

- [ ] Breadcrumb: `HOME / ACTIVITIES / TWIN TRACKS`.
- [ ] Activity loads.

## 7. Topic pages

Pick at least three: one from 5-1, the 6-1-1 topic, and one Method
topic.

- [ ] Breadcrumb reads: `HOME / CONTENT / PAPER N · {Area} / {Topic
  Title}` for non-Method topics, or `HOME / CONTENT / METHOD · M HOW
  TO ANSWER / {Topic Title}` for Method topics.
- [ ] All breadcrumb crumbs except the last are clickable links.
- [ ] The last crumb (current topic) is NOT a link.
- [ ] Topic body renders with the normal layout (byline, meta block,
  prose, optional drill panel, optional assessments).
- [ ] "← Back to {area}" link at the bottom of the page still works.

## 8. Accessibility checks

### Breadcrumb markup

- [ ] Inspect any breadcrumb in DevTools. Confirm: `<nav
  aria-label="Breadcrumb">`, `<ol>` list, `<li>` items, final crumb
  has `aria-current="page"`, separators have `aria-hidden="true"`.

### Keyboard navigation

- [ ] On the home page, press Tab repeatedly. Focus moves through the
  nav links, hero CTAs, then through each card in order.
- [ ] Focus is **visible** (outline or border) on every interactive
  element.
- [ ] Pressing Enter on a focused link navigates correctly.
- [ ] On a topic page, Tab through the breadcrumb. Each link is
  reachable and focus is visible.

### Screen reader (optional but recommended)

- [ ] With NVDA / VoiceOver / TalkBack, navigate to a topic page. The
  screen reader should announce "Breadcrumb navigation" and read out
  each crumb in order, marking the final crumb as "current page".

## 9. Responsive / mobile

Resize the browser to 600px wide (or use DevTools device emulation).

- [ ] Home page Activities section: three cards stack into a single
  column.
- [ ] Home page papers-grid: same.
- [ ] BaseLayout nav: still functional. If it wraps, links remain
  tappable.
- [ ] Breadcrumb wraps if needed; the trail remains legible.

Resize to 400px wide.

- [ ] All of the above still works.
- [ ] No horizontal scroll on any page tested in this guide.

## 10. External link safety

- [ ] On the home page cyberpunk nav: right-click `GITHUB` and inspect.
  Should have `target="_blank"` and `rel="noopener noreferrer"`.
- [ ] On the BaseLayout nav: same check. Same attributes.
- [ ] Clicking GitHub opens a new tab; the Signal tab is NOT navigated
  away from.

## 11. Reachability proof (end-to-end)

Starting from `/` with no manual URL typing, navigate to each of the
following pages in at most three clicks. Verify the path works.

- [ ] `/signin` — 1 click (hero CTA).
- [ ] `/activities` — 1 click from home (Activities section "see all"
  link) or from any BaseLayout nav.
- [ ] `/content-areas/risk-classifier` — 1 click (home Activities
  section card).
- [ ] `/content-areas/sort-and-match` — 1 click.
- [ ] `/content-areas/twin-tracks` — 1 click.
- [ ] `/content-areas/6-1` — 1 click (home papers-grid).
- [ ] `/content-areas/7-2` — 1 click.
- [ ] `/content-areas/method` — 1 click (home answer-arc follow-up).
- [ ] `/content-areas/5-1` — 2 clicks (home → any BaseLayout page →
  Content nav → 5-1 card).
- [ ] `/content` — 2 clicks (home → any BaseLayout page → Content nav).
- [ ] Any `/topics/5-1-X` — 3 clicks (home → BaseLayout nav → Content
  → 5-1 → topic).
- [ ] Any `/topics/m-X-X` — 2 clicks (home → method follow-up → method
  library card).
- [ ] `/topics/6-1-1-data-types` — 2 clicks.

If any of the above takes more than three clicks or hits a dead-end,
that's a navigation bug.

## 12. Bugs to specifically watch for

- **Broken breadcrumb on a topic with no content_area entry.**
  Unlikely given the seed data, but if a topic's `content_area`
  resolves to nothing, the middle crumb should fall back gracefully
  (the code uses an `if (area)` guard).
- **Method library cards not linking through.** A2 added a filter on
  `library_summary`; if a topic is missing that field, it is silently
  excluded. All three current Method topics have it set, so this
  should be fine; flag if it regresses.
- **Anchor scroll smooth-behaviour failing.** If `#papers`, `#activities`,
  or `#answer-arc` jumps abruptly instead of smooth-scrolling, that is
  a regression in the home page's JS.
- **Console errors on any page.** Especially "Cannot read properties
  of undefined" anywhere near breadcrumb rendering.
- **Aria attributes missing.** Inspect at least one breadcrumb to
  confirm the `aria-label`, `aria-current`, and `aria-hidden`
  attributes render.
- **Activities CTA on mobile cropping the description.** The cards
  have a fixed padding; check the description does not overflow.

## 13. Reporting

If you find a bug:

1. Note the page URL, the action that triggered it, and the expected
   vs actual behaviour.
2. If a console error: paste the full error text.
3. If a visual bug: a screenshot helps.

Report findings as PR comments on the open PR, or as a separate issue
tagged `nav-regression`.

## Maintenance notes

When new navigation features ship, update this guide:

- Add a new section testing the new feature.
- Add a new line to Section 11 (reachability proof) if a new page is
  introduced.
- Add to Section 12 any new failure mode worth watching for.

Sections 0, 8, 9, 10, and 13 are framework-stable and should rarely
change. Sections 1-7 follow the live site structure and will need
periodic adjustment as pages are added, removed, or renamed.
