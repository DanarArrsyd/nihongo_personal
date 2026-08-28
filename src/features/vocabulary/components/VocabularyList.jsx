import { ArrowUpRight, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../../../components/ui/Badge'

const statusVariants = {
  new: 'neutral',
  learning: 'accent',
  familiar: 'success',
  mastered: 'success',
}

export default function VocabularyList({ getStatus, isFavorite, items }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_12px_40px_rgba(64,54,41,0.05)]">
      {items.map((item) => {
        const status = getStatus(item.id)

        return (
          <li key={item.id} className="relative border-l-2 border-l-transparent transition hover:border-l-accent hover:bg-paper/70">
            <Link
              to={`/learn/vocabulary/${item.id}`}
              aria-label={`Study ${item.word}`}
              className="grid min-h-24 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent sm:px-5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p lang="ja" className="font-japanese truncate text-2xl font-semibold text-ink">{item.word}</p>
                  {isFavorite(item.id) && <Heart size={14} className="shrink-0 fill-accent text-accent" aria-label="Favorite" />}
                </div>
                <p lang="ja" className="font-japanese mt-1 text-sm text-ink-muted">{item.reading} <span aria-hidden="true">·</span> {item.romaji}</p>
                <p className="mt-1 truncate text-sm font-medium text-ink">{item.meaning}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <Badge variant={statusVariants[status]}>{status}</Badge>
                  <p className="mt-2 text-[0.68rem] font-bold tracking-[0.12em] text-ink-muted uppercase">{item.type}</p>
                </div>
                <ArrowUpRight size={18} className="text-ink-muted" aria-hidden="true" />
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
