import { SpacedRepetitionData, StudyRating } from "../types";

/**
 * Calculates updated SM-2 spaced repetition parameters based on user's rating.
 * Rating scale:
 * - 'again': complete lapse, reset interval to 1 day
 * - 'hard': recalled with high effort, slight increase
 * - 'good': standard recall, interval expands by ease factor
 * - 'easy': effortless recall, larger interval expansion and ease bonus
 */
export function calculateNextReview(
  current: SpacedRepetitionData,
  rating: StudyRating
): SpacedRepetitionData {
  let { easeFactor, interval, repetition } = current;

  // Defaults if corrupted or initial
  if (!easeFactor || easeFactor < 1.3) easeFactor = 2.5;
  if (typeof interval !== "number" || interval < 0) interval = 0;
  if (typeof repetition !== "number" || repetition < 0) repetition = 0;

  switch (rating) {
    case "again":
      repetition = 0;
      interval = 1;
      easeFactor = Math.max(1.3, Number((easeFactor - 0.2).toFixed(2)));
      break;

    case "hard":
      repetition = repetition > 0 ? repetition : 1;
      interval = interval === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
      easeFactor = Math.max(1.3, Number((easeFactor - 0.15).toFixed(2)));
      break;

    case "good":
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 6;
      } else {
        interval = Math.max(1, Math.round(interval * easeFactor));
      }
      repetition += 1;
      break;

    case "easy":
      if (repetition === 0) {
        interval = 3;
      } else if (repetition === 1) {
        interval = 8;
      } else {
        interval = Math.max(1, Math.round(interval * easeFactor * 1.3));
      }
      repetition += 1;
      easeFactor = Math.min(3.0, Number((easeFactor + 0.15).toFixed(2)));
      break;
  }

  const now = new Date();
  const nextDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    easeFactor,
    interval,
    repetition,
    lastReviewedDate: now.toISOString(),
    nextReviewDate: nextDate.toISOString(),
  };
}

/**
 * Checks if a question is due for spaced repetition review today or overdue.
 */
export function isQuestionDue(sr: SpacedRepetitionData): boolean {
  if (!sr || !sr.nextReviewDate) return true;
  const reviewTime = new Date(sr.nextReviewDate).getTime();
  const now = Date.now();
  return reviewTime <= now;
}
