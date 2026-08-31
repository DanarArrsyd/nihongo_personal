import { RATING_OPTIONS } from './ratingOptions.js'

export default function RatingControls({ disabled, onRate }) {
  return (
    <section aria-labelledby="flashcard-rating-heading" className="flashcard-rating-controls mt-5">
      <h2 id="flashcard-rating-heading" className="sr-only">Nilai ingatan Anda</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {RATING_OPTIONS.map((option) => {
          const Icon = option.icon

          return (
            <button
              key={option.value}
              type="button"
              aria-label={`${option.label}, tombol ${option.shortcut}`}
              disabled={disabled}
              onClick={() => onRate?.(option.value)}
              className="flashcard-rating-button min-h-11 rounded-xl border border-border bg-surface px-3 py-3 text-left text-ink transition-colors hover:border-ink-muted hover:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex items-center justify-between gap-2 text-sm font-semibold text-ink">
                <span className="inline-flex items-center gap-2 text-ink">
                  <Icon aria-hidden="true" className={option.iconClass} size={17} />
                  {option.label}
                </span>
                <kbd className="rounded border border-border bg-paper-deep px-1.5 py-0.5 text-xs text-ink-muted">
                  {option.shortcut}
                </kbd>
              </span>
              <span className="mt-1 block text-xs text-ink-muted">{option.description}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
