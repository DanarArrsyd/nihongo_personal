import { useCallback, useMemo, useState } from 'react'
import { VocabularySessionContext } from './VocabularySessionContext'

export default function VocabularySessionProvider({ children }) {
  const [statuses, setStatuses] = useState({})
  const [favorites, setFavorites] = useState(() => new Set())

  const getStatus = useCallback((id) => statuses[id] ?? 'new', [statuses])
  const setStatus = useCallback((id, status) => {
    setStatuses((current) => ({ ...current, [id]: status }))
  }, [])
  const isFavorite = useCallback((id) => favorites.has(id), [favorites])
  const toggleFavorite = useCallback((id) => {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ getStatus, isFavorite, setStatus, toggleFavorite }),
    [getStatus, isFavorite, setStatus, toggleFavorite],
  )

  return (
    <VocabularySessionContext.Provider value={value}>
      {children}
    </VocabularySessionContext.Provider>
  )
}
