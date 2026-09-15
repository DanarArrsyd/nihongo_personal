import {
  normalizeRequiredTimestamp,
  validateNonBlankString,
  validateNonNegativeInteger,
  validateScore,
  validateStudySessionKind,
} from '../db/validation.js'

export function createStudySession({
  kind,
  module,
  now = () => new Date(),
  createId = () => crypto.randomUUID(),
}) {
  validateStudySessionKind(kind)
  validateNonBlankString(module, 'module')

  const sessionId = createId()
  validateNonBlankString(sessionId, 'sessionId')

  return {
    sessionId,
    kind,
    module,
    startedAt: normalizeRequiredTimestamp(now(), 'startedAt'),
  }
}

export function completeStudySession({
  session,
  itemCount,
  correctCount,
  score,
  now = () => new Date(),
}) {
  validateNonBlankString(session?.sessionId, 'sessionId')
  validateStudySessionKind(session.kind)
  validateNonBlankString(session.module, 'module')
  validateNonNegativeInteger(itemCount, 'itemCount')

  const startedAt = normalizeRequiredTimestamp(session.startedAt, 'startedAt')
  const endedAt = normalizeRequiredTimestamp(now(), 'endedAt')
  const duration = Math.max(0, new Date(endedAt).getTime() - new Date(startedAt).getTime())
  const summary = {
    sessionId: session.sessionId,
    kind: session.kind,
    module: session.module,
    startedAt,
    endedAt,
    duration,
    itemCount,
  }

  if (session.kind === 'quiz') {
    if (correctCount !== undefined) {
      validateNonNegativeInteger(correctCount, 'correctCount')
      summary.correctCount = correctCount
    }

    if (score !== undefined) {
      validateScore(score)
      summary.score = score
    }
  } else {
    if (correctCount !== undefined) {
      throw new Error('correctCount is only supported for quiz sessions')
    }

    if (score !== undefined) {
      throw new Error('score is only supported for quiz sessions')
    }
  }

  return summary
}
