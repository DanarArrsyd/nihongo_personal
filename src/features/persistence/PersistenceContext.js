import { createContext, useContext } from 'react'

export const PersistenceContext = createContext(null)

export function usePersistenceStatus() {
  const context = useContext(PersistenceContext)

  if (!context) {
    throw new Error('usePersistenceStatus must be used inside PersistenceProvider')
  }

  return context
}
