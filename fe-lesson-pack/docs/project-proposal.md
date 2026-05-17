# Project Proposal: FE Lesson Pack

A personal AI lesson planning tool, deployed fast and improved through use.

**Author:** [your name]
**Last updated:** May 2026
**Status:** Draft, not yet started
**Supersedes:** v1 (Hono + SQLite, learning-optimised). Goal priority has flipped, so the plan has too.

---

## 1. Purpose

Two goals. Where they conflict, the first wins.

**Goal A (primary): A working tool I will actually use.** Open it Sunday evening or Monday morning, type a topic, get a usable lesson pack in under a minute, keep a searchable history. The measure of success is whether I use it in real teaching, not whether the code is elegant.

**Goal B (secondary): Learn web development.** Still a goal, but not on a timeline. Learning happens through use, debugging, and incremental extension, not through deliberate phase plans.

The previous version of this proposal had B winning. It planned a three-month rebuild from fundamentals before I had a working tool. With A winning, that is the wrong sequence. A working tool that hides some implementation details from me beats a half-built tool that teaches me everything.

---

## 2. Scope

### In scope

- Deploy the already-written Firebase build to a real URL
- Use it for at least one half-term of real lesson planning
- Iterate on prompts and small features as pain points emerge from use
- Keep API costs visible and capped
- Treat operating the deployed app as the learning surface

### Out of scope

- Rebuilding the stack from scratch for learning purposes. If I want that, it is a separate project after this one is shipped and proven.
- Multi-user support, sharing, collaboration. One user.
- Mobile-native app. Web works on phone.
- Editing generated content in-place. Copy out, edit, paste back.
- New features that I have not felt the lack of in real use. No speculative building.

---

## 3. Architecture

Firebase. Already coded. Specifically:

- **Frontend.** React 18 + Vite + Tailwind, deployed to Firebase Hosting
- **Backend.** A single Cloud Function (`generate`) that proxies the Anthropic API
- **Database.** Firestore, with per-user lesson documents
- **Auth.** Firebase Auth with Google sign-in, optionally restricted to my email
- **Region.** `europe-west2` (London), keeps data in the UK
- **Cost.** Firebase free tier covers solo use entirely. Anthropic API usage is the only real cost.

### Honest assessment of this stack for my goals

It serves Goal A well. The code is written. The free tier is generous. Deploy is one command. No server to maintain.

It serves Goal B partially. Things it will teach me through use:
- Deploying a real app to a real URL
- DNS, custom domains, TLS certificates
- Environment variables and secrets in a production context
- Reading production logs and debugging remote failures
- The Firebase console: rules, indexes, billing, quotas
- React patterns when I extend the UI
- Prompt engineering when I iterate on outputs

Things it will not teach me, and that I accept I am deferring:
- SQL and relational database design (Firestore is NoSQL and hides much of the data layer)
- HTTP fundamentals (the Firebase callable Functions SDK wraps requests as RPC calls)
- Server operation (no server to operate)
- Authentication internals (Firebase Auth handles OAuth flows)

If I later decide these fundamentals matter, that is a separate project. The trigger for starting it is defined in section 7.

---

## 4. Plan

Four phases, the first three measured in days, not weeks.

### Phase 1: Get it deployed (1 weekend)

**Deliverable.** App is live at `https://[project-id].web.app`, signed in with my Google account, generating lessons.

**Steps.**
1. Create the Firebase project, upgrade to Blaze pay-as-you-go
2. Enable Authentication, Firestore, Functions
3. `firebase functions:secrets:set ANTHROPIC_API_KEY`
4. Fill in `web/.env` from the Firebase console
5. `firebase deploy`
6. Test generating one lesson end to end
7. Set an Anthropic billing alert at £20/month so a bug cannot drain my account silently
8. Set a Firebase budget alert at £5/month so I notice if free tier breaks

**Done when.** I have generated at least one full lesson pack at the deployed URL.

### Phase 2: Make it mine (1 weekend, optional)

**Deliverable.** Custom domain. Domain restriction on auth so only my email can sign in. Daily spend cap visible in the function logs.

**Steps.**
1. Buy a domain if I do not have one. Point it at Firebase Hosting via the console.
2. Edit `functions/index.js` to set `ALLOWED_EMAIL_DOMAIN` to my address, or check for the exact email string
3. Deploy and verify nobody else can sign in
4. Confirm the daily rate limit works by inspecting Firestore `usage` documents

**Done when.** The app is at `lessons.[mydomain].uk` and only I can use it.

### Phase 3: Use it for real (one half-term)

**Deliverable.** Honest data on whether the tool is worth keeping.

**No coding in this phase.** This is the part most projects skip. Use the tool for actual planning. Note what works and what does not. Resist the urge to fix small annoyances mid-term. Keep a list of pain points in a markdown file.

