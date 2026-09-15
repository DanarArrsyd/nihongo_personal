import { database as defaultDatabase } from './database.js'
import {
  normalizeRequiredTimestamp,
  validateFiniteNonNegativeNumber,
  validateNonBlankString,
  validateNonNegativeInteger,
  validateScore,
  validateStudySessionKind,
} from './validation.js'

const COMMON_FIELDS = new Set([
  'sessionId',
  'kind',
  'module',
  'startedAt',
  'endedAt',
  'duration',
  'itemCount',
])
const QUIZ_FIELDS = new Set([...COMMON_FIELDS, 'correctCount', 'score'])

function validateFields(summary) {
  const allowedFields = summary.kind === 'quiz' ? QUIZ_FIELDS : COMMON_FIELDS

  if (Object.keys(summary).some((field) => !allowedFields.has(field))) {
    throw new Error('Unexpected study session field')
  }
}

export async function saveStudySession(summary, db = defaultDatabase) {
  validateNonBlankString(summary?.sessionId, 'sessionId')
  validateStudySessionKind(summary.kind)
  validateNonBlankString(summary.module, 'module')
  validateFields(summary)
  validateFiniteNonNegativeNumber(summary.duration, 'duration')
  validateNonNegativeInteger(summary.itemCount, 'itemCount')

  const startedAt = normalizeRequiredTimestamp(summary.startedAt, 'startedAt')
  const endedAt = normalizeRequiredTimestamp(summary.endedAt, 'endedAt')

  const sessionRecord = {
    sessionId: summary.sessionId,
    kind: summary.kind,
    module: summary.module,
    startedAt,
    endedAt,
    duration: summary.duration,
    itemCount: summary.itemCount,
  }

  if (Object.hasOwn(summary, 'correctCount')) {
    validateNonNegativeInteger(summary.correctCount, 'correctCount')
    sessionRecord.correctCount = summary.correctCount
  }

  if (Object.hasOwn(summary, 'score')) {
    validateScore(summary.score)
    sessionRecord.score = summary.score
  }

  return db.transaction('rw', db.studySessions, async () => {
    const existingRecord = await db.studySessions.get(sessionRecord.sessionId)

    if (existingRecord) return existingRecord

    await db.studySessions.add(sessionRecord)
    return sessionRecord
  })
}
