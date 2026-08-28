import { createContext, useContext } from 'react'

export const VocabularySessionContext = createContext(null)

export function useVocabularySession() {
  const context = useContext(VocabularySessionContext)

  if (!context) {
    throw new Error('useVocabularySession must be used inside VocabularySessionProvider')
  }

  return context
}
