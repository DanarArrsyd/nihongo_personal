import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import LoadingState from '../../components/feedback/LoadingState'
import * as favoritesRepository from '../../db/favoritesRepository'
import * as progressRepository from '../../db/progressRepository'
import { usePersistenceStatus } from '../persistence/PersistenceContext'
import { VocabularySessionContext } from './VocabularySessionContext'

const itemType = 'vocabulary'

export default function VocabularySessionProvider({
  children,
  progressStore = progressRepository,
  favoritesStore = favoritesRepository,
}) {
  const [statuses, setStatuses] = useState({})
  const [favorites, setFavorites] = useState(() => new Set())
  const [hydrated, setHydrated] = useState(false)
  const statusesRef = useRef({})
  const favoritesRef = useRef(new Set())
  const writeQueuesRef = useRef(new Map())
  const { reportFailure } = usePersistenceStatus()

  const enqueueWrite = useCallback((key, write) => {
    const previous = writeQueuesRef.current.get(key) ?? Promise.resolve()
    const operation = previous.then(write)
    const settled = operation.catch(reportFailure)

    writeQueuesRef.current.set(key, settled)
    void settled.then(() => {
      if (writeQueuesRef.current.get(key) === settled) {
        writeQueuesRef.current.delete(key)
      }
    })
  }, [reportFailure])

  useEffect(() => {
    let ignore = false

    async function hydrate() {
      const [progressResult, favoritesResult] = await Promise.allSettled([
        progressStore.listProgress(itemType),
        favoritesStore.listFavorites(itemType),
      ])

      if (ignore) return

      if (progressResult.status === 'fulfilled') {
        const nextStatuses = Object.fromEntries(
          progressResult.value.map((record) => [record.itemId, record.status]),
        )
        statusesRef.current = nextStatuses
        setStatuses(nextStatuses)
      } else {
        reportFailure(progressResult.reason)
      }

      if (favoritesResult.status === 'fulfilled') {
        const nextFavorites = new Set(favoritesResult.value.map((record) => record.itemId))
        favoritesRef.current = nextFavorites
        setFavorites(nextFavorites)
      } else {
        reportFailure(favoritesResult.reason)
      }

      setHydrated(true)
    }

    hydrate()

    return () => {
      ignore = true
    }
  }, [favoritesStore, progressStore, reportFailure])

  const getStatus = useCallback((id) => statuses[id] ?? 'new', [statuses])
  const setStatus = useCallback((id, status) => {
    const nextStatuses = { ...statusesRef.current, [id]: status }
    statusesRef.current = nextStatuses
    setStatuses(nextStatuses)

    const payload = { itemType, itemId: id, status, timestamp: new Date() }
    enqueueWrite(`status:${id}`, () => progressStore.setProgressStatus(payload))
  }, [enqueueWrite, progressStore])
  const isFavorite = useCallback((id) => favorites.has(id), [favorites])
  const toggleFavorite = useCallback((id) => {
    const nextFavorites = new Set(favoritesRef.current)
    const favorite = !nextFavorites.has(id)
    if (favorite) nextFavorites.add(id)
    else nextFavorites.delete(id)
    favoritesRef.current = nextFavorites
    setFavorites(nextFavorites)

    const payload = { itemType, itemId: id, favorite, timestamp: new Date() }
    enqueueWrite(`favorite:${id}`, () => favoritesStore.setFavorite(payload))
  }, [enqueueWrite, favoritesStore])

  const value = useMemo(
    () => ({ getStatus, isFavorite, setStatus, toggleFavorite }),
    [getStatus, isFavorite, setStatus, toggleFavorite],
  )

  return hydrated ? (
    <VocabularySessionContext.Provider value={value}>
      {children}
    </VocabularySessionContext.Provider>
  ) : (
    <LoadingState label="Loading vocabulary" />
  )
}
