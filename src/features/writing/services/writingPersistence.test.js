import { IDBKeyRange, indexedDB } from 'fake-indexeddb'

import { createDatabase } from '../../../db/database.js'
import { recordWritingCompletion } from './writingPersistence.js'

describe('writingPersistence', () => {
  let database

  beforeEach(async () => {
    database = createDatabase(`writing-persistence-test-${crypto.randomUUID()}`, {
      indexedDB,
      IDBKeyRange,
    })
    await database.open()
  })

  afterEach(async () => {
    database.close()
    await database.delete()
  })

  it('stores kana progress and a writing session together', async () => {
    await recordWritingCompletion({
      attempts: 2,
      itemId: 'o',
      session: {
        sessionId: 'writing-session-1',
        kind: 'quiz',
        module: 'kana:hiragana:writing',
        startedAt: '2026-10-08T08:00:00.000Z',
      },
    }, database)

    await expect(database.progress.get(['kana', 'o'])).resolves.toMatchObject({
      correctCount: 1,
      status: 'learning',
    })
    await expect(database.studySessions.get('writing-session-1')).resolves.toMatchObject({
      correctCount: 1,
      itemCount: 1,
      module: 'kana:hiragana:writing',
      score: 50,
    })
  })
})
