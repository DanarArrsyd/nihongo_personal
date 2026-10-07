import { ArrowUpRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import Badge from '../../../components/ui/Badge'
import { getFavoriteKey } from '../services/libraryCatalog'

const categoryLabels = {
  grammar: 'Grammar',
  kanji: 'Kanji',
  vocabulary: 'Vocabulary',
}

function LibraryResult({ favoriteKeys, item, onToggleFavorite }) {
  const favorite = favoriteKeys.has(getFavoriteKey(item.category, item.id))

  return (
    <article className="group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-border px-4 py-5 last:border-b-0 sm:gap-5 sm:px-6">
      <Link to={item.href} className="min-w-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant={item.category === 'vocabulary' ? 'accent' : item.category === 'kanji' ? 'success' : 'neutral'}>
            {categoryLabels[item.category]}
          </Badge>
          <span className="text-xs font-semibold text-ink-muted">{item.meta}</span>
        </div>
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
          <h2 className={`font-japanese font-semibold tracking-[-0.02em] text-ink ${item.category === 'kanji' ? 'text-4xl' : 'text-2xl'}`}>
            {item.japanese}
          </h2>
          {item.reading ? <p className="font-japanese text-sm text-ink-muted">{item.reading}</p> : null}
        </div>
        <p className="mt-3 text-sm font-medium text-ink">{item.meaning}</p>
        {item.detail ? <p className="mt-1 break-words text-sm leading-6 text-ink-muted">{item.detail}</p> : null}
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold tracking-[0.08em] text-accent uppercase opacity-80 transition-opacity group-hover:opacity-100">
          Buka detail <ArrowUpRight size={14} aria-hidden="true" />
        </span>
      </Link>

      <button
        type="button"
        aria-label={`${favorite ? 'Hapus' : 'Tambahkan'} ${item.japanese} ${favorite ? 'dari' : 'ke'} favorit`}
        aria-pressed={favorite}
        onClick={() => onToggleFavorite(item.category, item.id)}
        className={`grid size-11 place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          favorite
            ? 'border-[#D9B47E] bg-[#F8EEDC] text-[#8A602E]'
            : 'border-border bg-surface text-ink-muted hover:border-[#D9B47E] hover:text-[#8A602E]'
        }`}
      >
        <Star size={18} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>
    </article>
  )
}

export default function LibraryResults({ favoriteKeys, items, onToggleFavorite }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_12px_40px_rgba(64,54,41,0.05)]">
      {items.map((item) => (
        <LibraryResult
          key={`${item.category}:${item.id}`}
          favoriteKeys={favoriteKeys}
          item={item}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}
