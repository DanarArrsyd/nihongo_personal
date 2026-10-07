import { Search, Star } from 'lucide-react'

import { libraryCategories } from '../services/libraryCatalog'

export default function LibraryFilters({ filters, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="library-search" className="mb-2 block text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">
          Cari referensi
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted" size={18} aria-hidden="true" />
          <input
            id="library-search"
            type="search"
            value={filters.query}
            onChange={(event) => onChange('query', event.target.value)}
            placeholder="食べる, たべる, taberu, makan"
            className="min-h-12 w-full rounded-xl border border-border bg-surface py-3 pr-4 pl-11 text-base text-ink outline-none transition-colors placeholder:text-[#A39D93] focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </div>
        <p className="mt-2 text-xs leading-5 text-ink-muted">Japanese, kana, romaji, atau arti Indonesia.</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">Kategori</legend>
        <div className="flex flex-wrap gap-2">
          {libraryCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={filters.category === category.id}
              onClick={() => onChange('category', category.id)}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                filters.category === category.id
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-surface text-ink-muted hover:border-[#C9C0B2] hover:text-ink'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        aria-pressed={filters.favoritesOnly}
        onClick={() => onChange('favoritesOnly', !filters.favoritesOnly)}
        className={`flex min-h-11 w-full items-center justify-between rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          filters.favoritesOnly
            ? 'border-[#D9B47E] bg-[#F8EEDC] text-[#7B5528]'
            : 'border-border bg-surface text-ink-muted hover:border-[#C9C0B2] hover:text-ink'
        }`}
      >
        <span className="flex items-center gap-2"><Star size={17} fill={filters.favoritesOnly ? 'currentColor' : 'none'} aria-hidden="true" /> Favorit saja</span>
        <span>{filters.favoritesOnly ? 'Aktif' : 'Semua'}</span>
      </button>
    </div>
  )
}
