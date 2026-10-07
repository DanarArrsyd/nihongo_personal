import { useCallback, useEffect, useMemo, useState } from 'react'

import { listDailyMissions } from '../../db/dailyMissionRepository.js'
import { listAllProgress } from '../../db/progressRepository.js'
import { listQuizHistory } from '../../db/quizHistoryRepository.js'
import { listDueReviews, listReviews } from '../../db/reviewRepository.js'
import { listStudySessions } from '../../db/studySessionRepository.js'
import { getGrammar } from '../grammar/services/grammarData.js'
import { getAllKana } from '../kana/services/kanaData.js'
import { getKanji } from '../kanji/services/kanjiData.js'
import { usePersistenceStatus } from '../persistence/PersistenceContext.js'
import { getVocabulary } from '../vocabulary/services/vocabularyData.js'
import { buildProgressAnalytics } from './services/progressAnalytics.js'

const catalogTotals = {
  grammar: getGrammar().length,
  kana: getAllKana('hiragana').length + getAllKana('katakana').length,
  kanji: getKanji().length,
  vocabulary: getVocabulary().length,
}

const defaultRepositories = {
  listDailyMissions,
  listDueReviews,
  listProgress: listAllProgress,
  listQuizHistory,
  listReviews,
  listStudySessions,
}

const getCurrentDate = () => new Date()

export default function useProgressAnalytics({
  now = getCurrentDate,
  repositories = defaultRepositories,
  totals = catalogTotals,
} = {}) {
  const [loadVersion, setLoadVersion] = useState(0)
  const [state, setState] = useState({ analytics: null, status: 'loading' })
  const { reportFailure } = usePersistenceStatus()

  useEffect(() => {
    let active = true
    const currentDate = now()

    Promise.all([
      repositories.listProgress(),
      repositories.listQuizHistory(),
      repositories.listReviews(),
      repositories.listStudySessions(),
      repositories.listDailyMissions(),
      repositories.listDueReviews(currentDate),
    ])
      .then(([progress, quizHistory, reviews, studySessions, dailyMissions, dueReviews]) => (
        buildProgressAnalytics({
          catalogTotals: totals,
          dailyMissions,
          dueReviews,
          now: currentDate,
          progress,
          quizHistory,
          reviews,
          studySessions,
        })
      ))
      .then((analytics) => {
        if (active) setState({ analytics, status: 'ready' })
      })
      .catch((error) => {
        reportFailure(error)
        if (active) setState({ analytics: null, status: 'error' })
      })

    return () => {
      active = false
    }
  }, [loadVersion, now, reportFailure, repositories, totals])

  const retry = useCallback(() => {
    setState({ analytics: null, status: 'loading' })
    setLoadVersion((version) => version + 1)
  }, [])

  return useMemo(() => ({ ...state, retry }), [retry, state])
}
