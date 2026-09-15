import { database as defaultDatabase } from './database.js'
import { normalizeTimestamp } from './validation.js'

function validateSessionId(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId.trim()) {
    throw new Error('sessionId must be a non-blank string')
  }
}

export async function saveStudySession(summary, db = defaultDatabase) {
  validateSessionId(summary?.sessionId)

  const sessionRecord = {
    ...summary,
    startedAt: normalizeTimestamp(summary.startedAt),
    endedAt: normalizeTimestamp(summary.endedAt),
  }

  return db.transaction('rw', db.studySessions, async () => {
    const existingRecord = await db.studySessions.get(sessionRecord.sessionId)

    if (existingRecord) return existingRecord

    await db.studySessions.add(sessionRecord)
    return sessionRecord
  })
}
