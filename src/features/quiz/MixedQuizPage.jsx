import { ArrowLeft, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import { createStudySession } from '../../services/studySession.js'
import PracticeSessionSetup from '../practice/components/PracticeSessionSetup.jsx'
import usePracticePersonalization from '../practice/usePracticePersonalization.js'
import useQuizPersistence from '../persistence/useQuizPersistence.js'
import { createMixedQuiz } from './adapters/mixedQuizAdapter.js'
import QuizSession from './QuizSession.jsx'

function createSession(config, personalization, sessionVersion = 0) {
  const result = createMixedQuiz({ ...config, ...personalization })
  if (result.error) return result

  return {
    config,
    questions: result.questions,
    error: null,
    sessionVersion,
    studySession: createStudySession({ kind: 'quiz', module: 'mixed' }),
  }
}

function ActiveSession({ session, onChangeSetup, onRestart }) {
  const { onComplete, onResponse } = useQuizPersistence(session.studySession)

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-border bg-paper-deep px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          <strong className="text-ink">{session.config.count} soal</strong>
          {' · '}{session.config.modules.length} materi
          {' · '}{session.config.questionTypes.length} tipe
        </p>
        <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onChangeSetup}>
          <SlidersHorizontal size={16} aria-hidden="true" /> Ubah pengaturan
        </Button>
      </div>
      <QuizSession
        key={session.sessionVersion}
        questions={session.questions}
        onComplete={onComplete}
        onResponse={onResponse}
        onRestart={onRestart}
      />
    </>
  )
}

export default function MixedQuizPage() {
  const personalization = usePracticePersonalization()
  const [session, setSession] = useState(null)
  const [setupError, setSetupError] = useState(null)

  function startSession(config) {
    const nextSession = createSession(config, personalization)
    if (nextSession.error) {
      setSetupError('Kombinasi ini belum punya cukup soal unik. Tambahkan materi atau tipe pertanyaan.')
      return
    }

    setSetupError(null)
    setSession(nextSession)
  }

  function restart() {
    const currentHistory = session.questions.map((question) => ({
      itemType: question.source.module,
      itemId: question.source.itemId,
    }))
    const nextSession = createSession(
      session.config,
      { ...personalization, history: [...currentHistory, ...personalization.history] },
      session.sessionVersion + 1,
    )
    if (!nextSession.error) setSession(nextSession)
  }

  function changeSetup() {
    setSession(null)
    setSetupError(null)
  }

  return (
    <div className="page-frame max-w-6xl">
      <Link
        to="/practice"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Practice overview
      </Link>

      <header className="mt-6 border-b border-border pb-7">
        <p className="text-sm font-semibold tracking-[0.12em] text-accent uppercase">Latihan campuran</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Mixed Quiz</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
          Susun sesi dari Kana, Vocabulary, Kanji, dan Grammar sesuai fokus belajarmu hari ini.
        </p>
      </header>

      <div className="mt-8">
        {session ? (
          <ActiveSession session={session} onChangeSetup={changeSetup} onRestart={restart} />
        ) : (
          <PracticeSessionSetup
            isPreparing={personalization.isLoading}
            error={setupError}
            onStart={startSession}
          />
        )}
      </div>
    </div>
  )
}
