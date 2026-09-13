import { ArrowLeft, BookOpenText, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/feedback/EmptyState'
import VocabularyFilters from './components/VocabularyFilters'
import VocabularyList from './components/VocabularyList'
import { useVocabularySession } from './VocabularySessionContext'
import { filterVocabulary, getVocabulary, getVocabularyTypes } from './services/vocabularyData'

const initialFilters = { query: '', type: 'all', status: 'all' }

export default function VocabularyPage() {
  const [filters, setFilters] = useState(initialFilters)
  const { getStatus, isFavorite } = useVocabularySession()
  const vocabulary = getVocabulary()
  const types = getVocabularyTypes(vocabulary)
  const results = filterVocabulary(vocabulary, filters, getStatus)

  function changeFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  return (
    <div className="page-frame">
      <Link to="/learn" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent">
        <ArrowLeft size={16} aria-hidden="true" /> Learning paths
      </Link>

      <header className="mt-6 flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="study-seal" aria-hidden="true">言葉</span>
            <Badge variant="accent">JLPT N5 seed set</Badge>
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Vocabulary</h1>
          <p className="mt-3 max-w-2xl leading-7 text-ink-muted">Find a word, study its reading and meaning, then mark where it sits in your learning session.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
          <BookOpenText size={18} className="text-accent" aria-hidden="true" />
          <span>{results.length} {results.length === 1 ? 'word' : 'words'}</span>
        </div>
      </header>

      <div className="mt-7 grid min-w-0 gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside>
          <Card quiet className="xl:sticky xl:top-6">
            <p className="mb-5 text-xs font-bold tracking-[0.16em] text-ink-muted uppercase">Find your word</p>
            <VocabularyFilters filters={filters} onChange={changeFilter} types={types} />
            <Button aria-label="Reset filters" variant="ghost" className="mt-4 w-full" onClick={() => setFilters(initialFilters)}>
              <RotateCcw size={16} aria-hidden="true" /> Clear filters
            </Button>
          </Card>
        </aside>

        <section aria-label="Vocabulary results">
          {results.length > 0 ? (
            <VocabularyList items={results} getStatus={getStatus} isFavorite={isFavorite} />
          ) : (
            <Card>
              <EmptyState
                title="No vocabulary found"
                description="Try a different Japanese word, reading, romaji, meaning, or clear the active filters."
                action={<Button onClick={() => setFilters(initialFilters)}>Clear filters</Button>}
              />
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
