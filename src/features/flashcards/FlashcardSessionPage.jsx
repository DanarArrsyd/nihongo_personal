import { ArrowLeft } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { createStudySession } from '../../services/studySession.js'
import useFlashcardPersistence from '../persistence/useFlashcardPersistence.js'
import FlashcardSession from './FlashcardSession.jsx'
import { createFlashcardDeck, FLASHCARD_MODULES } from './adapters/flashcardDeckAdapter.js'
import FlashcardUnavailable from './components/FlashcardUnavailable.jsx'

const moduleNames = {
  vocabulary: 'Vocabulary',
  kanji: 'Kanji',
  grammar: 'Grammar',
}

function createSession(module, sessionVersion = 0) {
  const result = createFlashcardDeck({ module })

  return {
    cards: result.cards,
    error: result.error,
    sessionVersion,
    studySession: createStudySession({ kind: 'flashcard', module }),
  }
}

function RecoveryLink({ children, primary = false, to }) {
  return (
    <Link
      to={to}
      className={primary
        ? 'inline-flex min-h-11 items-center rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
        : 'inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'}
    >
      {children}
    </Link>
  )
}

function SessionHost({ module }) {
  const [session, setSession] = useState(() => createSession(module))
  const { onComplete, onResponse } = useFlashcardPersistence(session.studySession)

  const restart = useCallback(() => {
    const next = createSession(module)
    setSession((current) => ({
      ...next,
      sessionVersion: current.sessionVersion + 1,
    }))
    return next.cards
  }, [module])

  if (session.error) {
    return (
      <FlashcardUnavailable
        primaryAction={<RecoveryLink primary to="/practice/flashcards">Pilih deck Flashcards</RecoveryLink>}
        secondaryAction={<RecoveryLink to="/practice">Kembali ke Practice</RecoveryLink>}
      />
    )
  }

  return (
    <FlashcardSession
      key={session.sessionVersion}
      autoFocus={session.sessionVersion > 0}
      cards={session.cards}
      onComplete={onComplete}
      onResponse={onResponse}
      onRestart={restart}
    />
  )
}

export default function FlashcardSessionPage() {
  const { module } = useParams()

  if (!FLASHCARD_MODULES.includes(module)) {
    return (
      <div className="page-frame max-w-6xl">
        <FlashcardUnavailable
          title="Deck tidak ditemukan"
          description="Pilih Vocabulary, Kanji, atau Grammar untuk memulai sesi Flashcards."
          primaryAction={<RecoveryLink primary to="/practice/flashcards">Pilih deck Flashcards</RecoveryLink>}
          secondaryAction={<RecoveryLink to="/practice">Kembali ke Practice</RecoveryLink>}
        />
      </div>
    )
  }

  const moduleName = moduleNames[module]

  return (
    <div className="page-frame max-w-6xl">
      <Link
        to="/practice/flashcards"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Pilih deck
      </Link>

      <header className="mt-6 border-b border-border pb-7">
        <p lang="ja" className="font-japanese text-sm font-semibold text-accent">暗記カード</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          {moduleName} Flashcards
        </h1>
      </header>

      <div className="mt-8">
        <SessionHost key={module} module={module} />
      </div>
    </div>
  )
}
