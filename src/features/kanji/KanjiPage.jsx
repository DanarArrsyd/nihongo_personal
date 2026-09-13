import { ArrowLeft, Grid3X3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import KanjiGrid from './components/KanjiGrid'
import { getKanji } from './services/kanjiData'

export default function KanjiPage() {
  const kanji = getKanji()

  return (
    <div className="page-frame">
      <Link
        to="/learn"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Learning paths
      </Link>

      <header className="mt-6 flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="study-seal" aria-hidden="true">漢字</span>
            <Badge variant="accent">Curated JLPT N5 seed</Badge>
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">Kanji</h1>
          <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
            Read each character as a specimen, then connect its meaning and readings to words you already know.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
          <Grid3X3 size={18} className="text-accent" aria-hidden="true" />
          <span>{kanji.length} characters</span>
        </div>
      </header>

      <section className="mt-7" aria-label="Kanji seed set">
        <KanjiGrid items={kanji} />
      </section>
    </div>
  )
}
