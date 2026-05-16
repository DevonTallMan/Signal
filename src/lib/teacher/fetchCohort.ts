// src/lib/teacher/fetchCohort.ts
//
// Client-side reads of cohort data for the teacher dashboard.
//
// For each cohort UID:
//   - users/{uid}/drillRatings/*
//   - users/{uid}/data/risk-classifier/sessions/*
//   - users/{uid}/data/sort-and-match/sessions/*
//   - users/{uid}/data/twin-tracks/sessions/*
//
// Reads are gated by the Sprint 7A Inc 7.0 isTeacher() rule. A
// non-teacher caller will receive permission-denied errors on every
// cross-user read; this is expected and is the security boundary
// holding. The /teacher view checks the email allowlist client-side
// before calling this function to avoid those spurious errors when
// the page is visited by a regular student or an unauthenticated
// user, but the cosmetic check is not the security boundary.
//
// Volume: 14 students × ~10 drill cards × 4 sessions = small. No
// pagination, no caching in v1.

import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "../firebase";
import type { DrillRatingDoc, ActivitySessionDoc } from "./aggregate";

export interface CohortMemberData {
  uid: string;
  drillRatings: DrillRatingDoc[];
  sessions: ActivitySessionDoc[];
}

const ACTIVITY_KEYS = ["risk-classifier", "sort-and-match", "twin-tracks"] as const;

async function fetchOneStudent(uid: string): Promise<CohortMemberData> {
  const db = getFirestore(app);

  const drillSnap = await getDocs(collection(db, "users", uid, "drillRatings"));
  const drillRatings = drillSnap.docs.map((d) => d.data() as DrillRatingDoc);

  const sessionSnaps = await Promise.all(
    ACTIVITY_KEYS.map((key) =>
      getDocs(collection(db, "users", uid, "data", key, "sessions")),
    ),
  );
  const sessions = sessionSnaps.flatMap((snap) =>
    snap.docs.map((d) => d.data() as ActivitySessionDoc),
  );

  return { uid, drillRatings, sessions };
}

export async function fetchCohort(uids: readonly string[]): Promise<CohortMemberData[]> {
  return Promise.all(uids.map((uid) => fetchOneStudent(uid)));
}
