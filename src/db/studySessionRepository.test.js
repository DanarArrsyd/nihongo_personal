import { IDBKeyRange, indexedDB } from 'fake-indexeddb'

import { createDatabase } from './database.js'
import { saveStudySession } from './studySessionRepository.js'

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
})
