import { CheckCircle, XCircle } from 'lucide-react'

function formatQuizAnswer(value) {
  if (typeof value === 'boolean') return value ? 'Benar' : 'Salah'
  return String(value)
}

export default function AnswerFeedback({ response }) {
  if (!response) return null

  const Icon = response.result ? CheckCircle : XCircle

  return (
    <div
      role="status"
      className={`mt-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
        response.result
          ? 'border-matcha/30 bg-matcha-soft text-matcha'
          : 'border-accent/25 bg-accent-soft text-accent'
      }`}
    >
      <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={18} strokeWidth={2} />
      <span>
        {response.result
          ? 'Benar'
          : `Belum tepat. Jawaban benar: ${formatQuizAnswer(response.correctAnswer)}`}
      </span>
    </div>
  )
}
