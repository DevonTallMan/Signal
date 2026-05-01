// vitest.config.ts
//
// Vitest configuration for Firestore rules tests.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 10000,
  },
});