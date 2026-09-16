import { useCallback, useMemo } from 'react'
import { recordQuizResponse as persistQuizResponse } from '../../db/quizHistoryRepository.js'
import { saveStudySession as persistStudySession } from '../../db/studySessionRepository.js'
import { completeStudySession } from '../../services/studySession.js'
import { usePersistenceStatus } from './PersistenceContext.js'

export function useQuizPersistence(session, repositories = {}) {
  const { reportFailure } = usePersistenceStatus()
  const recordQuizResponse = repositories.recordQuizResponse ?? persistQuizResponse
  const saveStudySession = repositories.saveStudySession ?? persistStudySession
  const { sessionId, kind, module, startedAt } = session

  const onResponse = useCallback((response) => {
    void Promise.resolve()
      .then(() => recordQuizResponse({ sessionId, response }))
      .catch(reportFailure)
  }, [recordQuizResponse, reportFailure, sessionId])

  const onComplete = useCallback((summary) => {
    void Promise.resolve()
      .then(() => completeStudySession({
        session: { sessionId, kind, module, startedAt },
        ...summary,
      }))
      .then(saveStudySession)
      .catch(reportFailure)
  }, [kind, module, reportFailure, saveStudySession, sessionId, startedAt])

  return useMemo(() => ({ onComplete, onResponse }), [onComplete, onResponse])
}

export default useQuizPersistence
