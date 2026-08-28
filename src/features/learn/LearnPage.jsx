import { ArrowRight, BookOpenText } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'

const scripts = [
  {
    id: 'hiragana',
    name: 'Hiragana',
    japanese: 'ひらがな',
    sample: 'あ',
    description: 'Build the foundation for native Japanese words and grammar.',
  },
  {
    id: 'katakana',
    name: 'Katakana',
    japanese: 'カタカナ',
    sample: 'ア',
    description: 'Read loanwords, names, emphasis, and modern expressions.',
  },
]

export default function LearnPage() {
  return (
    <div className="page-frame">
      <header className="max-w-3xl">
        <div className="mb-5 flex items-center gap-3">
          <span className="study-seal" aria-hidden="true">学習</span>
          <Badge variant="accent">Kana foundation</Badge>
        </div>
        <p className="text-sm font-semibold tracking-[0.16em] text-accent uppercase">Milestone 03</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">Learn</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
          Choose a Japanese script, study one sound group at a time, then reinforce it with focused practice.
        </p>
      </header>

      <section className="mt-10 grid gap-5 xl:grid-cols-2" aria-label="Kana scripts">
        {scripts.map((script) => (
          <Card key={script.id} className="group relative overflow-hidden p-0 sm:p-0">
            <div className="genko-grid absolute inset-y-0 right-0 w-2/5 opacity-65" aria-hidden="true" />
            <div className="relative grid min-h-72 grid-cols-[1fr_auto] gap-6 p-6 sm:p-8">
              <div className="flex flex-col items-start">
                <p lang="ja" className="font-japanese text-sm font-medium text-accent">{script.japanese}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{script.name}</h2>
                <p className="mt-3 max-w-sm leading-7 text-ink-muted">{script.description}</p>
                <Link
                  to={`/learn/kana/${script.id}/vowels`}
                  className="mt-auto inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Study {script.name}
                  <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </div>
              <span
                lang="ja"
                className="font-japanese self-center text-7xl font-medium text-ink/90 sm:text-8xl"
                aria-hidden="true"
              >
                {script.sample}
              </span>
            </div>
          </Card>
        ))}
      </section>

      <Card className="relative mt-5 overflow-hidden p-0 sm:p-0">
        <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-paper-deep sm:block" aria-hidden="true" />
        <div className="relative grid gap-7 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-matcha-soft text-matcha"><BookOpenText size={21} aria-hidden="true" /></span>
              <div><p lang="ja" className="font-japanese text-sm text-accent">単語</p><h2 className="text-2xl font-semibold tracking-[-0.03em]">Vocabulary</h2></div>
            </div>
            <p className="mt-4 max-w-xl leading-7 text-ink-muted">Browse a curated N5 seed set, search in Japanese or Indonesian, and study each word in context.</p>
          </div>
          <Link
            to="/learn/vocabulary"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Study Vocabulary <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </Card>
    </div>
  )
}
