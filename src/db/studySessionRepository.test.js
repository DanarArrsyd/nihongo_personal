import { IDBKeyRange, indexedDB } from 'fake-indexeddb'

import { createDatabase } from './database.js'
import { listStudySessions, saveStudySession } from './studySessionRepository.js'

const summary = {
  sessionId: 'session-1',
  kind: 'quiz',
  module: 'mixed',
  startedAt: '2026-09-15T01:00:00.000Z',
  endedAt: '2026-09-15T01:05:00.000Z',
  duration: 300000,
  itemCount: 10,
  correctCount: 8,
  score: 80,
}

describe('study session repository', () => {
  let database

  beforeEach(async () => {
    database = createDatabase(`study-session-repository-test-${crypto.randomUUID()}`, {
      indexedDB,
      IDBKeyRange,
    })
    await database.open()
  })

  afterEach(async () => {
    database.close()
    await database.delete()
  })

  it('stores and returns a completed session summary', async () => {
    await expect(saveStudySession(summary, database)).resolves.toEqual(summary)
    await expect(database.studySessions.get('session-1')).resolves.toEqual(summary)
  })

  it('lists newest completed sessions first', async () => {
    await saveStudySession(summary, database)
    await saveStudySession({
      ...summary,
      sessionId: 'session-2',
      startedAt: '2026-09-16T01:00:00.000Z',
      endedAt: '2026-09-16T01:05:00.000Z',
    }, database)

    await expect(listStudySessions(database)).resolves.toMatchObject([
      { sessionId: 'session-2' },
      { sessionId: 'session-1' },
    ])
  })

  it('keeps the first summary when the same session is delivered twice', async () => {
    await saveStudySession(summary, database)
    await expect(saveStudySession({
      ...summary,
      endedAt: '2026-09-15T01:10:00.000Z',
      duration: 600000,
      correctCount: 7,
      score: 70,
    }, database)).resolves.toEqual(summary)

    await expect(database.studySessions.count()).resolves.toBe(1)
    await expect(database.studySessions.get('session-1')).resolves.toEqual(summary)
  })

  it('normalizes valid timestamps and stores only flashcard summary fields', async () => {
    const flashcardSummary = {
      sessionId: 'session-2',
      kind: 'flashcard',
      module: 'vocabulary',
      startedAt: new Date('2026-09-15T08:00:00+07:00'),
      endedAt: '2026-09-15T08:03:00+07:00',
      duration: 180000,
      itemCount: 12,
    }

    await expect(saveStudySession(flashcardSummary, database)).resolves.toEqual({
      sessionId: 'session-2',
      kind: 'flashcard',
      module: 'vocabulary',
      startedAt: '2026-09-15T01:00:00.000Z',
      endedAt: '2026-09-15T01:03:00.000Z',
      duration: 180000,
      itemCount: 12,
    })
  })

  it.each([
    ['nested extra payload', { curriculum: { id: 'n5-vocab-001' } }, 'Unexpected study session field'],
    ['scalar extra payload', { note: 'complete' }, 'Unexpected study session field'],
    ['blank session id', { sessionId: '' }, 'sessionId must be a non-blank string'],
    ['unsupported kind', { kind: 'practice' }, 'Unsupported study session kind'],
    ['blank module', { module: ' ' }, 'module must be a non-blank string'],
    ['missing start timestamp', { startedAt: undefined }, 'startedAt is required'],
    ['invalid end timestamp', { endedAt: 'not-a-date' }, 'Invalid timestamp'],
    ['negative duration', { duration: -1 }, 'duration must be a finite non-negative number'],
    ['infinite duration', { duration: Infinity }, 'duration must be a finite non-negative number'],
    ['negative item count', { itemCount: -1 }, 'itemCount must be a non-negative integer'],
    ['fractional item count', { itemCount: 1.5 }, 'itemCount must be a non-negative integer'],
    ['negative correct count', { correctCount: -1 }, 'correctCount must be a non-negative integer'],
    ['fractional correct count', { correctCount: 1.5 }, 'correctCount must be a non-negative integer'],
    ['negative score', { score: -1 }, 'score must be between 0 and 100'],
    ['score above 100', { score: 101 }, 'score must be between 0 and 100'],
    ['non-finite score', { score: Number.NaN }, 'score must be between 0 and 100'],
  ])('rejects a %s without persisting it', async (_label, changes, errorMessage) => {
    await expect(saveStudySession({
      ...summary,
      ...changes,
    }, database)).rejects.toThrow(errorMessage)

    await expect(database.studySessions.count()).resolves.toBe(0)
  })

  it.each([
    ['correctCount', 8],
    ['score', 80],
  ])('rejects quiz-only %s on a flashcard summary', async (field, value) => {
    await expect(saveStudySession({
      sessionId: 'session-3',
      kind: 'flashcard',
      module: 'kanji',
      startedAt: '2026-09-15T03:00:00.000Z',
      endedAt: '2026-09-15T03:01:00.000Z',
      duration: 60000,
      itemCount: 4,
      [field]: value,
    }, database)).rejects.toThrow('Unexpected study session field')

    await expect(database.studySessions.count()).resolves.toBe(0)
  })
})
