import { database as defaultDatabase } from './database.js'
import { applyAnswerResult } from './progressRepository.js'
import { createScheduledReview } from './reviewRepository.js'
import {
  normalizeRequiredTimestamp,
  validateBoolean,
  validateItemIdentifiers,
  validateNonBlankString,
  validateScalarValue,
} from './validation.js'

export async function recordQuizResponse({ sessionId, response }, db = defaultDatabase) {
  validateNonBlankString(sessionId, 'sessionId')
  validateNonBlankString(response?.questionId, 'questionId')
  validateNonBlankString(response?.questionType, 'questionType')

  const itemType = response?.associatedItem?.module
  const itemId = response?.associatedItem?.itemId
  validateItemIdentifiers(itemType, itemId)
  validateBoolean(response.result, 'result')
  validateScalarValue(response.userAnswer, 'userAnswer')
  validateScalarValue(response.correctAnswer, 'correctAnswer')

  const operationId = `${sessionId}:${response.questionId}`
  const historyRecord = {
    operationId,
    sessionId,
    questionId: response.questionId,
    questionType: response.questionType,
    userAnswer: response.userAnswer,
    correctAnswer: response.correctAnswer,
    result: response.result,
    timestamp: normalizeRequiredTimestamp(response.timestamp),
    itemType,
    itemId,
  }

  return db.transaction('rw', db.quizHistory, db.progress, db.reviews, async () => {
    const existingRecord = await db.quizHistory.where('operationId').equals(operationId).first()

    if (existingRecord) return existingRecord

    const existingReview = await db.reviews.get([itemType, itemId])
    const reviewRecord = createScheduledReview({
      cardId: `quiz:${response.questionId}`,
      itemId,
      itemType,
      previousInterval: existingReview?.interval,
      rating: response.result ? 'good' : 'again',
      sessionId,
      timestamp: historyRecord.timestamp,
    })

    await db.quizHistory.add(historyRecord)
    await applyAnswerResult({
      itemType,
      itemId,
      correct: response.result,
      timestamp: historyRecord.timestamp,
    }, db)
    await db.reviews.put(reviewRecord)

    return historyRecord
  })
}
