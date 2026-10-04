import { BookOpenCheck, CalendarClock, CheckCircle2, Play } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import EmptyState from '../../components/feedback/EmptyState.jsx'
import LoadingState from '../../components/feedback/LoadingState.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import { listDueReviews } from '../../db/reviewRepository.js'
import { createStudySession } from '../../services/studySession.js'
import FlashcardSession from '../flashcards/FlashcardSession.jsx'
import { usePersistenceStatus } from '../persistence/PersistenceContext.js'
import useFlashcardPersistence from '../persistence/useFlashcardPersistence.js'
import { createReviewDeck, summarizeReviews } from './services/reviewQueue.js'

const moduleLabels = {
  vocabulary: 'Vocabulary',
  kanji: 'Kanji',
  grammar: 'Grammar',
  kana: 'Kana',
}

const getCurrentDate = () => new Date()

function ReviewSession({ cards, onRefresh }) {
  const [session] = useState(() => createStudySession({ kind: 'flashcard', module: 'review' }))
  const { onComplete, onResponse } = useFlashcardPersistence(session)

  return (
    <FlashcardSession
      allowKana
      autoFocus
      cards={cards}
      onComplete={onComplete}
      onResponse={onResponse}
      resultAction={(
        <Button type="button" className="mt-7" onClick={onRefresh}>
          Muat antrean terbaru
        </Button>
      )}
    />
  )
}

function QueueSummary({ summary }) {
  return (
    <section aria-label="Ringkasan review" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Object.entries(moduleLabels).map(([module, label]) => (
        <Card key={module} quiet className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">{summary[module]}</p>
          <p className="mt-1 text-xs text-ink-muted">jatuh tempo</p>
        </Card>
      ))}
    </section>
  )
}

export default function ReviewPage({ loadReviews = listDueReviews, now = getCurrentDate }) {
  const [loadVersion, setLoadVersion] = useState(0)
  const [state, setState] = useState({ status: 'loading', reviews: [] })
  const [started, setStarted] = useState(false)
  const { reportFailure } = usePersistenceStatus()

  useEffect(() => {
    let active = true

    Promise.resolve(loadReviews(now()))
      .then((reviews) => {
        if (active) setState({ status: 'ready', reviews })
      })
      .catch((error) => {
        reportFailure(error)
        if (active) setState({ status: 'error', reviews: [] })
      })

    return () => {
      active = false
    }
  }, [loadReviews, loadVersion, now, reportFailure])

  const cards = useMemo(() => createReviewDeck(state.reviews), [state.reviews])
  const summary = useMemo(() => summarizeReviews(cards.map(({ source }) => ({
    itemType: source.module,
  }))), [cards])
  const retry = useCallback(() => {
    setState({ status: 'loading', reviews: [] })
    setLoadVersion((version) => version + 1)
  }, [])
  const refreshQueue = useCallback(() => {
    setStarted(false)
    retry()
  }, [retry])

  return (
    <div className="page-frame max-w-6xl">
      <header className="border-b border-border pb-7">
        <div className="flex items-center gap-3 text-accent">
          <CalendarClock aria-hidden="true" size={18} />
          <p lang="ja" className="font-japanese text-sm font-semibold">今日の復習</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Review</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted sm:text-base">
          Ulangi materi yang jatuh tempo. Penilaian Anda menentukan jadwal berikutnya.
        </p>
      </header>

      <div className="mt-8">
        {state.status === 'loading' ? <LoadingState label="Memuat antrean review" /> : null}

        {state.status === 'error' ? (
          <Card>
            <EmptyState
              title="Antrean review belum dapat dimuat"
              description="Penyimpanan lokal gagal dibaca. Coba muat ulang antrean tanpa menutup aplikasi."
              action={<Button onClick={retry}>Coba lagi</Button>}
            />
          </Card>
        ) : null}

        {state.status === 'ready' && cards.length === 0 ? (
          <Card className="relative overflow-hidden">
            <CheckCircle2 aria-hidden="true" className="absolute right-6 top-6 text-matcha opacity-30" size={64} />
            <EmptyState
              title="Review hari ini selesai"
              description="Belum ada materi yang jatuh tempo. Kerjakan latihan atau flashcard untuk membuat jadwal review berikutnya."
              action={(
                <Link
                  to="/practice"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B9403C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <BookOpenCheck aria-hidden="true" size={17} />
                  Buka Practice
                </Link>
              )}
            />
          </Card>
        ) : null}

        {state.status === 'ready' && cards.length > 0 && !started ? (
          <div className="space-y-6">
            <QueueSummary summary={summary} />
            <Card className="overflow-hidden p-0 sm:p-0">
              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">Siap dipelajari</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">
                    {cards.length} kartu menunggu
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-ink-muted">
                    Buka jawaban, lalu pilih Again, Hard, Good, atau Easy. Antrean diurutkan dari jadwal paling lama.
                  </p>
                </div>
                <Button className="w-full lg:w-auto" onClick={() => setStarted(true)}>
                  <Play aria-hidden="true" size={17} />
                  Mulai review
                </Button>
              </div>
            </Card>
          </div>
        ) : null}

        {state.status === 'ready' && started ? (
          <ReviewSession cards={cards} onRefresh={refreshQueue} />
        ) : null}
      </div>
    </div>
  )
}
