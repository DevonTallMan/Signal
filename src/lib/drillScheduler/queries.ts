// src/lib/drillScheduler/queries.ts
//
// Scheduler-aware reads of users/{uid}/drillRatings. Applies the Risk 3
// read-time fallback so legacy documents (created before Inc 6.0) are
// surfaced as { boxLevel: 0, nextReviewDate: now } and therefore appear
// immediately in the queue, "graduate naturally from there".

import {
  collection,
  getDocs,
  Timestamp,
  type Firestore,
} from "firebase/firestore";
import type { CardState } from "./picker";

export async function getAllCardStates(
  db: Firestore,
  uid: string,
  now: Date = new Date(),
): Promise<CardState[]> {
  const snap = await getDocs(collection(db, "users", uid, "drillRatings"));
  const nowTimestamp = Timestamp.fromDate(now);
  return snap.docs.map((d) => {
    const data = d.data();
    const hasSchedulerFields = typeof data.boxLevel === "number";
    return {
      topicId: typeof data.topicId === "string" ? data.topicId : "",
      termId: typeof data.termId === "string" ? data.termId : "",
      boxLevel: hasSchedulerFields ? data.boxLevel : 0,
      nextReviewDate: hasSchedulerFields
        ? (data.nextReviewDate ?? null)
        : nowTimestamp,
    };
  });
}
