import { database as defaultDatabase } from './database.js'
import {
  normalizeRequiredTimestamp,
  validateItemIdentifiers,
  validateNonBlankString,
} from './validation.js'
import { calculateNextReview } from '../services/srs.js'

const SUPPORTED_RATINGS = new Set(['again', 'hard', 'good', 'easy'])

function createProgressRecord(itemType, itemId) {
  return {
    itemType,
    itemId,
    status: 'learning',
    mastery: 0,
    correctCount: 0,
    incorrectCount: 0,
  }
}

export async function getReview(itemType, itemId, db = defaultDatabase) {
  return (await db.reviews.get([itemType, itemId])) ?? null
}

export async function listDueReviews(timestamp = new Date(), db = defaultDatabase) {
  const dueAt = normalizeRequiredTimestamp(timestamp, 'timestamp')
  return db.reviews.where('dueAt').belowOrEqual(dueAt).sortBy('dueAt')
}

export async function listReviews(db = defaultDatabase) {
  return db.reviews.toArray()
}

export function createScheduledReview({
  cardId,
  itemId,
  itemType,
  previousInterval,
  rating,
  sessionId,
  timestamp,
}) {
  const lastReviewedAt = normalizeRequiredTimestamp(timestamp)
  const schedule = calculateNextReview({ rating, reviewedAt: lastReviewedAt, previousInterval })

  return {
    itemType,
    itemId,
    cardId,
    lastRating: rating,
    lastReviewedAt,
    sessionId,
    ...schedule,
  }
}

export async function recordFlashcardRating({ sessionId, response }, db = defaultDatabase) {
  validateNonBlankString(sessionId, 'sessionId')
  validateNonBlankString(response?.cardId, 'cardId')

  if (!SUPPORTED_RATINGS.has(response?.rating)) {
    throw new Error('Unsupported flashcard rating')
  }

  const itemType = response?.associatedItem?.module
  const itemId = response?.associatedItem?.itemId
  validateItemIdentifiers(itemType, itemId)

  const lastReviewedAt = normalizeRequiredTimestamp(response.timestamp)
  return db.transaction('rw', db.reviews, db.progress, async () => {
    const existingReview = await db.reviews.get([itemType, itemId])
    const existingProgress = await db.progress.get([itemType, itemId])
    const reviewRecord = createScheduledReview({
      cardId: response.cardId,
      itemId,
      itemType,
      previousInterval: existingReview?.interval,
      rating: response.rating,
      sessionId,
      timestamp: lastReviewedAt,
    })
    const progressRecord = {
      ...(existingProgress ?? createProgressRecord(itemType, itemId)),
      lastStudiedAt: lastReviewedAt,
    }

    await db.reviews.put(reviewRecord)
    await db.progress.put(progressRecord)

    return reviewRecord
  })
}
