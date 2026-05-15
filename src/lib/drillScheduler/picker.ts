// src/lib/drillScheduler/picker.ts
//
// Pure due-cards picker. Given all scheduler states for the logged-in
// user's drill cards and the current time, returns the cards that are
// due for review, sorted earliest-due first. Cards with null
// nextReviewDate (never rated, or graduated) are excluded.

import type { Timestamp } from "firebase/firestore";

export type CardState = {
  topicId: string;
  termId: string;
  boxLevel: number;
  nextReviewDate: Timestamp | null;
};

export type DueCard = CardState & { nextReviewDate: Timestamp };

export function pickDueCards(allCardStates: CardState[], now: Date): DueCard[] {
  const nowMs = now.getTime();
  return allCardStates
    .filter(
      (c): c is DueCard =>
        c.nextReviewDate !== null && c.nextReviewDate.toMillis() <= nowMs,
    )
    .sort((a, b) => a.nextReviewDate.toMillis() - b.nextReviewDate.toMillis());
}
