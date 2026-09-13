import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function RelatedVocabulary({ items }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-paper p-5 text-sm leading-6 text-ink-muted">
        No related vocabulary in this seed set yet.
      </p>
    )
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to={`/learn/vocabulary/${item.id}`}
            aria-label={`Open vocabulary ${item.word}`}
            className="group flex min-h-24 items-center gap-4 rounded-2xl border border-border bg-paper p-4 transition hover:border-gold hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span lang="ja" className="font-japanese shrink-0 text-2xl font-semibold text-ink">
              {item.word}
            </span>
            <span className="min-w-0 flex-1">
              <span lang="ja" className="font-japanese block break-words text-xs text-ink-muted [overflow-wrap:anywhere]">
                {item.reading}
              </span>
              <span className="mt-1 block truncate text-sm font-semibold text-ink">
                {item.meaning}
              </span>
            </span>
            <ArrowUpRight
              size={17}
              className="shrink-0 text-ink-muted transition group-hover:text-accent"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
