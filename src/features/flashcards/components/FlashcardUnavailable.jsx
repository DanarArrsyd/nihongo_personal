import { AlertCircle } from 'lucide-react'

export default function FlashcardUnavailable({
  title = 'Flashcard belum tersedia',
  description = 'Deck ini belum dapat dipelajari. Coba buat sesi baru.',
  primaryAction,
  secondaryAction,
}) {
  return (
    <section
      aria-labelledby="flashcard-unavailable-heading"
      className="flashcard-unavailable rounded-2xl border border-border bg-surface p-6 sm:p-8"
    >
      <AlertCircle aria-hidden="true" className="text-accent" size={24} />
      <h2 id="flashcard-unavailable-heading" className="mt-4 text-2xl font-semibold text-ink">
        {title}
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-ink-muted">{description}</p>
      {primaryAction || secondaryAction ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}
    </section>
  )
}
