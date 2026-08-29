import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import QuizSession from '../quiz/QuizSession'
import { createKanaQuiz } from '../quiz/adapters/kanaQuizAdapter.js'
import QuizUnavailable from '../quiz/components/QuizUnavailable'
import { validateQuiz } from '../quiz/services/questionValidation.js'
import PracticeModePicker from './components/PracticeModePicker'
import { isSupportedScript } from './services/kanaData'

const scriptNames = { hiragana: 'Hiragana', katakana: 'Katakana' }
const supportedModes = new Set(['recognition', 'reverse', 'typing'])
const modeGuidance = {
  recognition: 'Choose the romaji that matches this kana.',
  reverse: 'Choose the kana that matches this romaji.',
  typing: 'Type the romaji reading for this kana.',
}

function createSession(script, mode, sessionVersion = 0) {
  return {
    questions: createKanaQuiz({ script, mode }),
    sessionVersion,
  }
}

function PracticeSession({ mode, script }) {
  const [session, setSession] = useState(() => createSession(script, mode))
  const validation = validateQuiz(session.questions)

  function restart() {
    const questions = createKanaQuiz({ script, mode })
    setSession((current) => ({
      questions,
      sessionVersion: current.sessionVersion + 1,
    }))
  }

  return (
    <div className="page-frame max-w-6xl">
      <Link
        to="/practice"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Practice overview
      </Link>

      <header className="mt-6 flex flex-col justify-between gap-6 border-b border-border pb-7 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold capitalize text-accent">{modeGuidance[mode]}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {scriptNames[script]} {mode}
          </h1>
        </div>
        <PracticeModePicker script={script} />
      </header>

      <div className="mt-8">
        {validation.valid ? (
          <QuizSession
            key={session.sessionVersion}
            questions={session.questions}
            onRestart={restart}
          />
        ) : (
          <QuizUnavailable />
        )}
      </div>
    </div>
  )
}

export default function KanaPracticePage() {
  const { mode, script } = useParams()

  if (!isSupportedScript(script) || !supportedModes.has(mode)) {
    return (
      <div className="page-frame">
        <p className="text-sm font-semibold tracking-[0.14em] text-accent uppercase">404 / Practice</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Practice path not found</h1>
        <p className="mt-4 text-ink-muted">This script or practice mode is not available.</p>
        <Link to="/practice" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white">
          <ArrowLeft size={17} aria-hidden="true" /> Back to Practice
        </Link>
      </div>
    )
  }

  return <PracticeSession key={`${script}:${mode}`} script={script} mode={mode} />
}
