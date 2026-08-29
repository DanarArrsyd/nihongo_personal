import { Check, X } from 'lucide-react'

function getTrailLabel({ current, number, response }) {
  if (current) return `Soal ${number}, saat ini`
  const state = response ? (response.result ? 'benar' : 'salah') : 'belum dijawab'
  return `Soal ${number}, ${state}`
}

function getTrailStateClass({ current, response }) {
  if (current) return 'is-current'
  if (!response) return 'is-pending'
  return response.result ? 'is-correct' : 'is-incorrect'
}

export default function AnswerTrail({ currentIndex, onNavigate, questions, responses }) {
  return (
    <nav aria-label="Navigasi soal" className="min-w-0">
      <ol className="quiz-answer-trail">
        {questions.map((question, index) => {
          const current = index === currentIndex
          const response = responses[question.id]
          const disabled = !current && !response
          const label = getTrailLabel({ current, number: index + 1, response })
          const stateClass = getTrailStateClass({ current, response })

          return (
            <li key={question.id} className="shrink-0 lg:w-full">
              <button
                type="button"
                aria-current={current ? 'step' : undefined}
                aria-label={label}
                disabled={disabled}
                onClick={() => onNavigate(index)}
                className={`quiz-answer-tab ${stateClass}`}
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
