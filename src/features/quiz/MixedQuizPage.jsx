import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createMixedQuiz } from './adapters/mixedQuizAdapter.js'
import QuizUnavailable from './components/QuizUnavailable'
import QuizSession from './QuizSession'
import { validateQuiz } from './services/questionValidation.js'

function createSession(sessionVersion = 0) {
  const result = createMixedQuiz()

  return {
    questions: result.questions,
    error: result.error,
    sessionVersion,
  }
}

export default function MixedQuizPage() {
  const [session, setSession] = useState(() => createSession())
  const validation = validateQuiz(session.questions)

  function restart() {
    const result = createMixedQuiz()
    setSession((current) => ({
      questions: result.questions,
      error: result.error,
      sessionVersion: current.sessionVersion + 1,
    }))
  }

  if (session.error || !validation.valid) {
    return (
      <div className="page-frame max-w-6xl">
        <QuizUnavailable
          title="Quiz belum tersedia"
          description="Mixed Quiz belum dapat dibuat. Kembali ke Practice untuk memilih latihan lain."
        />
      </div>
    )
  }

  return (
    <div className="page-frame max-w-6xl">
      <Link
        to="/practice"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Practice overview
      </Link>

      <header className="mt-6 border-b border-border pb-7">
        <p className="text-sm font-semibold tracking-[0.12em] text-accent uppercase">Latihan campuran</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Mixed Quiz</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
          Uji Kana, Vocabulary, Kanji, dan Grammar dalam sepuluh soal terarah.
        </p>
      </header>

      <div className="mt-8">
        <QuizSession
          key={session.sessionVersion}
          questions={session.questions}
          onRestart={restart}
        />
      </div>
    </div>
  )
}
