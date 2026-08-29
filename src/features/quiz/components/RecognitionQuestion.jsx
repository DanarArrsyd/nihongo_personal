import Button from '../../../components/ui/Button'

const recognitionAnswers = [
  { value: true, label: 'Benar' },
  { value: false, label: 'Salah' },
]

export default function RecognitionQuestion({ question, disabled = false, onAnswer }) {
  const headingId = `question-${question.id}`

  return (
    <section aria-labelledby={headingId}>
      <p className="text-sm font-semibold text-ink-muted">{question.instruction}</p>
      <h2
        id={headingId}
        className="mt-4 flex flex-wrap items-center gap-3 text-2xl font-semibold text-ink sm:text-3xl"
      >
        <span lang="ja" className="font-japanese">
          {question.content.primary}
        </span>
        <span aria-hidden="true" className="text-ink-muted">
          —
        </span>
        <span>{question.content.secondary}</span>
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-3" role="group" aria-label="Pilih benar atau salah">
        {recognitionAnswers.map((option) => (
          <Button
            key={String(option.value)}
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={() => onAnswer(option.value)}
            className="px-5 py-3.5 text-base sm:min-h-14"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </section>
  )
}
