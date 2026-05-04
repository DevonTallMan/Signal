// vitest.config.ts
//
// Vitest configuration. Picks up tests from two locations:
//   - tests/**/*.test.ts: integration-style tests (e.g. Firestore rules)
//   - src/**/*.test.ts: colocated unit tests next to the modules they test
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    testTimeout: 10000,
  },
});
