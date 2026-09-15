import { database as defaultDatabase } from './database.js'
import { normalizeTimestamp, validateItemIdentifiers } from './validation.js'

function validateRequiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${name} must be a non-blank string`)
  }
}

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
  validateRequiredString(sessionId, 'sessionId')
  validateRequiredString(response?.cardId, 'cardId')
  validateRequiredString(response?.rating, 'rating')

  const itemType = response?.associatedItem?.module
  const itemId = response?.associatedItem?.itemId
  validateItemIdentifiers(itemType, itemId)

  const lastReviewedAt = normalizeTimestamp(response.timestamp)
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
