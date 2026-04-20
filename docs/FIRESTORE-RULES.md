# Firestore Security Rules for Signal

Signal writes to Firestore when a student submits an answer for
marking. Without rules that allow the write, the submission save
fails with `permission-denied` and the UI shows "Marking received,
but could not save to your progress history."

The rules file lives at `firestore.rules` at the repo root.

## The rules in plain English

- Anyone **signed in** can create a submission under
  `/users/{theirOwnUid}/submissions/`.
- Anyone signed in can read their own submissions.
- No one can update or delete submissions (append-only).
- All other reads and writes are denied by default.

## Deploying the rules

1. Open https://console.firebase.google.com
2. Select the `mark-scheme-method-3efe9` project
3. Left sidebar: **Build** -> **Firestore Database**
4. Top tab: **Rules**
5. Replace the entire contents of the rules editor with
   `firestore.rules` from this repo
6. Click **Publish**. Confirm.

New writes will use the new rules immediately. Existing data is
unchanged.

## Testing the rules

The Firebase console has a **Rules Playground** tab. Simulate:

- **Simulation type:** create
- **Location:** `/users/some-test-uid/submissions/test-doc`
- **Authenticated:** yes
- **Firebase UID:** `some-test-uid`
- **Resource data:** JSON matching the Submission shape

Click **Run**. Expected: "Simulated create allowed."

Try again with a different UID in the path. Expected: "Simulated
create denied" because the rules only allow self-writes.

## Why this matters

With no rules (or permissive ones), any signed-in user could read
any other user's submission data. That's a privacy leak and a
reason a college procurement officer would reject Signal. The rules
above are the minimum viable set; tighten further when multi-teacher
or class-scope features arrive.
