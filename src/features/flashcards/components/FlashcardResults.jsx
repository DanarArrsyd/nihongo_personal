import { RotateCcw } from 'lucide-react'

import Button from '../../../components/ui/Button.jsx'
import { RATING_OPTIONS } from './ratingOptions.js'

function frontTextClass(card) {
  return card.front.primary.lang === 'ja' ? 'font-japanese' : ''
}

export default function FlashcardResults({ headingRef, onRestart, resultAction, state, ratingCounts }) {
  const cardsById = new Map(state.cards.map((card) => [card.id, card]))

  return (
    <section
      aria-labelledby="flashcard-results-heading"
      className="flashcard-results mx-auto w-full max-w-3xl"
    >
      <header className="rounded-2xl border border-border bg-surface p-6 shadow-[0_12px_40px_rgba(64,54,41,0.05)] sm:p-8">
        <p className="text-sm font-semibold tracking-[0.12em] text-accent uppercase">Sesi selesai</p>
        <h2
          ref={headingRef}
          id="flashcard-results-heading"
          tabIndex={-1}
          className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl"
        >
          Hasil flashcard
        </h2>
        <p className="mt-4 text-base text-ink-muted">
          {state.responses.length} kartu telah Anda nilai.
        </p>
        {resultAction ?? (typeof onRestart === 'function' ? (
          <Button type="button" className="mt-7" onClick={onRestart}>
            <RotateCcw aria-hidden="true" size={17} />
            Mulai lagi
          </Button>
        ) : null)}
      </header>

      <section aria-label="Distribusi penilaian" className="mt-8">
        <h3 className="text-xl font-semibold text-ink">Distribusi penilaian</h3>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {RATING_OPTIONS.map((option) => {
            const Icon = option.icon
            const count = ratingCounts[option.value]

            return (
              <li
                key={option.value}
                aria-label={`${option.label}: ${count}`}
                className="flashcard-result-rating rounded-xl border border-border bg-surface p-4"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Icon aria-hidden="true" className={option.iconClass} size={17} />
                  <span className="text-ink">{option.label}</span>
                </span>
                <strong className="mt-2 block text-2xl font-semibold text-ink">{count}</strong>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-label="Kartu yang diselesaikan" className="mt-8">
        <h3 className="text-xl font-semibold text-ink">Kartu yang diselesaikan</h3>
        <ol className="mt-4 space-y-3">
          {state.responses.map((response, index) => {
            const card = cardsById.get(response.cardId)
            const rating = RATING_OPTIONS.find((option) => option.value === response.rating)
            const Icon = rating.icon

            return (
              <li
                key={response.cardId}
                className="flashcard-result-item flex min-h-11 items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">
                    Kartu {index + 1}
                  </p>
                  <p
                    lang={card.front.primary.lang}
                    className={`mt-1 truncate text-lg font-semibold text-ink ${frontTextClass(card)}`}
                  >
                    {card.front.primary.text}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink">
                  <Icon aria-hidden="true" className={rating.iconClass} size={17} />
                  <span className="text-ink">{rating.label}</span>
                </span>
              </li>
            )
          })}
        </ol>
      </section>
    </section>
  )
}
