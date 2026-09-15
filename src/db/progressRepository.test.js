import { IDBKeyRange, indexedDB } from 'fake-indexeddb'

import { createDatabase } from './database.js'
import {
  applyAnswerResult,
  getProgress,
  listProgress,
  setProgressStatus,
} from './progressRepository.js'

describe('progress repository', () => {
  let database

  beforeEach(async () => {
    database = createDatabase(`progress-repository-test-${crypto.randomUUID()}`, {
      indexedDB,
      IDBKeyRange,
    })
    await database.open()
  })

  afterEach(async () => {
    database.close()
    await database.delete()
  })

  it('returns null and an empty list when no matching progress exists', async () => {
    await expect(getProgress('vocabulary', 'n5-vocab-001', database)).resolves.toBeNull()
    await expect(listProgress('vocabulary', database)).resolves.toEqual([])
  })

  it('stores each supported progress status', async () => {
    for (const status of ['new', 'learning', 'familiar', 'mastered']) {
      await expect(setProgressStatus({
        itemType: 'vocabulary',
        itemId: `n5-vocab-${status}`,
        status,
        timestamp: '2026-09-15T01:00:00.000Z',
      }, database)).resolves.toMatchObject({
        itemType: 'vocabulary',
        itemId: `n5-vocab-${status}`,
        status,
        mastery: 0,
        correctCount: 0,
        incorrectCount: 0,
        lastStudiedAt: '2026-09-15T01:00:00.000Z',
      })
    }
  })

  it('preserves existing counters and mastery when setting status', async () => {
    await database.progress.put({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      status: 'learning',
      mastery: 62,
      correctCount: 8,
      incorrectCount: 3,
      lastStudiedAt: '2026-09-14T01:00:00.000Z',
    })

    await expect(setProgressStatus({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      status: 'familiar',
      timestamp: '2026-09-15T01:00:00.000Z',
    }, database)).resolves.toMatchObject({
      status: 'familiar',
      mastery: 62,
      correctCount: 8,
      incorrectCount: 3,
      lastStudiedAt: '2026-09-15T01:00:00.000Z',
    })
  })

  it('increments the correct answer counter for first activity', async () => {
    await expect(applyAnswerResult({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      correct: true,
      timestamp: '2026-09-15T01:00:00.000Z',
    }, database)).resolves.toMatchObject({
      status: 'learning',
      mastery: 0,
      correctCount: 1,
      incorrectCount: 0,
      lastStudiedAt: '2026-09-15T01:00:00.000Z',
    })
  })

  it('increments only the matching answer counter while preserving status and mastery', async () => {
    await database.progress.put({
      itemType: 'kanji',
      itemId: 'n5-kanji-001',
      status: 'mastered',
      mastery: 100,
      correctCount: 12,
      incorrectCount: 1,
      lastStudiedAt: '2026-09-14T01:00:00.000Z',
    })

    await expect(applyAnswerResult({
      itemType: 'kanji',
      itemId: 'n5-kanji-001',
      correct: false,
      timestamp: '2026-09-15T01:00:00.000Z',
    }, database)).resolves.toMatchObject({
      status: 'mastered',
      mastery: 100,
      correctCount: 12,
      incorrectCount: 2,
      lastStudiedAt: '2026-09-15T01:00:00.000Z',
    })
  })

  it('stores Date timestamps as canonical ISO strings', async () => {
    await expect(setProgressStatus({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-002',
      status: 'learning',
      timestamp: new Date('2026-09-15T08:00:00+07:00'),
    }, database)).resolves.toMatchObject({
      lastStudiedAt: '2026-09-15T01:00:00.000Z',
    })
  })

  it('stores omitted answer timestamps as null', async () => {
    await expect(applyAnswerResult({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-003',
      correct: true,
    }, database)).resolves.toMatchObject({
      lastStudiedAt: null,
    })
  })

  it.each([
    'not-a-date',
    new Date('invalid'),
  ])('rejects invalid timestamps', async (timestamp) => {
    await expect(setProgressStatus({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-004',
      status: 'learning',
      timestamp,
    }, database)).rejects.toThrow('Invalid timestamp')
  })

  it.each([
    { itemType: '', itemId: 'n5-vocab-001' },
    { itemType: 'vocabulary', itemId: ' ' },
  ])('rejects blank progress identifiers', async ({ itemType, itemId }) => {
    await expect(setProgressStatus({
      itemType,
      itemId,
      status: 'learning',
      timestamp: '2026-09-15T01:00:00.000Z',
    }, database)).rejects.toThrow('itemType and itemId are required')
  })

  it('rejects unsupported progress statuses', async () => {
    await expect(setProgressStatus({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      status: 'paused',
      timestamp: '2026-09-15T01:00:00.000Z',
    }, database)).rejects.toThrow('Unsupported progress status')
  })

  it('rejects non-boolean answer results', async () => {
    await expect(applyAnswerResult({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      correct: 'yes',
      timestamp: null,
    }, database)).rejects.toThrow('correct must be a boolean')
  })
})
