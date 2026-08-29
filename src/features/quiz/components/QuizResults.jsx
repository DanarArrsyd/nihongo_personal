import { CheckCircle, RotateCcw, XCircle } from 'lucide-react'
import Button from '../../../components/ui/Button'
import { getQuizScore } from '../services/quizSession'
import QuizAnswer from './QuizAnswer'

const moduleLabels = {
  kana: 'Kana',
  vocabulary: 'Vocabulary',
  kanji: 'Kanji',
  grammar: 'Grammar',
}

function QuestionPrompt({ question }) {
  if (question.content.kind === 'pair') {
    return (
      <p className="mt-2 text-lg font-semibold text-ink">
        <span lang="ja" className="font-japanese">{question.content.primary}</span>
        <span aria-hidden="true"> — </span>
        <span>{question.content.secondary}</span>
      </p>
    )
  }

  if (question.content.kind === 'sentence') {
    return (
      <p lang={question.content.lang} className="mt-2 font-japanese text-lg font-semibold text-ink">
        {question.content.before} ＿＿ {question.content.after}
      </p>
    )
  }

  return (
    <p
      lang={question.content.lang}
      className={`mt-2 text-lg font-semibold text-ink ${
        question.content.lang === 'ja' ? 'font-japanese' : ''
      }`}
    >
      {question.content.text}
    </p>
  )
}

export default function QuizResults({ onRestart, state }) {
  const score = getQuizScore(state)
  const percentage = Math.round((score / state.questions.length) * 100)

  return (
    <section aria-labelledby="quiz-results-heading" className="mx-auto w-full max-w-3xl">
      <header className="rounded-2xl border border-border bg-surface p-6 shadow-[0_12px_40px_rgba(64,54,41,0.05)] sm:p-8">
        <p className="text-sm font-semibold tracking-[0.12em] text-accent uppercase">Selesai</p>
        <h1
          id="quiz-results-heading"
          className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl"
        >
          Hasil quiz
        </h1>
        <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-3">
          <p className="text-2xl font-semibold text-ink">{score} dari {state.questions.length}</p>
          <p className="text-lg font-semibold text-ink">{percentage}%</p>
        </div>
        <Button type="button" className="mt-7" onClick={onRestart}>
          <RotateCcw aria-hidden="true" size={17} />
          Mulai lagi
        </Button>
      </header>

      <section aria-labelledby="quiz-review-heading" className="mt-8">
        <h2 id="quiz-review-heading" className="text-xl font-semibold text-ink">Tinjauan jawaban</h2>
        <ol className="mt-4 space-y-3">
          {state.questions.map((question, index) => {
            const response = state.responses[question.id]
            const ResultIcon = response.result ? CheckCircle : XCircle

            return (
              <li key={question.id} className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.1em] uppercase">
                    <span className="text-ink-muted">Soal {index + 1}</span>
                    <span aria-hidden="true" className="text-border">·</span>
                    <span className="text-accent">{moduleLabels[question.source.module]}</span>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink"
                  >
                    <ResultIcon
                      aria-hidden="true"
                      className={response.result ? 'text-matcha' : 'text-accent'}
                      size={17}
                      strokeWidth={2}
                    />
                    {response.result ? 'Benar' : 'Belum tepat'}
                  </span>
                </div>
                <p className="mt-4 text-sm text-ink-muted">{question.instruction}</p>
                <QuestionPrompt question={question} />
                <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                  <p className="rounded-lg bg-paper-deep px-3 py-2 text-ink">
                    Jawaban Anda: <QuizAnswer question={question} value={response.userAnswer} />
                  </p>
                  <p className="rounded-lg bg-paper-deep px-3 py-2 text-ink">
                    Jawaban benar: <QuizAnswer question={question} value={response.correctAnswer} />
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </section>
    </section>
  )
}
