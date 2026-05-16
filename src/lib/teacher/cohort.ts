// src/lib/teacher/cohort.ts
//
// Hardcoded cohort roster for the teacher dashboard. Holds the
// Firebase Auth UIDs of the students in the pilot cohort plus an
// anonymised display label for each. Used by the /teacher view to
// enumerate which student documents to fetch.
//
// Why hardcoded: the platform has no roster collection today. Each
// student account is independent and no document lists "who is in
// the cohort". For pilot scale (14 students, one cohort) a code-side
// allowlist matches the rules-side teacher allowlist pattern from
// Sprint 7A §3.2: server-enforced, requires a deploy to change. A
// roster collection becomes worth building when there are multiple
// cohorts (post-pilot, if Sprint 7B exists).
//
// Pre-pilot TODO: replace COHORT_PLACEHOLDER with the real 14 pilot
// student UIDs once they have signed up. Updating this file is a
// code change followed by a Cloudflare Pages redeploy.
//
// Display labels are deliberately anonymous to keep the dashboard
// neutral on student identity in screenshots and shared logs.

export interface CohortMember {
  uid: string;
  label: string;
}

const COHORT_PLACEHOLDER: readonly CohortMember[] = [
  { uid: "student-uid-placeholder-1", label: "Student 01" },
  { uid: "student-uid-placeholder-2", label: "Student 02" },
];

export const COHORT: readonly CohortMember[] = COHORT_PLACEHOLDER;
