export interface CardProgress {
  wordId: string
  easeFactor: number // 1.3 - 2.5+
  interval: number // Days until next review
  repetitions: number // Number of successful reviews
  nextReviewDate: number // Timestamp
  lastReviewDate: number // Timestamp
  status: "new" | "learning" | "review" | "mastered"
}

export enum ReviewQuality {
  Again = 0, // Полностью забыл
  Hard = 1, // Вспомнил с большим трудом
  Good = 2, // Вспомнил с усилием
  Easy = 3, // Легко вспомнил
}

// SM-2 Algorithm implementation
export function calculateNextReview(card: CardProgress, quality: ReviewQuality): CardProgress {
  const now = Date.now()
  let { easeFactor, interval, repetitions } = card

  // Failed recall (quality < 2)
  if (quality < ReviewQuality.Good) {
    return {
      ...card,
      repetitions: 0,
      interval: 1,
      nextReviewDate: now + 10 * 60 * 1000, // 10 minutes
      lastReviewDate: now,
      status: "learning",
    }
  }

  // Successful recall
  repetitions += 1

  // Adjust ease factor
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02)))

  // Calculate new interval
  if (repetitions === 1) {
    interval = 1 // 1 day
  } else if (repetitions === 2) {
    interval = 6 // 6 days
  } else {
    interval = Math.round(interval * easeFactor)
  }

  const status = repetitions >= 5 ? "mastered" : repetitions >= 1 ? "review" : "learning"

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: now + interval * 24 * 60 * 60 * 1000,
    lastReviewDate: now,
    status,
  }
}

export function initializeCard(wordId: string): CardProgress {
  return {
    wordId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: Date.now(),
    lastReviewDate: 0,
    status: "new",
  }
}

export function getDueCards(allProgress: CardProgress[]): CardProgress[] {
  const now = Date.now()
  return allProgress.filter((card) => card.nextReviewDate <= now)
}

export function getStudyStats(allProgress: CardProgress[]) {
  const now = Date.now()

  return {
    new: allProgress.filter((c) => c.status === "new").length,
    learning: allProgress.filter((c) => c.status === "learning").length,
    review: allProgress.filter((c) => c.status === "review" && c.nextReviewDate <= now).length,
    mastered: allProgress.filter((c) => c.status === "mastered").length,
    total: allProgress.length,
    dueToday: allProgress.filter((c) => c.nextReviewDate <= now).length,
  }
}
