import Button from '../../../components/ui/Button'

export default function ChoiceQuestion({ question, disabled = false, onAnswer }) {
  const headingId = `question-${question.id}`

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
      <ul className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Pilihan jawaban">
        {question.options.map((option) => (
          <li key={`${typeof option.value}:${String(option.value)}`}>
            <Button
              type="button"
              variant="secondary"
              disabled={disabled}
              onClick={() => onAnswer(option.value)}
              lang={option.lang}
              className={`w-full px-5 py-3.5 text-base sm:min-h-14 ${
                option.lang === 'ja' ? 'font-japanese text-lg' : ''
              }`}
            >
              {option.label}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
