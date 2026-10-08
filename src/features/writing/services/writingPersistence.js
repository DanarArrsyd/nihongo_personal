import { database as defaultDatabase } from '../../../db/database.js'
import { applyAnswerResult } from '../../../db/progressRepository.js'
import { saveStudySession } from '../../../db/studySessionRepository.js'
import { completeStudySession } from '../../../services/studySession.js'

export async function recordWritingCompletion({ attempts, itemId, session }, db = defaultDatabase) {
  const safeAttempts = Math.max(1, attempts)
  const completedAt = new Date()
  const summary = completeStudySession({
    session,
    itemCount: 1,
    correctCount: 1,
    score: Math.max(40, Math.round(100 / safeAttempts)),
    now: () => completedAt,
  })

  return db.transaction('rw', db.progress, db.studySessions, async () => {
    const [progress, studySession] = await Promise.all([
      applyAnswerResult({
        itemType: 'kana',
        itemId,
        correct: true,
        timestamp: completedAt,
      }, db),
      saveStudySession(summary, db),
    ])

    return { progress, studySession }
  })
}
