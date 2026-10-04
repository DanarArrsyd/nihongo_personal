import { X } from 'lucide-react'
import { useContext } from 'react'
import { PersistenceContext } from './PersistenceContext'

export default function PersistenceNotice() {
  const persistenceStatus = useContext(PersistenceContext)

  if (!persistenceStatus?.message) return null

  const { dismissFailure, message } = persistenceStatus

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-accent/35 bg-accent-soft/75 text-ink"
    >
      <div className="mx-auto flex max-w-[90rem] items-start gap-3 px-4 py-3 sm:px-8 lg:px-12">
        <p className="min-w-0 flex-1 text-sm leading-6">
          {message}
        </p>
        <button
          type="button"
          aria-label="Tutup peringatan penyimpanan"
          onClick={dismissFailure}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-white/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <X aria-hidden="true" size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
