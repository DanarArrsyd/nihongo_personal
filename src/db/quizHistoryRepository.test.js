import { IDBKeyRange, indexedDB } from 'fake-indexeddb'

import { createDatabase } from './database.js'
import { setProgressStatus } from './progressRepository.js'
import { listQuizHistory, recordQuizResponse } from './quizHistoryRepository.js'

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
    await expect(database.reviews.get(['vocabulary', 'n5-vocab-001'])).resolves.toMatchObject({
      lastRating: 'good',
      interval: 3,
      dueAt: '2026-09-18T01:00:00.000Z',
    })
  })

  it('lists newest quiz answers first', async () => {
    await recordQuizResponse({ sessionId: 'session-1', response }, database)
    await recordQuizResponse({
      sessionId: 'session-2',
      response: {
        ...response,
        questionId: 'vocab-002-meaning',
        timestamp: '2026-09-16T01:00:00.000Z',
      },
    }, database)

    await expect(listQuizHistory(database)).resolves.toMatchObject([
      { sessionId: 'session-2' },
      { sessionId: 'session-1' },
    ])
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
    await expect(database.reviews.count()).resolves.toBe(1)
  })

  it('preserves the quiz counter when status and quiz writes run concurrently', async () => {
    await Promise.all([
      setProgressStatus({
        itemType: 'vocabulary',
        itemId: 'n5-vocab-001',
        status: 'familiar',
        timestamp: '2026-09-15T01:01:00.000Z',
      }, database),
      recordQuizResponse({
        sessionId: 'session-1',
        response,
      }, database),
    ])

    await expect(database.quizHistory.count()).resolves.toBe(1)
    await expect(database.progress.get(['vocabulary', 'n5-vocab-001'])).resolves.toMatchObject({
      status: 'familiar',
      correctCount: 1,
      incorrectCount: 0,
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
    await expect(database.reviews.count()).resolves.toBe(0)
  })

  it('schedules an incorrect answer for immediate review', async () => {
    await recordQuizResponse({
      sessionId: 'session-1',
      response: { ...response, result: false, userAnswer: 'minum' },
    }, database)

    await expect(database.reviews.get(['vocabulary', 'n5-vocab-001'])).resolves.toMatchObject({
      lastRating: 'again',
      interval: 0,
      dueAt: '2026-09-15T01:00:00.000Z',
    })
  })

  it.each([
    ['blank session id', { sessionId: ' ' }, 'sessionId must be a non-blank string'],
    [
      'blank question id',
      { response: { ...response, questionId: '' } },
      'questionId must be a non-blank string',
    ],
    ['blank question type', { questionType: ' ' }, 'questionType must be a non-blank string'],
    [
      'blank item type',
      { associatedItem: { module: '', itemId: 'n5-vocab-001' } },
      'itemType and itemId are required',
    ],
    [
      'blank item id',
      { associatedItem: { module: 'vocabulary', itemId: '' } },
      'itemType and itemId are required',
    ],
    ['non-boolean result', { result: 'true' }, 'result must be a boolean'],
    [
      'nested curriculum answer',
      { userAnswer: { id: 'n5-vocab-001', word: '食べる' } },
      'userAnswer must be a scalar value',
    ],
    ['array correct answer', { correctAnswer: ['makan'] }, 'correctAnswer must be a scalar value'],
    ['undefined answer', { userAnswer: undefined }, 'userAnswer must be a scalar value'],
    ['missing timestamp', { timestamp: undefined }, 'timestamp is required'],
    ['invalid timestamp', { timestamp: 'not-a-date' }, 'Invalid timestamp'],
  ])('rejects a %s without writing activity', async (_label, changes, errorMessage) => {
    const sessionId = changes.sessionId ?? 'session-1'
    const changedResponse = changes.response ?? { ...response, ...changes }

    await expect(recordQuizResponse({
      sessionId,
      response: changedResponse,
    }, database)).rejects.toThrow(errorMessage)

    await expect(database.quizHistory.count()).resolves.toBe(0)
    await expect(database.progress.count()).resolves.toBe(0)
  })
})
