export default function FlashcardProgress({ current, percentage, total }) {
  return (
    <aside className="flashcard-progress rounded-2xl border border-border bg-paper-deep p-4 xl:sticky xl:top-6">
      <div className="flex min-w-0 items-center justify-between gap-4 xl:block">
        <div>
          <p className="text-xs font-semibold tracking-[0.1em] text-ink-muted uppercase">Kemajuan</p>
          <p className="mt-1 text-sm font-semibold text-ink">Kartu {current} dari {total}</p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-ink">{percentage}%</p>
      </div>
      <div
        role="progressbar"
        aria-label="Kemajuan sesi flashcard"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={percentage}
        className="flashcard-progress-rail mt-3"
      >
        <div
          aria-hidden="true"
          className="rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </aside>
  )
}
