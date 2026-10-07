import { CloudOff, Download, RefreshCw, WifiOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => (
    typeof navigator === 'undefined' ? true : navigator.onLine
  ))

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export default function PwaStatus({ useRegistration = useRegisterSW }) {
  const [registrationError, setRegistrationError] = useState(false)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegistration({
    onRegisterError(error) {
      console.error('Service worker registration failed', error)
      setRegistrationError(true)
    },
  })
  const isOnline = useOnlineStatus()

  let notice = null

  if (needRefresh) {
    notice = {
      description: 'Versi terbaru siap digunakan. Perbarui saat kamu siap.',
      icon: RefreshCw,
      title: 'Pembaruan tersedia',
      tone: 'update',
    }
  } else if (!isOnline) {
    notice = {
      description: 'Materi yang sudah dimuat dan progress lokal tetap dapat digunakan.',
      icon: WifiOff,
      title: 'Kamu sedang offline',
      tone: 'offline',
    }
  } else if (offlineReady) {
    notice = {
      description: 'App shell dan materi belajar lokal kini tersedia tanpa koneksi.',
      icon: Download,
      title: 'Siap digunakan offline',
      tone: 'ready',
    }
  } else if (registrationError) {
    notice = {
      description: 'Mode offline belum aktif. Aplikasi tetap dapat digunakan selama online.',
      icon: CloudOff,
      title: 'Offline belum tersedia',
      tone: 'error',
    }
  }

  if (!notice) return null

  const Icon = notice.icon
  const dismiss = () => {
    setNeedRefresh(false)
    setOfflineReady(false)
    setRegistrationError(false)
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-4 left-4 z-50 rounded-2xl border border-border bg-surface p-4 shadow-[0_18px_60px_rgba(64,54,41,0.18)] sm:left-auto sm:w-[26rem] lg:right-8"
    >
      <div className="flex items-start gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${notice.tone === 'offline' || notice.tone === 'error' ? 'bg-accent-soft text-accent' : 'bg-matcha-soft text-matcha'}`}>
          <Icon size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{notice.title}</p>
          <p className="mt-1 text-sm leading-5 text-ink-muted">{notice.description}</p>
          {needRefresh ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateServiceWorker(true)}
                className="min-h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-[#B9403C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Perbarui sekarang
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="min-h-11 rounded-xl px-4 text-sm font-semibold text-ink-muted transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Nanti
              </button>
            </div>
          ) : null}
        </div>
        {!needRefresh && isOnline ? (
          <button
            type="button"
            aria-label="Tutup status PWA"
            onClick={dismiss}
            className="grid size-11 shrink-0 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X size={18} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </aside>
  )
}
