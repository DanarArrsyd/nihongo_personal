import { useState } from 'react'
import Button from '../../../components/ui/Button'

export default function TypingQuestion({ question, disabled = false, onAnswer }) {
  const [answer, setAnswer] = useState('')
  const headingId = `question-${question.id}`
  const inputId = `answer-${question.id}`

  function submitAnswer(event) {
    event.preventDefault()
    if (!disabled) onAnswer(answer)
  }

  return (
    <section aria-labelledby={headingId}>
      <p className="text-sm font-semibold text-ink-muted">{question.instruction}</p>
      <h2
        id={headingId}
        lang={question.content.lang}
        className={`mt-3 text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl ${
          question.content.lang === 'ja' ? 'font-japanese' : ''
        }`}
      >
        {question.content.text}
      </h2>
      <form aria-label="Kirim jawaban" className="mt-8" onSubmit={submitAnswer}>
        <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
          Jawaban
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id={inputId}
            type="text"
            value={answer}
            disabled={disabled}
            onChange={(event) => setAnswer(event.target.value)}
            autoComplete="off"
            className="min-h-11 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button type="submit" disabled={disabled} className="shrink-0 sm:min-w-40">
            Kirim jawaban
          </Button>
        </div>
      </form>
    </section>
  )
}
