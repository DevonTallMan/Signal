// scripts/seed-playwright-user.ts
//
// One-off (and idempotent) script to seed the Playwright test user
// in the Signal staging Firebase project (signal-staging-26b3e).
//
// Usage:
//   PLAYWRIGHT_TEST_EMAIL=playwright@signal-staging.test \
//   PLAYWRIGHT_TEST_PASSWORD=<password> \
//   npx tsx scripts/seed-playwright-user.ts
//
// Re-runs are safe: if the user already exists the script reports
// "exists" and exits 0.
//
// ASSUMPTION: src/firebase.ts exports `stagingConfig` as a named export.
// If your firebase.ts only exports the active (DEV-switched) config,
// add an explicit `stagingConfig` export, or hardcode the public
// staging config object directly in this script.

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Inlined from src/lib/firebase.ts (public-by-design per that file's
// own comment). Inlined because firebase.ts uses import.meta.env,
// which is Vite-specific and doesn't exist under tsx/Node, and
// because firebase.ts's initializeApp() side-effect at module load
// would conflict with this script's own initializeApp() call.
const stagingConfig = {
  apiKey: 'AIzaSyAqec8HHrXRnwDTLcyM5Y9aLovWlFE77rc',
  authDomain: 'signal-staging-26b3e.firebaseapp.com',
  projectId: 'signal-staging-26b3e',
  storageBucket: 'signal-staging-26b3e.firebasestorage.app',
  messagingSenderId: '1074335579413',
  appId: '1:1074335579413:web:edafc2f4eaf0b58cd3bd1c',
};

async function main(): Promise<void> {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

  if (!email || !password) {
    console.error(
      "Missing PLAYWRIGHT_TEST_EMAIL or PLAYWRIGHT_TEST_PASSWORD env var.",
    );
    process.exit(1);
  }

  // Safety guard: refuse to seed against a non-staging project.
  if (!stagingConfig.projectId?.includes("staging")) {
    console.error(
      `Refusing to seed: stagingConfig.projectId is "${stagingConfig.projectId}", which does not look like a staging project.`,
    );
    process.exit(1);
  }

  const app = initializeApp(stagingConfig);
  const auth = getAuth(app);

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log(`Created test user ${email} (uid: ${cred.user.uid}).`);
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "auth/email-already-in-use"
    ) {
      console.log(`Test user ${email} already exists. No action taken.`);
      return;
    }
    throw err;
  }
}

main().catch((err) => {
  console.error("Failed to seed test user:", err);
  process.exit(1);
});
