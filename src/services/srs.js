const DAY_IN_MS = 24 * 60 * 60 * 1000

const RATING_RULES = {
  again: { firstInterval: 0, multiplier: 0, difficulty: 4 },
  hard: { firstInterval: 1, multiplier: 1.2, difficulty: 3 },
  good: { firstInterval: 3, multiplier: 2, difficulty: 2 },
  easy: { firstInterval: 7, multiplier: 3, difficulty: 1 },
}

function normalizeReviewedAt(reviewedAt) {
  const date = reviewedAt instanceof Date ? reviewedAt : new Date(reviewedAt)

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid review timestamp')
  }

  return date
}

function getNextInterval(rule, previousInterval) {
  if (rule.multiplier === 0) return 0
  if (!Number.isFinite(previousInterval) || previousInterval <= 0) return rule.firstInterval

  return Math.max(rule.firstInterval, Math.ceil(previousInterval * rule.multiplier))
}

export function calculateNextReview({ rating, reviewedAt, previousInterval = null }) {
  const rule = RATING_RULES[rating]
  if (!rule) throw new Error('Unsupported review rating')

  const reviewDate = normalizeReviewedAt(reviewedAt)
  const interval = getNextInterval(rule, previousInterval)

  return {
    difficulty: rule.difficulty,
    dueAt: new Date(reviewDate.getTime() + interval * DAY_IN_MS).toISOString(),
    interval,
  }
}

