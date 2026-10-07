import Dexie from 'dexie'
import { IDBKeyRange, indexedDB } from 'fake-indexeddb'

import { createDatabase } from './database.js'

describe('createDatabase', () => {
  let database

  afterEach(async () => {
    if (database) {
      database.close()
      await database.delete()
      database = undefined
    }
  })

  it('creates the current schema and supports one record in every table', async () => {
    database = createDatabase(`nihongo-personal-test-${Date.now()}`, {
      indexedDB,
      IDBKeyRange,
    })

    await database.open()

    const expectedTables = [
      'dailyMissions',
      'favorites',
      'progress',
      'quizHistory',
      'reviews',
      'settings',
      'studySessions',
    ]

    expect(database.tables.map(({ name }) => name).sort()).toEqual(expectedTables)

    const records = {
      dailyMissions: { date: '2026-10-04', status: 'not_started', updatedAt: 1 },
      favorites: { itemType: 'vocabulary', itemId: 'test-vocab', updatedAt: 1 },
      progress: { itemType: 'vocabulary', itemId: 'test-vocab', status: 'new', lastStudiedAt: 1 },
      quizHistory: {
        operationId: 'test-operation',
        sessionId: 'test-session',
        questionId: 'test-question',
        timestamp: 1,
        itemType: 'vocabulary',
        itemId: 'test-vocab',
      },
      reviews: { itemType: 'vocabulary', itemId: 'test-vocab', dueAt: 1 },
      settings: { key: 'theme', value: 'light' },
      studySessions: { sessionId: 'test-session', module: 'vocabulary', startedAt: 1, endedAt: 2 },
    }

    const keys = {
      dailyMissions: '2026-10-04',
      favorites: ['vocabulary', 'test-vocab'],
      progress: ['vocabulary', 'test-vocab'],
      reviews: ['vocabulary', 'test-vocab'],
      settings: 'theme',
      studySessions: 'test-session',
    }

    for (const [tableName, record] of Object.entries(records)) {
      const primaryKey = await database.table(tableName).put(record)
      const key = tableName === 'quizHistory' ? primaryKey : keys[tableName]
      await expect(database.table(tableName).get(key)).resolves.toMatchObject(record)
    }
  })

  it('upgrades version 1 data without losing existing progress', async () => {
    const databaseName = `nihongo-personal-migration-test-${crypto.randomUUID()}`
    const legacyDatabase = new Dexie(databaseName, { indexedDB, IDBKeyRange })

    legacyDatabase.version(1).stores({
      progress: '[itemType+itemId], itemType, status, lastStudiedAt',
      reviews: '[itemType+itemId], itemType, dueAt',
      quizHistory: '++id, &operationId, sessionId, questionId, timestamp, [itemType+itemId]',
      studySessions: 'sessionId, module, startedAt, endedAt',
      favorites: '[itemType+itemId], itemType, updatedAt',
      settings: 'key',
    })

    await legacyDatabase.open()
    await legacyDatabase.progress.put({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      status: 'learning',
      lastStudiedAt: 1,
    })
    await legacyDatabase.favorites.put({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      updatedAt: 1,
    })
    legacyDatabase.close()

    database = createDatabase(databaseName, { indexedDB, IDBKeyRange })
    await database.open()

    expect(database.verno).toBe(2)
    await expect(database.progress.get(['vocabulary', 'n5-vocab-001'])).resolves.toMatchObject({
      status: 'learning',
    })
    await expect(database.favorites.get(['vocabulary', 'n5-vocab-001'])).resolves.toBeTruthy()
    await expect(database.dailyMissions.count()).resolves.toBe(0)
  })
})
