import { CheckCircle, XCircle } from 'lucide-react'
import QuizAnswer from './QuizAnswer'

export default function AnswerFeedback({ question, response }) {
  if (!response) return null

  const Icon = response.result ? CheckCircle : XCircle

  return (
    <div
      role="status"
      className={`mt-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold text-ink ${
        response.result
          ? 'border-matcha/30 bg-matcha-soft'
          : 'border-accent/25 bg-accent-soft'
      }`}
    >
      <Icon
        aria-hidden="true"
        className={`mt-0.5 shrink-0 ${response.result ? 'text-matcha' : 'text-accent'}`}
        size={18}
        strokeWidth={2}
      />
      <span>
        {response.result ? (
          'Benar'
        ) : (
          <>Belum tepat. Jawaban benar: <QuizAnswer question={question} value={response.correctAnswer} /></>
        )}
      </span>
    </div>
  )
}
