import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import Card from '../../components/ui/Card.jsx'

const decks = [
  {
    module: 'vocabulary',
    name: 'Vocabulary',
    japanese: '単語',
    description: 'Ingat kembali kata, bacaan, dan artinya.',
  },
  {
    module: 'kanji',
    name: 'Kanji',
    japanese: '漢字',
    description: 'Uji arti, cara baca, dan detail Kanji.',
  },
  {
    module: 'grammar',
    name: 'Grammar',
    japanese: '文法',
    description: 'Latih pola, makna, dan struktur kalimat.',
  },
]

export default function FlashcardsPage() {
  return (
    <div className="page-frame max-w-6xl">
      <Link
        to="/practice"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Practice overview
      </Link>

      <header className="mt-6 max-w-3xl border-b border-border pb-7">
        <p lang="ja" className="font-japanese text-sm font-semibold text-accent">暗記カード</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Flashcards</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
          Pilih satu materi, ingat jawabannya, lalu nilai seberapa kuat ingatan Anda.
        </p>
      </header>

      <section aria-label="Deck Flashcards" className="flashcard-selector mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {decks.map((deck) => (
          <Card key={deck.module} className="flex min-h-64 flex-col items-start">
            <p lang="ja" className="font-japanese text-lg font-semibold text-accent">
              {deck.japanese}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">{deck.name}</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-ink-muted">{deck.description}</p>
            <Link
              to={`/practice/flashcards/${deck.module}`}
              className="mt-auto inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto sm:justify-start"
            >
              Mulai {deck.name} <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </Card>
        ))}
      </section>
    </div>
  )
}
