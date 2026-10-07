import { BookOpenText, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'

import EmptyState from '../../components/feedback/EmptyState'
import LoadingState from '../../components/feedback/LoadingState'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LibraryFilters from './components/LibraryFilters'
import LibraryResults from './components/LibraryResults'
import {
  countLibraryCategories,
  createLibraryCatalog,
  filterLibraryCatalog,
} from './services/libraryCatalog'
import useLibraryFavorites from './useLibraryFavorites'

const initialFilters = { category: 'all', favoritesOnly: false, query: '' }
const catalog = createLibraryCatalog()
const categoryCounts = countLibraryCategories(catalog)

function LoadError({ onRetry }) {
  return (
    <div className="page-frame">
      <Card>
        <EmptyState
          title="Favorit belum bisa dimuat"
          description="Library tetap aman, tetapi koneksi ke penyimpanan lokal sedang bermasalah. Coba muat ulang data favorit."
          action={<Button onClick={onRetry}>Coba lagi</Button>}
        />
      </Card>
    </div>
  )
}

export default function LibraryPage({ useFavorites = useLibraryFavorites }) {
  const [filters, setFilters] = useState(initialFilters)
  const { favoriteKeys, retry, status, toggleFavorite } = useFavorites()
  const results = useMemo(
    () => filterLibraryCatalog(catalog, filters, favoriteKeys),
    [favoriteKeys, filters],
  )

  function changeFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  if (status === 'loading') return <div className="page-frame"><LoadingState label="Memuat library" /></div>
  if (status === 'error') return <LoadError onRetry={retry} />

  return (
    <div className="page-frame">
      <header className="border-b border-border pb-7 sm:pb-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="study-seal" aria-hidden="true">資料</span>
              <span className="text-xs font-bold tracking-[0.16em] text-ink-muted uppercase">Reference catalogue</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Library</h1>
            <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
              Temukan kembali kosakata, kanji, dan pola grammar dari satu indeks belajar.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border lg:min-w-[22rem]">
            {[
              ['言葉', 'Vocabulary', categoryCounts.vocabulary],
              ['漢字', 'Kanji', categoryCounts.kanji],
              ['文法', 'Grammar', categoryCounts.grammar],
            ].map(([japanese, label, count]) => (
              <div key={label} className="bg-surface px-3 py-3 text-center sm:px-4">
                <p className="font-japanese text-base font-semibold text-ink">{japanese}</p>
                <p className="mt-1 text-[0.65rem] font-bold tracking-[0.08em] text-ink-muted uppercase">{count} {label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside>
          <Card quiet className="xl:sticky xl:top-6">
            <LibraryFilters filters={filters} onChange={changeFilter} />
            <Button variant="ghost" className="mt-4 w-full" onClick={() => setFilters(initialFilters)}>
              <RotateCcw size={16} aria-hidden="true" /> Reset pencarian
            </Button>
          </Card>
        </aside>

        <section aria-label="Hasil library" className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm font-semibold text-ink-muted">
              {results.length} dari {catalog.length} referensi
            </p>
            <BookOpenText size={19} className="text-accent" aria-hidden="true" />
          </div>

          {results.length > 0 ? (
            <LibraryResults
              favoriteKeys={favoriteKeys}
              items={results}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <Card>
              <EmptyState
                title={filters.favoritesOnly ? 'Belum ada favorit yang cocok' : 'Referensi tidak ditemukan'}
                description="Coba kata Jepang, kana, romaji, arti lain, atau bersihkan filter yang aktif."
                action={<Button onClick={() => setFilters(initialFilters)}>Reset pencarian</Button>}
              />
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
