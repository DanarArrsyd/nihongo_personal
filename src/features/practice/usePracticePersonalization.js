import { useEffect, useState } from 'react'
import { listAllProgress as loadProgress } from '../../db/progressRepository.js'
import { listQuizHistory as loadHistory } from '../../db/quizHistoryRepository.js'
import { usePersistenceStatus } from '../persistence/PersistenceContext.js'

const initialState = { history: [], progress: [], isLoading: true }

export default function usePracticePersonalization(repositories = {}) {
  const { reportFailure } = usePersistenceStatus()
  const [state, setState] = useState(initialState)
  const listAllProgress = repositories.listAllProgress ?? loadProgress
  const listQuizHistory = repositories.listQuizHistory ?? loadHistory

  useEffect(() => {
    let active = true

    Promise.all([listAllProgress(), listQuizHistory()])
      .then(([progress, history]) => {
        if (active) setState({ progress, history, isLoading: false })
      })
      .catch((error) => {
        reportFailure(error)
        if (active) setState({ history: [], progress: [], isLoading: false })
      })

    return () => { active = false }
  }, [listAllProgress, listQuizHistory, reportFailure])

  return state
}