**Things to track informally.**
- How often I open it per week
- Which components I actually use (probably not all seven)
- What I edit after generation (signals weak prompts)
- Where the output disappoints me at the lesson type, level, or subject level
- Anthropic spend per month

**Done when.** Half-term ends. I have used it or I have not.

### Phase 4: Decide and iterate (ongoing, only if Phase 3 proved value)

**Deliverable.** Targeted improvements driven by real pain points.

**Decision tree at end of Phase 3.**

- *Used three or more times per week.* Tool is valuable. Continue. Pick the top two pain points from my notes and fix those. Repeat each half-term.
- *Used once a week or less.* Tool is borderline. Before iterating, ask honestly whether the problem is the tool or my planning habits. The fix may be a routine change, not a code change.
- *Used rarely or never.* Tool failed. Decommission it. Pay £0/month going forward. Take the lesson, do not throw good time after bad.

**Likely iteration targets, based on guesses I should not trust until Phase 3 data exists.**

- Better prompts for specific levels (T-Level outputs probably need different framing than Functional Skills)
- Search across the library
- Quick re-generate of a single component without redoing the form
- A subject-specific prompt template I can save and reuse

Each of these is a focused half-day to one-day extension. They are also each a chance to learn something specific: Firestore queries, React state patterns, prompt iteration.

---

## 5. What I will actually learn

Cumulative, not phased.

**By the end of Phase 1.** A real production deploy. The Firebase CLI. Secrets management. The shape of an environment variable file. The Cloud Functions logs view. What an Anthropic API key actually is and where it lives.

**By the end of Phase 2.** DNS A and CNAME records. TLS certificate provisioning (Firebase handles it but I see it happen). Auth provider configuration.

**By the end of Phase 4 (after a term).** Whatever the iteration work taught me. Likely some mix of Firestore query patterns, React component refactoring, prompt engineering, and reading production logs to diagnose intermittent issues. Specifics will depend on which pain points emerge.

What this stack will not teach me, and I am consciously deferring: SQL, HTTP internals, server operation, authentication mechanics. If I want those later, they become a separate project explicitly framed as learning, not delivery.

---

## 6. Risks

**The "I'll learn it later" risk.** Most often, "later" never comes. The Firebase build works, I forget I ever wanted to understand SQL, and a year passes. Mitigation: section 7 defines an explicit trigger for revisiting this.

**Anthropic API cost runaway.** A loop bug or a careless test could spend money fast. Mitigation: Anthropic billing alert and a per-user daily call cap in the Cloud Function (already coded).

**Firebase vendor lock-in.** If Google changes pricing, deprecates a product, or makes Firebase Auth more painful, I have to migrate. Mitigation: keep lesson data exportable. Add a "download all my lessons as JSON" feature in Phase 4 if Phase 3 confirms the tool is sticking.

**Maintenance drag.** Firebase upgrades, dependency upgrades, OAuth provider changes. Estimate: 30 to 60 minutes per quarter. Trivial if the tool is valuable, irritating if it is not.

**The tool quietly stops being useful but I keep using it from habit.** Hard to spot. Mitigation: at the end of each half-term, re-read this proposal and check whether I am still using it three times a week. If not, decommission.

---

## 7. Success criteria

Measurable, in order of importance.

1. **I use it in real lessons.** At least three uses per teaching week for a full half-term. This is the only criterion that matters. The rest are diagnostic.
2. **The output saves me time, not just generates content.** Specifically, what I copy out and edit takes less time than what I would have written from scratch. If I rewrite most of every output, the tool is not actually saving work.
3. **It costs less than my time is worth.** Anthropic spend under £15/month at my use rate. If it exceeds that, the model choice or call structure needs revisiting.

---

## 8. Trigger for revisiting architecture

Defined now, so future me cannot dodge the question.

I commit to revisiting whether to rebuild on a learning-optimised stack (Hono + SQLite or equivalent) at one of these points:

- After two terms of successful use, if I still want to understand the layers underneath
- The first time Firebase changes something painful (price, deprecation, broken upgrade)
- If I want to add a feature that Firestore is genuinely bad at (full-text search at scale, relational queries, anything joining multiple tables)
- If I want to share the tool with another teacher, which would change the architecture requirements

If none of those triggers fires within a year, the implication is clear: I did not actually need the fundamentals as much as I thought I did, and the Firebase stack was the right call.

---

## 9. What this proposal deliberately does not include

- A learning phase plan. Learning is opportunistic now, not scheduled.
- A rebuild on different stack. That is a future project if and only if the triggers in section 8 fire.
- New features beyond what already exists in the Firebase build. I will not commit to building anything I have not yet felt the lack of in real use.
- Automated tests. Manual testing through real use is sufficient at this scale.
- CI/CD. `firebase deploy` from my laptop is fine.
- A second deployment environment. There is one app. If I break production, I fix it.

---

## 10. Next action

This weekend: Phase 1. Get it deployed. Generate one real lesson on it. Stop.

Then leave it alone until I am planning real lessons next week.
