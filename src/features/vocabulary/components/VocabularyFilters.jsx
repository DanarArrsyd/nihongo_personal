import { Search } from 'lucide-react'

const statuses = [
  ['all', 'All statuses'],
  ['new', 'New'],
  ['learning', 'Learning'],
  ['familiar', 'Familiar'],
  ['mastered', 'Mastered'],
]

export default function VocabularyFilters({ filters, onChange, types }) {
  return (
    <div className="space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-ink">Search vocabulary</span>
        <span className="relative mt-2 block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" size={18} aria-hidden="true" />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => onChange('query', event.target.value)}
            placeholder="Japanese, romaji, meaning"
            className="min-h-12 w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-ink-muted/70 focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">Word type</span>
        <select
          value={filters.type}
          onChange={(event) => onChange('type', event.target.value)}
          className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
        >
          <option value="all">All word types</option>
          {types.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink">Learning status</span>
        <select
          value={filters.status}
          onChange={(event) => onChange('status', event.target.value)}
          className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
        >
          {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    </div>
  )
}
