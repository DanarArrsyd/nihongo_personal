import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmptyState from '../../../components/feedback/EmptyState'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'

export default function GrammarList({ items }) {
  if (items.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Tidak ada pola grammar"
          description="Pilih level lain untuk melihat materi yang tersedia."
        />
      </Card>
    )
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_12px_40px_rgba(64,54,41,0.05)]">
      {items.map((item) => (
        <li key={item.id} className="relative border-l-2 border-l-transparent transition hover:border-l-accent hover:bg-paper/70">
          <Link
            to={`/learn/grammar/${item.id}`}
            aria-label={`Study ${item.pattern} — ${item.meaning}`}
            className="grid min-h-28 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent sm:px-5"
          >
            <div className="min-w-0">
              <p lang="ja" className="font-japanese text-2xl font-semibold text-ink">{item.pattern}</p>
              <p className="mt-1 text-sm font-medium text-ink">{item.meaning}</p>
              <p className="mt-2 text-sm text-ink-muted">{item.structure}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="accent">{item.jlpt}</Badge>
              <ArrowUpRight size={18} className="text-ink-muted" aria-hidden="true" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
