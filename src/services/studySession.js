import { normalizeTimestamp } from '../db/validation.js'

export function createStudySession({
  kind,
  module,
  now = () => new Date(),
  createId = () => crypto.randomUUID(),
}) {
  return {
    sessionId: createId(),
    kind,
    module,
    startedAt: normalizeTimestamp(now()),
  }
}

export function completeStudySession({
  session,
  itemCount,
  correctCount,
  score,
  now = () => new Date(),
}) {
  const endedAt = normalizeTimestamp(now())
  const duration = Math.max(0, new Date(endedAt).getTime() - new Date(session.startedAt).getTime())
  const summary = {
    sessionId: session.sessionId,
    kind: session.kind,
    module: session.module,
    startedAt: session.startedAt,
    endedAt,
    duration,
    itemCount,
  }

  if (session.kind === 'quiz') {
    summary.correctCount = correctCount
    summary.score = score
  }

  return summary
}
