import { ArrowLeft, Heart, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import { speakJapanese } from '../kana/services/speech'
import VocabularyStatusControl from './components/VocabularyStatusControl'
import { useVocabularySession } from './VocabularySessionContext'
import { getVocabularyById } from './services/vocabularyData'

export default function VocabularyDetailPage() {
  const { vocabularyId } = useParams()
  const item = getVocabularyById(vocabularyId)
  const { getStatus, isFavorite, setStatus, toggleFavorite } = useVocabularySession()
  const [speechMessage, setSpeechMessage] = useState('')

  if (!item) {
    return (
      <div className="page-frame">
        <p className="text-sm font-semibold tracking-[0.14em] text-accent uppercase">404 / Vocabulary</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Vocabulary not found</h1>
        <p className="mt-4 text-ink-muted">This word is not part of the current N5 collection.</p>
        <Link to="/learn/vocabulary" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white">
          <ArrowLeft size={17} aria-hidden="true" /> Back to Vocabulary
        </Link>
      </div>
    )
  }

  const favorite = isFavorite(item.id)
  const example = item.examples[0]

  function pronounce() {
    const result = speakJapanese(item.word)
    setSpeechMessage(result.ok ? '' : result.message)
  }

  return (
    <div className="page-frame max-w-6xl">
      <Link to="/learn/vocabulary" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent">
        <ArrowLeft size={16} aria-hidden="true" /> Back to Vocabulary
      </Link>

      <div className="mt-7 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <main className="min-w-0">
          <Card className="overflow-hidden p-0 sm:p-0">
            <div className="genko-grid relative min-h-72 border-b border-border p-6 sm:p-10">
              <div className="absolute right-6 top-6"><Badge variant="accent">{item.jlpt}</Badge></div>
              <div className="flex min-h-56 flex-col justify-center">
                <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">{item.type}</p>
                <h1 lang="ja" className="font-japanese mt-4 break-words text-5xl font-semibold tracking-[-0.04em] text-ink [overflow-wrap:anywhere] sm:text-8xl">{item.word}</h1>
                <p lang="ja" className="font-japanese mt-4 break-words text-xl text-ink-muted [overflow-wrap:anywhere]">{item.reading}</p>
                <p className="mt-1 break-words text-sm font-semibold tracking-[0.12em] text-ink-muted uppercase [overflow-wrap:anywhere]">{item.romaji}</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-xs font-bold tracking-[0.16em] text-ink-muted uppercase">Meaning</p>
              <p className="mt-2 break-words text-3xl font-semibold tracking-[-0.025em] text-ink [overflow-wrap:anywhere]">{item.meaning}</p>

              <section className="mt-9 border-t border-border pt-7" aria-labelledby="example-title">
                <p id="example-title" className="text-xs font-bold tracking-[0.16em] text-ink-muted uppercase">In context</p>
                <div className="mt-4 rounded-2xl border border-border bg-paper p-5 sm:p-6">
                  <p lang="ja" className="font-japanese break-words text-2xl font-medium leading-relaxed text-ink [overflow-wrap:anywhere]">{example.japanese}</p>
                  <p lang="ja" className="font-japanese mt-3 break-words text-sm leading-7 text-ink-muted [overflow-wrap:anywhere]">{example.reading}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-ink">{example.meaning}</p>
                </div>
              </section>
            </div>
          </Card>
        </main>

        <aside className="space-y-4">
          <Card className="xl:sticky xl:top-6">
            <p className="text-xs font-bold tracking-[0.16em] text-ink-muted uppercase">Session controls</p>
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={pronounce}
                aria-label={`Pronounce ${item.word}`}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold transition hover:border-gold hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Volume2 size={18} aria-hidden="true" /> Pronounce
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(item.id)}
                aria-label={`${favorite ? 'Remove' : 'Add'} ${item.word} ${favorite ? 'from' : 'to'} favorites`}
                aria-pressed={favorite}
                className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  favorite ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-surface text-ink hover:border-accent'
                }`}
              >
                <Heart size={18} className={favorite ? 'fill-current' : ''} aria-hidden="true" />
                {favorite ? 'Favorited' : 'Add favorite'}
              </button>
            </div>
            <div className="mt-6 border-t border-border pt-5">
              <VocabularyStatusControl value={getStatus(item.id)} onChange={(status) => setStatus(item.id, status)} />
            </div>
            {speechMessage && <p role="status" className="mt-4 text-sm leading-6 text-ink-muted">{speechMessage}</p>}
            <p className="mt-5 text-xs leading-5 text-ink-muted">Favorite dan status tersimpan otomatis di perangkat ini.</p>
          </Card>
        </aside>
      </div>
    </div>
  )
}
