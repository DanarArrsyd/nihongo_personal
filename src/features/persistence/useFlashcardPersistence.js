import { useCallback, useMemo } from 'react'

import { recordFlashcardRating as persistFlashcardRating } from '../../db/reviewRepository.js'
import { saveStudySession as persistStudySession } from '../../db/studySessionRepository.js'
import { completeStudySession } from '../../services/studySession.js'
import { usePersistenceStatus } from './PersistenceContext.js'

export function useFlashcardPersistence(session, repositories = {}) {
  const { reportFailure } = usePersistenceStatus()
  const recordFlashcardRating = repositories.recordFlashcardRating ?? persistFlashcardRating
  const saveStudySession = repositories.saveStudySession ?? persistStudySession
  const { sessionId, kind, module, startedAt } = session

  const onResponse = useCallback((response) => {
    void Promise.resolve()
      .then(() => recordFlashcardRating({ sessionId, response }))
      .catch(reportFailure)
  }, [recordFlashcardRating, reportFailure, sessionId])

  const onComplete = useCallback(({ itemCount }) => {
    void Promise.resolve()
      .then(() => completeStudySession({
        session: { sessionId, kind, module, startedAt },
        itemCount,
      }))
      .then(saveStudySession)
      .catch(reportFailure)
  }, [kind, module, reportFailure, saveStudySession, sessionId, startedAt])

  return useMemo(() => ({ onComplete, onResponse }), [onComplete, onResponse])
}

export default useFlashcardPersistence
