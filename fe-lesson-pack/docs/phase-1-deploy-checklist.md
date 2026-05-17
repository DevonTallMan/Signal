# Phase 1 Deploy Checklist

**Target:** App live at a Firebase URL, signed in, generating lessons. **Budget:** one weekend.

---

## Before you start, gather these

- [ ] Google account email and password
- [ ] A credit or debit card (for Firebase Blaze plan)
- [ ] Anthropic API key from `console.anthropic.com` (starts `sk-ant-...`)
- [ ] The `fe-lesson-pack.zip` file, unzipped to a folder you can find
- [ ] Node.js 20+ installed (`node --version` to check)
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)

If any of these are missing, sort them now. Mid-deploy is a bad time to hunt for an API key.

---

## Firebase console setup (15 to 30 minutes)

1. [ ] Go to `console.firebase.google.com`, click **Add project**
2. [ ] Name it (e.g. `fe-lesson-pack`), disable Google Analytics, create
3. [ ] In the left sidebar, click the gear icon then **Usage and billing** then **Modify plan**. Upgrade to **Blaze (pay as you go)**. Add card. Set a **monthly budget alert at £5** so you get warned if anything unusual happens.
4. [ ] **Build > Authentication > Get started.** Enable the **Google** provider. Set your email as the support contact. Save.
5. [ ] **Build > Firestore Database > Create database.** Choose **production mode**. **Location: `europe-west2` (London).** This choice is permanent, do not click through it casually.
6. [ ] **Project settings > General > Your apps > Web (`</>` icon).** Register an app called `web`. Copy the `firebaseConfig` block that appears. Keep this tab open.

---

## Local config (10 minutes)

7. [ ] Open a terminal in the unzipped `fe-lesson-pack` folder
8. [ ] `firebase login` (opens a browser, sign in with the same Google account)
9. [ ] Edit `.firebaserc`, replace `your-firebase-project-id` with your real project ID (visible in the console URL)
10. [ ] `firebase functions:secrets:set ANTHROPIC_API_KEY` then paste your `sk-ant-...` key when prompted, press Enter
11. [ ] `cp web/.env.example web/.env` then open `web/.env` and paste in the values from step 6. Leave `VITE_FUNCTIONS_REGION=europe-west2`.

---

## Build and deploy (10 minutes)

12. [ ] `cd functions && npm install && cd ..` (will take 1 to 2 minutes)
13. [ ] `cd web && npm install && npm run build && cd ..` (will take 2 to 3 minutes)
14. [ ] `firebase deploy` (will take 3 to 5 minutes, first time is slowest)
15. [ ] When it finishes, copy the **Hosting URL** from the terminal output

---

## Verify (5 minutes)

16. [ ] Open the Hosting URL. Click **Sign in with Google**. If you get a warning about the app being unverified, that is expected for a personal app, click through.
17. [ ] Fill in a real lesson (e.g. Subject `English`, Topic `Using semicolons correctly`, Level `Level 2`)
18. [ ] Click **Generate pack**. You should see tabs filling in one by one within 30 to 60 seconds.
19. [ ] Click the **Saved** button. The lesson should be there.
20. [ ] Refresh the page. Sign in again. The lesson should still be in Saved.

---

## Set safety nets (5 minutes)

21. [ ] In `console.anthropic.com`, **Settings > Limits > Spend limit**. Set monthly cap at **£20** (or whatever you can afford to lose to a bug).
22. [ ] In `console.anthropic.com`, **Settings > Billing > Email alerts**. Add an alert at £10.
23. [ ] Confirm your Firebase £5 budget alert from step 3 is active under **Usage and billing > Details and settings**.

---

## When (not if) something breaks

**"Permission denied" or "Insufficient permission" on deploy.** You are not on Blaze. Re-check step 3, then run `firebase deploy` again.

**"API has not been used in project before."** Firebase enables services lazily. Click the link in the error, hit Enable, wait 30 seconds, retry the deploy.

**OAuth screen says "Access blocked."** Auth provider not configured. Go to **Authentication > Sign-in method**, confirm Google is enabled and saved.

**Function returns 500 with "ANTHROPIC_API_KEY is not defined."** Secret was set but functions were not redeployed afterwards. Run `firebase deploy --only functions`.

**Cloud Function times out.** First-time cold starts can hit the 60-second default. Generate a second pack, it should be quick. If still slow, check `firebase functions:log` for the actual error.

**Sign-in works but generation fails with permission errors.** Firestore rules not deployed. Run `firebase deploy --only firestore:rules`.

---

## Done when

- The URL is live and bookmarked on your phone and laptop
- You have generated and saved at least one real lesson
- Both spend alerts are configured

**Stop here.** Do not start tweaking features. Phase 2 is next weekend, only if you actually want a custom domain. Otherwise, Phase 3 starts on Monday: use the tool, take notes, do not code.
