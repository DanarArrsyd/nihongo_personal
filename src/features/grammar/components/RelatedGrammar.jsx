import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function RelatedGrammar({ items }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-paper p-5 text-sm leading-6 text-ink-muted">
        Belum ada pola terkait dalam kurikulum ini.
      </p>
    )
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to={`/learn/grammar/${item.id}`}
            aria-label={`Open grammar ${item.pattern}`}
            className="group flex min-h-24 items-center gap-4 rounded-2xl border border-border bg-paper p-4 transition hover:border-gold hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="min-w-0 flex-1">
              <span lang="ja" className="font-japanese block break-words text-xl font-semibold leading-relaxed text-ink [overflow-wrap:anywhere]">
                {item.pattern}
              </span>
              <span className="mt-2 block break-words text-sm font-semibold leading-6 text-ink-muted [overflow-wrap:anywhere]">
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
