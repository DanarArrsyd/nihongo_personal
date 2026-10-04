import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  completeDailyMissionTask as persistTaskCompletion,
  getOrCreateDailyMission as persistMission,
  startDailyMission as persistMissionStart,
} from '../../db/dailyMissionRepository.js'
import { listProgress as loadProgress } from '../../db/progressRepository.js'
import { listDueReviews as loadDueReviews } from '../../db/reviewRepository.js'
import { usePersistenceStatus } from '../persistence/PersistenceContext.js'
import { generateDailyMission, getMissionDate } from './services/dailyMission.js'

const defaultRepositories = {
  completeTask: persistTaskCompletion,
  getOrCreateMission: persistMission,
  listDueReviews: loadDueReviews,
  listProgress: loadProgress,
  startMission: persistMissionStart,
}

const getCurrentDate = () => new Date()

export default function useDailyMission({
  now = getCurrentDate,
  repositories = defaultRepositories,
} = {}) {
  const [loadVersion, setLoadVersion] = useState(0)
  const [state, setState] = useState({ status: 'loading', mission: null })
  const { reportFailure } = usePersistenceStatus()

  useEffect(() => {
    let active = true
    const currentDate = now()
    const date = getMissionDate(currentDate)
    const generatedAt = currentDate.toISOString()

    Promise.all([
      repositories.listDueReviews(currentDate),
      repositories.listProgress('vocabulary'),
      repositories.listProgress('kanji'),
      repositories.listProgress('grammar'),
    ])
      .then(([dueReviews, vocabulary, kanji, grammar]) => (
        generateDailyMission({
          date,
          generatedAt,
          dueReviews,
          progress: { vocabulary, kanji, grammar },
        })
      ))
      .then(repositories.getOrCreateMission)
      .then((mission) => {
        if (active) setState({ status: 'ready', mission })
      })
      .catch((error) => {
        reportFailure(error)
        if (active) setState({ status: 'error', mission: null })
      })

    return () => {
      active = false
    }
  }, [loadVersion, now, reportFailure, repositories])

  const retry = useCallback(() => {
    setState({ status: 'loading', mission: null })
    setLoadVersion((version) => version + 1)
  }, [])

  const start = useCallback(async () => {
    if (!state.mission) return null

    try {
      const mission = await repositories.startMission(state.mission.date, now().toISOString())
      setState({ status: 'ready', mission })
      return mission
    } catch (error) {
      reportFailure(error)
      setState((current) => ({ ...current, status: 'error' }))
      return null
    }
  }, [now, reportFailure, repositories, state.mission])

  const completeTask = useCallback(async (taskId) => {
    if (!state.mission) return null

    try {
      const mission = await repositories.completeTask({
        date: state.mission.date,
        taskId,
        timestamp: now().toISOString(),
      })
      setState({ status: 'ready', mission })
      return mission
    } catch (error) {
      reportFailure(error)
      return null
    }
  }, [now, reportFailure, repositories, state.mission])

  return useMemo(() => ({
    ...state,
    completeTask,
    retry,
    start,
  }), [completeTask, retry, start, state])
}

