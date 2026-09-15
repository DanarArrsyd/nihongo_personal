import { IDBKeyRange, indexedDB } from 'fake-indexeddb'

import { createDatabase } from './database.js'
import { recordQuizResponse } from './quizHistoryRepository.js'

const response = {
  questionId: 'vocab-001-meaning',
  questionType: 'multiple_choice',
  userAnswer: 'makan',
  correctAnswer: 'makan',
  result: true,
  timestamp: '2026-09-15T01:00:00.000Z',
  associatedItem: { module: 'vocabulary', itemId: 'n5-vocab-001' },
}

describe('quiz history repository', () => {
  let database

  beforeEach(async () => {
    database = createDatabase(`quiz-history-repository-test-${crypto.randomUUID()}`, {
      indexedDB,
      IDBKeyRange,
    })
    await database.open()
  })

  afterEach(async () => {
    database.close()
    await database.delete()
  })

  it('stores an immutable scalar history row and updates progress together', async () => {
    await expect(recordQuizResponse({
      sessionId: 'session-1',
      response,
    }, database)).resolves.toMatchObject({
      operationId: 'session-1:vocab-001-meaning',
      sessionId: 'session-1',
      questionId: 'vocab-001-meaning',
      questionType: 'multiple_choice',
      userAnswer: 'makan',
      correctAnswer: 'makan',
      result: true,
      timestamp: '2026-09-15T01:00:00.000Z',
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
    })

    await expect(database.quizHistory.toArray()).resolves.toEqual([
      expect.objectContaining({
        operationId: 'session-1:vocab-001-meaning',
        sessionId: 'session-1',
        questionId: 'vocab-001-meaning',
        questionType: 'multiple_choice',
        userAnswer: 'makan',
        correctAnswer: 'makan',
        result: true,
        timestamp: '2026-09-15T01:00:00.000Z',
        itemType: 'vocabulary',
        itemId: 'n5-vocab-001',
      }),
    ])
    await expect(database.progress.get(['vocabulary', 'n5-vocab-001'])).resolves.toMatchObject({
      correctCount: 1,
      incorrectCount: 0,
      lastStudiedAt: '2026-09-15T01:00:00.000Z',
    })
  })

  it('keeps the original history and counter when the same operation is delivered twice', async () => {
    await recordQuizResponse({ sessionId: 'session-1', response }, database)
    await recordQuizResponse({
      sessionId: 'session-1',
      response: {
        ...response,
        userAnswer: 'minum',
        result: false,
        timestamp: '2026-09-15T01:01:00.000Z',
      },
    }, database)

    await expect(database.quizHistory.count()).resolves.toBe(1)
    await expect(database.quizHistory.toArray()).resolves.toEqual([
      expect.objectContaining({
        userAnswer: 'makan',
        result: true,
        timestamp: '2026-09-15T01:00:00.000Z',
      }),
    ])
    await expect(database.progress.get(['vocabulary', 'n5-vocab-001'])).resolves.toMatchObject({
      correctCount: 1,
      incorrectCount: 0,
      lastStudiedAt: '2026-09-15T01:00:00.000Z',
    })
  })

  it('rolls back history when the progress write fails', async () => {
    const rejectProgressWrite = () => {
      throw new Error('progress write failed')
    }
    database.progress.hook('creating', rejectProgressWrite)

    await expect(recordQuizResponse({
      sessionId: 'session-1',
      response,
    }, database)).rejects.toThrow('progress write failed')

    await expect(database.quizHistory.count()).resolves.toBe(0)
    await expect(database.progress.count()).resolves.toBe(0)
  })
})
