import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as favoritesRepository from '../../db/favoritesRepository'
import { usePersistenceStatus } from '../persistence/PersistenceContext'
import { getFavoriteKey } from './services/libraryCatalog'

const itemTypes = ['vocabulary', 'kanji', 'grammar']

export default function useLibraryFavorites({ favoritesStore = favoritesRepository } = {}) {
  const [loadVersion, setLoadVersion] = useState(0)
  const [state, setState] = useState({ favoriteKeys: new Set(), status: 'loading' })
  const favoriteKeysRef = useRef(new Set())
  const writeQueuesRef = useRef(new Map())
  const { reportFailure } = usePersistenceStatus()

  useEffect(() => {
    let active = true

    Promise.all(itemTypes.map((itemType) => favoritesStore.listFavorites(itemType)))
      .then((groups) => new Set(groups.flatMap((records) => (
        records.map((record) => getFavoriteKey(record.itemType, record.itemId))
      ))))
      .then((favoriteKeys) => {
        if (!active) return
        favoriteKeysRef.current = favoriteKeys
        setState({ favoriteKeys, status: 'ready' })
      })
      .catch((error) => {
        reportFailure(error)
        if (active) setState({ favoriteKeys: new Set(), status: 'error' })
      })

    return () => {
      active = false
    }
  }, [favoritesStore, loadVersion, reportFailure])

  const retry = useCallback(() => {
    setState({ favoriteKeys: new Set(), status: 'loading' })
    setLoadVersion((version) => version + 1)
  }, [])

  const toggleFavorite = useCallback((itemType, itemId) => {
    const key = getFavoriteKey(itemType, itemId)
    const nextKeys = new Set(favoriteKeysRef.current)
    const favorite = !nextKeys.has(key)

    if (favorite) nextKeys.add(key)
    else nextKeys.delete(key)

    favoriteKeysRef.current = nextKeys
    setState({ favoriteKeys: nextKeys, status: 'ready' })

    const previous = writeQueuesRef.current.get(key) ?? Promise.resolve()
    const operation = previous.then(() => favoritesStore.setFavorite({
      favorite,
      itemId,
      itemType,
      timestamp: new Date(),
    }))
    const settled = operation.catch(reportFailure)

    writeQueuesRef.current.set(key, settled)
    void settled.then(() => {
      if (writeQueuesRef.current.get(key) === settled) writeQueuesRef.current.delete(key)
    })
  }, [favoritesStore, reportFailure])

  return useMemo(
    () => ({ ...state, retry, toggleFavorite }),
    [retry, state, toggleFavorite],
  )
}
