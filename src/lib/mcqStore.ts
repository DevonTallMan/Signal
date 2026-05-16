// src/lib/mcqStore.ts
//
// Firestore read/write helpers for MCQ submissions. Companion to
// src/lib/drillStore.ts (drill ratings) and src/lib/firestore.ts
// (NEI submissions).
//
// Sprint 7B Inc 7B.0 established the rules block at
// users/{uid}/mcqSubmissions/{compositeId} where compositeId is
// `${topicId}__${questionId}`. Upsert semantics: re-submitting an
// MCQ overwrites the previous record. No attempt history.

import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  Timestamp,
  type Firestore,
} from "firebase/firestore";
import { app } from "./firebase";

export interface MCQSubmissionRecord {
  topicId: string;
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  submittedAtMs: number | null;
}

let cached: Firestore | null = null;
function db(): Firestore {
  if (cached) return cached;
  cached = getFirestore(app);
  return cached;
}

function compositeId(topicId: string, questionId: string): string {
  return `${topicId}__${questionId}`;
}

export async function saveMCQSubmission(
  uid: string,
  topicId: string,
  questionId: string,
  selectedIndex: number,
  correctIndex: number,
): Promise<void> {
  const ref = doc(
    db(),
    "users",
    uid,
    "mcqSubmissions",
    compositeId(topicId, questionId),
  );
  await setDoc(ref, {
    topicId,
    questionId,
    selectedIndex,
    correctIndex,
    isCorrect: selectedIndex === correctIndex,
    submittedAt: serverTimestamp(),
    source: "signal",
  });
}

export async function loadMCQSubmission(
  uid: string,
  topicId: string,
  questionId: string,
): Promise<MCQSubmissionRecord | null> {
  const ref = doc(
    db(),
    "users",
    uid,
    "mcqSubmissions",
    compositeId(topicId, questionId),
  );
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  const submittedAtMs =
    data.submittedAt instanceof Timestamp
      ? data.submittedAt.toMillis()
      : null;
  return {
    topicId: typeof data.topicId === "string" ? data.topicId : topicId,
    questionId:
      typeof data.questionId === "string" ? data.questionId : questionId,
    selectedIndex:
      typeof data.selectedIndex === "number" ? data.selectedIndex : -1,
    correctIndex:
      typeof data.correctIndex === "number" ? data.correctIndex : -1,
    isCorrect: typeof data.isCorrect === "boolean" ? data.isCorrect : false,
    submittedAtMs,
  };
}
