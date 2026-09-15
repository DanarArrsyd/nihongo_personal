import { useCallback, useMemo, useState } from 'react'
import { PersistenceContext } from './PersistenceContext'

const persistenceFailureMessage = 'Penyimpanan lokal sedang bermasalah. Perubahan sesi ini mungkin tidak tersimpan setelah aplikasi ditutup.'

export default function PersistenceProvider({ children }) {
  const [message, setMessage] = useState(null)

  const reportFailure = useCallback((error) => {
    console.error(error)
    setMessage(persistenceFailureMessage)
  }, [])

  const dismissFailure = useCallback(() => setMessage(null), [])

  const value = useMemo(
    () => ({ dismissFailure, message, reportFailure }),
    [dismissFailure, message, reportFailure],
  )

  return (
    <PersistenceContext.Provider value={value}>
      {children}
    </PersistenceContext.Provider>
  )
}
