import Dexie from 'dexie'

export function createDatabase(name, dependencies) {
  const database = new Dexie(name, dependencies)

  database.version(1).stores({
    progress: '[itemType+itemId], itemType, status, lastStudiedAt',
    reviews: '[itemType+itemId], itemType, dueAt',
    quizHistory: '++id, &operationId, sessionId, questionId, timestamp, [itemType+itemId]',
    studySessions: 'sessionId, module, startedAt, endedAt',
    favorites: '[itemType+itemId], itemType, updatedAt',
    settings: 'key',
  })

  return database
}

export const database = createDatabase('nihongo-personal')
