# FE Lesson Pack

Personal AI lesson planning tool for UK further education teaching. Deploy to
Firebase, sign in with Google, generate a seven-component lesson pack from a
subject, topic, and level.

The full plan is in `docs/phase-1-deploy-checklist.md`. The short version:

```
firebase login
# edit .firebaserc with your real project ID
firebase functions:secrets:set ANTHROPIC_API_KEY
cp web/.env.example web/.env   # paste in your firebaseConfig values
cd functions && npm install && cd ..
cd web && npm install && npm run build && cd ..
firebase deploy
```

## Layout

- `web/` — React 18 + Vite + Tailwind frontend, deployed to Firebase Hosting
- `functions/` — Single Cloud Function (`generate`) proxying Anthropic
- `firestore.rules` — Per-user document isolation, server-only writes
- `firestore.indexes.json` — Index on `lessons.createdAt`
- `firebase.json` — Hosting + Functions + Firestore wiring
- `.firebaserc` — Your Firebase project ID

## What it does

Form takes Subject, Topic, Level. Function calls Claude once, asks for strict
JSON with seven keys, validates the shape, saves to
`users/{uid}/lessons/{lessonId}` server-side. Client subscribes to that user's
lessons via Firestore for the Saved drawer. Daily call cap enforced in a
Firestore transaction so a runaway client cannot burn your Anthropic budget.

## What it does not do

No multi-user. No sharing. No in-place editing — copy out and paste back. No
tests. No CI. Deliberately. See the proposal in `docs/project-proposal.md`.
