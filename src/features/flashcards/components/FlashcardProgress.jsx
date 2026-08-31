export default function FlashcardProgress({ current, percentage, total }) {
  return (
    <aside className="flashcard-progress rounded-2xl border border-border bg-paper-deep p-4 lg:sticky lg:top-6">
      <div className="flex items-center justify-between gap-4 lg:block">
        <div>
          <p className="text-xs font-semibold tracking-[0.1em] text-ink-muted uppercase">Kemajuan</p>
          <p className="mt-1 text-sm font-semibold text-ink">Kartu {current} dari {total}</p>
        </div>
        <p className="text-sm font-semibold text-ink">{percentage}%</p>
      </div>
      <div
        role="progressbar"
        aria-label="Kemajuan sesi flashcard"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={percentage}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"
      >
        <div
          aria-hidden="true"
          className="h-full rounded-full bg-accent transition-[width] motion-reduce:transition-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </aside>
  )
}
