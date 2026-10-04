import { IDBKeyRange, indexedDB } from 'fake-indexeddb'

import { createDatabase } from './database.js'
import { getReview, recordFlashcardRating } from './reviewRepository.js'

const response = {
  cardId: 'vocabulary:n5-vocab-001',
  rating: 'good',
  timestamp: '2026-09-15T01:00:00.000Z',
  associatedItem: { module: 'vocabulary', itemId: 'n5-vocab-001' },
}

describe('review repository', () => {
  let database

  beforeEach(async () => {
    database = createDatabase(`review-repository-test-${crypto.randomUUID()}`, {
      indexedDB,
      IDBKeyRange,
    })
    await database.open()

    await database.progress.put({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      status: 'familiar',
      mastery: 65,
      correctCount: 7,
      incorrectCount: 2,
      lastStudiedAt: '2026-09-14T01:00:00.000Z',
    })
  })

  afterEach(async () => {
    database.close()
    await database.delete()
  })

  it('returns null when an item has no review', async () => {
    await expect(getReview('kanji', 'n5-kanji-001', database)).resolves.toBeNull()
  })

  it('stores the latest scalar rating without calculating SRS fields', async () => {
    await expect(recordFlashcardRating({
      sessionId: 'session-1',
      response,
    }, database)).resolves.toEqual({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      cardId: 'vocabulary:n5-vocab-001',
      lastRating: 'good',
      lastReviewedAt: '2026-09-15T01:00:00.000Z',
      sessionId: 'session-1',
      dueAt: null,
      interval: null,
      difficulty: null,
    })

    await expect(getReview('vocabulary', 'n5-vocab-001', database)).resolves.toEqual({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      cardId: 'vocabulary:n5-vocab-001',
      lastRating: 'good',
      lastReviewedAt: '2026-09-15T01:00:00.000Z',
      sessionId: 'session-1',
      dueAt: null,
      interval: null,
      difficulty: null,
    })
    await expect(database.progress.get(['vocabulary', 'n5-vocab-001'])).resolves.toEqual({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      status: 'familiar',
      mastery: 65,
      correctCount: 7,
      incorrectCount: 2,
      lastStudiedAt: '2026-09-15T01:00:00.000Z',
    })
  })

  it('replaces the latest rating for the same item instead of adding a review', async () => {
    await recordFlashcardRating({ sessionId: 'session-1', response }, database)
    await recordFlashcardRating({
      sessionId: 'session-2',
      response: {
        ...response,
        rating: 'hard',
        timestamp: '2026-09-15T02:00:00.000Z',
      },
    }, database)

    await expect(database.reviews.count()).resolves.toBe(1)
    await expect(getReview('vocabulary', 'n5-vocab-001', database)).resolves.toEqual({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      cardId: 'vocabulary:n5-vocab-001',
      lastRating: 'hard',
      lastReviewedAt: '2026-09-15T02:00:00.000Z',
      sessionId: 'session-2',
      dueAt: null,
      interval: null,
      difficulty: null,
    })
  })

  it('rolls back the review when the progress update fails', async () => {
    database.progress.hook('updating', () => {
      throw new Error('progress update failed')
    })

    await expect(recordFlashcardRating({
      sessionId: 'session-1',
      response,
    }, database)).rejects.toThrow('progress update failed')

    await expect(database.reviews.count()).resolves.toBe(0)
    await expect(database.progress.get(['vocabulary', 'n5-vocab-001'])).resolves.toMatchObject({
      lastStudiedAt: '2026-09-14T01:00:00.000Z',
    })
  })

  it.each([
    ['blank session id', { sessionId: ' ' }, 'sessionId must be a non-blank string'],
    ['blank card id', { cardId: '' }, 'cardId must be a non-blank string'],
    ['unknown rating', { rating: 'unknown' }, 'Unsupported flashcard rating'],
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
    ['missing timestamp', { timestamp: undefined }, 'timestamp is required'],
    ['invalid timestamp', { timestamp: 'not-a-date' }, 'Invalid timestamp'],
  ])('rejects a %s without writing a review', async (_label, changes, errorMessage) => {
    const sessionId = changes.sessionId ?? 'session-1'
    const changedResponse = { ...response, ...changes }

    await expect(recordFlashcardRating({
      sessionId,
      response: changedResponse,
    }, database)).rejects.toThrow(errorMessage)

    await expect(database.reviews.count()).resolves.toBe(0)
    await expect(database.progress.get(['vocabulary', 'n5-vocab-001'])).resolves.toMatchObject({
      lastStudiedAt: '2026-09-14T01:00:00.000Z',
    })
  })
})
