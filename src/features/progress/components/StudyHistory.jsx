import EmptyState from '../../../components/feedback/EmptyState.jsx'

const formatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Waktu tidak tersedia' : formatter.format(date)
}

export default function StudyHistory({ history }) {
  return (
    <section aria-labelledby="history-heading" className="rounded-2xl border border-border bg-surface">
      <header className="border-b border-border px-5 py-5 sm:px-7">
        <p className="font-japanese text-sm font-semibold text-accent">履歴</p>
        <h2 id="history-heading" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-ink">
          Riwayat belajar
        </h2>
      </header>

      {history.length ? (
        <ol className="divide-y divide-border">
          {history.map((session) => (
            <li key={session.id} className="grid gap-3 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-7">
              <div className="min-w-0">
                <h3 className="font-semibold text-ink">{session.label}</h3>
                <p className="mt-1 text-xs text-ink-muted">{formatDate(session.date)}</p>
              </div>
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm tabular-nums text-ink-muted sm:justify-end">
                <span><strong className="font-semibold text-ink">{session.durationMinutes}</strong> menit</span>
                <span><strong className="font-semibold text-ink">{session.itemCount}</strong> item</span>
                {session.accuracy !== null ? <span><strong className="font-semibold text-ink">{session.accuracy}%</strong> akurasi</span> : null}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="p-5 sm:p-7">
          <EmptyState
            title="Belum ada sesi selesai"
            description="Selesaikan quiz, flashcards, atau review. Riwayatnya akan muncul otomatis di sini."
          />
        </div>
      )}
    </section>
  )
}
