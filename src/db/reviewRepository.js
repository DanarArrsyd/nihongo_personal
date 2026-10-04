import { database as defaultDatabase } from './database.js'
import {
  normalizeRequiredTimestamp,
  validateItemIdentifiers,
  validateNonBlankString,
} from './validation.js'

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
  const reviewRecord = {
    itemType,
    itemId,
    cardId: response.cardId,
    lastRating: response.rating,
    lastReviewedAt,
    sessionId,
    dueAt: null,
    interval: null,
    difficulty: null,
  }

  return db.transaction('rw', db.reviews, db.progress, async () => {
    const existingProgress = await db.progress.get([itemType, itemId])
    const progressRecord = {
      ...(existingProgress ?? createProgressRecord(itemType, itemId)),
      lastStudiedAt: lastReviewedAt,
    }

    await db.reviews.put(reviewRecord)
    await db.progress.put(progressRecord)

    return reviewRecord
  })
}
