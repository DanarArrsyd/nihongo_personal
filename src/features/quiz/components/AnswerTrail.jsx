import { Check, X } from 'lucide-react'

function getTrailLabel({ current, number, response }) {
  if (current) return `Soal ${number}, saat ini`
  const state = response ? (response.result ? 'benar' : 'salah') : 'belum dijawab'
  return `Soal ${number}, ${state}`
}

export default function AnswerTrail({ currentIndex, onNavigate, questions, responses }) {
  return (
    <nav aria-label="Navigasi soal" className="min-w-0">
      <ol className="flex max-w-full gap-2 overflow-x-auto pb-2 lg:grid lg:overflow-visible lg:pb-0">
        {questions.map((question, index) => {
          const current = index === currentIndex
          const response = responses[question.id]
          const disabled = !current && !response
          const label = getTrailLabel({ current, number: index + 1, response })

          return (
            <li key={question.id} className="shrink-0 lg:w-full">
              <button
                type="button"
                aria-current={current ? 'step' : undefined}
                aria-label={label}
                disabled={disabled}
                onClick={() => onNavigate(index)}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:w-full lg:justify-start ${
                  current
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-border bg-surface text-ink hover:border-[#C9C0B2]'
                } disabled:cursor-not-allowed disabled:bg-paper-deep disabled:text-ink-muted disabled:opacity-60`}
              >
                <span aria-hidden="true" className="tabular-nums">{index + 1}</span>
                {response ? (
                  response.result
                    ? <Check aria-hidden="true" size={16} strokeWidth={2.2} />
                    : <X aria-hidden="true" size={16} strokeWidth={2.2} />
                ) : null}
                <span className="hidden lg:inline" aria-hidden="true">
                  {response ? (response.result ? 'Benar' : 'Salah') : 'Belum dijawab'}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
