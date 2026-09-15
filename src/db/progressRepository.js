import { database as defaultDatabase } from './database.js'

const SUPPORTED_STATUSES = new Set(['new', 'learning', 'familiar', 'mastered'])

function validateItemIdentifiers(itemType, itemId) {
  if (!itemType?.trim() || !itemId?.trim()) {
    throw new Error('itemType and itemId are required')
  }
}

function createProgressRecord(itemType, itemId) {
  return {
    itemType,
    itemId,
    status: 'learning',
    mastery: 0,
    correctCount: 0,
    incorrectCount: 0,
  }
}

export async function getProgress(itemType, itemId, db = defaultDatabase) {
  return (await db.progress.get([itemType, itemId])) ?? null
}

export async function listProgress(itemType, db = defaultDatabase) {
  return db.progress.where('itemType').equals(itemType).toArray()
}

export async function setProgressStatus({ itemType, itemId, status, timestamp }, db = defaultDatabase) {
  validateItemIdentifiers(itemType, itemId)

  if (!SUPPORTED_STATUSES.has(status)) {
    throw new Error('Unsupported progress status')
  }

  const existingRecord = await getProgress(itemType, itemId, db)
  const record = {
    ...(existingRecord ?? createProgressRecord(itemType, itemId)),
    status,
    lastStudiedAt: timestamp,
  }

  await db.progress.put(record)
  return record
}

export async function applyAnswerResult({ itemType, itemId, correct, timestamp }, db = defaultDatabase) {
  validateItemIdentifiers(itemType, itemId)

  const existingRecord = await getProgress(itemType, itemId, db)
  const record = {
    ...(existingRecord ?? createProgressRecord(itemType, itemId)),
    correctCount: (existingRecord?.correctCount ?? 0) + (correct ? 1 : 0),
    incorrectCount: (existingRecord?.incorrectCount ?? 0) + (correct ? 0 : 1),
    lastStudiedAt: timestamp,
  }

  await db.progress.put(record)
  return record
}
