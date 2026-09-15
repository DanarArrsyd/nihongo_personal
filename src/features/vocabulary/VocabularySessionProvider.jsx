import { useCallback, useEffect, useMemo, useState } from 'react'
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
  const { reportFailure } = usePersistenceStatus()

  useEffect(() => {
    let ignore = false

    async function hydrate() {
      const [progressResult, favoritesResult] = await Promise.allSettled([
        progressStore.listProgress(itemType),
        favoritesStore.listFavorites(itemType),
      ])

      if (ignore) return

      if (progressResult.status === 'fulfilled') {
        setStatuses(Object.fromEntries(
          progressResult.value.map((record) => [record.itemId, record.status]),
        ))
      } else {
        reportFailure(progressResult.reason)
      }

      if (favoritesResult.status === 'fulfilled') {
        setFavorites(new Set(favoritesResult.value.map((record) => record.itemId)))
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
    setStatuses((current) => ({ ...current, [id]: status }))
    void progressStore
      .setProgressStatus({ itemType, itemId: id, status, timestamp: new Date() })
      .catch(reportFailure)
  }, [progressStore, reportFailure])
  const isFavorite = useCallback((id) => favorites.has(id), [favorites])
  const toggleFavorite = useCallback((id) => {
    const favorite = !favorites.has(id)

    setFavorites((current) => {
      const next = new Set(current)
      if (favorite) next.add(id)
      else next.delete(id)
      return next
    })

    void favoritesStore
      .setFavorite({ itemType, itemId: id, favorite, timestamp: new Date() })
      .catch(reportFailure)
  }, [favorites, favoritesStore, reportFailure])

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
