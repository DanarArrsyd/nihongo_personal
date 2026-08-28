import { ArrowLeft, BookOpenText } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import GrammarFilters from './components/GrammarFilters'
import GrammarList from './components/GrammarList'
import { filterGrammarByLevel, getGrammar, getGrammarLevels } from './services/grammarData'

export default function GrammarPage() {
  const [selectedLevel, setSelectedLevel] = useState('all')
  const grammar = getGrammar()
  const levels = getGrammarLevels()
  const filteredGrammar = filterGrammarByLevel(grammar, selectedLevel)

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
          <div className="mb-4 flex items-center gap-3">
            <span className="study-seal" aria-hidden="true">文法</span>
            <Badge variant="accent">Curated JLPT N5 seed</Badge>
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">Grammar</h1>
          <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
            Pelajari pola kalimat dasar melalui struktur yang jelas, makna bahasa Indonesia, dan contoh yang mudah diikuti.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
          <BookOpenText size={18} className="text-accent" aria-hidden="true" />
          <span>{filteredGrammar.length} patterns</span>
        </div>
      </header>

      <div className="mt-7 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside>
          <Card quiet className="lg:sticky lg:top-6">
            <p className="mb-5 text-xs font-bold tracking-[0.16em] text-ink-muted uppercase">Pilih kurikulum</p>
            <GrammarFilters
              levels={levels}
              selectedLevel={selectedLevel}
              onLevelChange={setSelectedLevel}
            />
          </Card>
        </aside>

        <section aria-label="Grammar curriculum">
          <GrammarList items={filteredGrammar} />
        </section>
      </div>
    </div>
  )
}
