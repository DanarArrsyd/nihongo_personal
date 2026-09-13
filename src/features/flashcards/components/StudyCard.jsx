import { Eye } from 'lucide-react'

import Button from '../../../components/ui/Button.jsx'

function CardText({ as: Element = 'span', className = '', value, ...props }) {
  if (!value?.text) return null

  return (
    <Element
      className={`${value.lang === 'ja' ? 'font-japanese' : ''} ${className}`}
      lang={value.lang}
      {...props}
    >
      {value.text}
    </Element>
  )
}

export default function StudyCard({
  answerHeadingRef,
  card,
  cardHeadingRef,
  onReveal,
  revealed,
}) {
  const answerHeadingId = `${card.id}-answer-heading`

  return (
    <article className="flashcard-study-card min-w-0">
      <div className="grid min-w-0 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
        <p className="flashcard-module-label flex items-center justify-center border-b border-border bg-paper-deep px-3 py-4 text-xs font-semibold tracking-[0.12em] text-accent uppercase sm:border-r sm:border-b-0 sm:[writing-mode:vertical-rl]">
          {card.front.eyebrow}
        </p>

        <div className="min-w-0 p-5 sm:p-7 lg:p-8">
          <header className="flashcard-front flex min-h-64 flex-col items-center justify-center text-center">
            <CardText
              as="h2"
              ref={cardHeadingRef}
              value={card.front.primary}
              tabIndex={-1}
              className="max-w-full break-words text-4xl font-semibold tracking-[-0.04em] text-ink outline-none [overflow-wrap:anywhere] sm:text-6xl focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
            />
            <p className="mt-5 max-w-md text-sm leading-6 text-ink-muted">{card.front.hint}</p>
          </header>

          {revealed ? (
            <section
              aria-labelledby={answerHeadingId}
              aria-live="polite"
              className="flashcard-answer border-t border-border pt-6"
            >
              <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">Jawaban</p>
              <CardText
                as="h3"
                ref={answerHeadingRef}
                id={answerHeadingId}
                tabIndex={-1}
                value={card.back.title}
                className="mt-2 break-words text-2xl font-semibold tracking-[-0.03em] text-ink outline-none [overflow-wrap:anywhere] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
              />

              {card.back.meaning ? (
                <CardText
                  as="p"
                  value={{ text: card.back.meaning }}
                  className="mt-2 text-lg text-ink"
                />
              ) : null}

              {card.back.details.length > 0 ? (
                <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                  {card.back.details.map((detail) => (
                    <div key={detail.label} className="rounded-xl bg-paper-deep px-4 py-3">
                      <dt className="text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">
                        {detail.label}
                      </dt>
                      <dd className="mt-1 break-words text-sm font-medium text-ink [overflow-wrap:anywhere]">
                        <CardText value={detail.value} />
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {card.back.example ? (
                <section aria-label="Contoh kalimat" className="mt-6 border-l-2 border-gold pl-4">
                  <p className="text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">
                    Contoh
                  </p>
                  <CardText
                    as="p"
                    value={{ text: card.back.example.japanese, lang: 'ja' }}
                    className="mt-2 break-words text-base font-medium text-ink [overflow-wrap:anywhere]"
                  />
                  <CardText
                    as="p"
                    value={{ text: card.back.example.reading, lang: 'ja' }}
                    className="mt-1 break-words text-sm text-ink-muted [overflow-wrap:anywhere]"
                  />
                  <CardText
                    as="p"
                    value={{ text: card.back.example.meaning }}
                    className="mt-1 text-sm text-ink"
                  />
                </section>
              ) : null}
            </section>
          ) : (
            <div className="flashcard-reveal border-t border-border pt-6 text-center">
              <Button type="button" onClick={onReveal} className="w-full sm:w-auto">
                <Eye aria-hidden="true" size={18} />
                Tampilkan jawaban
              </Button>
              <p className="mt-3 text-xs text-ink-muted">Tekan Spasi untuk membuka jawaban</p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
