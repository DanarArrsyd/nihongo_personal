import Button from '../../../components/ui/Button'

export default function SentenceCompletionQuestion({ question, disabled = false, onAnswer }) {
  const headingId = `question-${question.id}`

  return (
    <section aria-labelledby={headingId}>
      <p className="text-sm font-semibold text-ink-muted">{question.instruction}</p>
      <h2
        id={headingId}
        lang={question.content.lang}
        className="mt-4 flex flex-wrap items-baseline gap-x-1 font-japanese text-2xl font-semibold leading-relaxed text-ink sm:text-3xl"
      >
        <span>{question.content.before}</span>
        <span
          role="img"
          aria-label="Bagian kosong"
          className="inline-flex min-w-16 justify-center border-b-2 border-accent px-2 text-accent"
        >
          <span aria-hidden="true">＿＿</span>
        </span>
        <span>{question.content.after}</span>
      </h2>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Pilihan jawaban">
        {question.options.map((option) => (
          <li key={`${typeof option.value}:${String(option.value)}`}>
            <Button
              type="button"
              variant="secondary"
              disabled={disabled}
              onClick={() => onAnswer(option.value)}
              lang={option.lang}
              className="w-full px-5 py-3.5 font-japanese text-lg sm:min-h-14"
            >
              {option.label}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
