// src/lib/teacher/allowlist.ts
//
// Client-side mirror of the teacher email allowlist that lives in
// firestore.rules. This mirror is COSMETIC — it drives the deny
// screen UX on the /teacher route. The real security boundary is
// enforced server-side by Firestore rules (Sprint 7A Inc 7.0):
// even if a non-allowlisted user bypasses this client check, every
// cross-user read they attempt will be rejected by the rules.
//
// Keep this list in sync with the allowlist in firestore.rules.
// Pre-pilot TODO: replace the placeholder with Chris's and Dave's
// real emails. The placeholder string is intentionally never going
// to match a real Firebase auth token.

export const TEACHER_ALLOWLIST: readonly string[] = [
  "teacher-pilot-placeholder@example.com",
];

export function isTeacherEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return TEACHER_ALLOWLIST.includes(email);
}
