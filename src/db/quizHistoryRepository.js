import { database as defaultDatabase } from './database.js'
import { applyAnswerResult } from './progressRepository.js'
import { normalizeTimestamp, validateBoolean, validateItemIdentifiers } from './validation.js'

function validateRequiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${name} must be a non-blank string`)
  }
}

export async function recordQuizResponse({ sessionId, response }, db = defaultDatabase) {
  validateRequiredString(sessionId, 'sessionId')
  validateRequiredString(response?.questionId, 'questionId')

  const itemType = response?.associatedItem?.module
  const itemId = response?.associatedItem?.itemId
  validateItemIdentifiers(itemType, itemId)
  validateBoolean(response.result, 'result')

  const operationId = `${sessionId}:${response.questionId}`
  const historyRecord = {
    operationId,
    sessionId,
    questionId: response.questionId,
    questionType: response.questionType,
    userAnswer: response.userAnswer,
    correctAnswer: response.correctAnswer,
    result: response.result,
    timestamp: normalizeTimestamp(response.timestamp),
    itemType,
    itemId,
  }

  return db.transaction('rw', db.quizHistory, db.progress, async () => {
    const existingRecord = await db.quizHistory.where('operationId').equals(operationId).first()

    if (existingRecord) return existingRecord

    await db.quizHistory.add(historyRecord)
    await applyAnswerResult({
      itemType,
      itemId,
      correct: response.result,
      timestamp: historyRecord.timestamp,
    }, db)

    return historyRecord
  })
}
