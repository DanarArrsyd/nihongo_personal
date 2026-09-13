import { Link } from 'react-router-dom'

export default function KanjiGrid({ items }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to={`/learn/kanji/${item.id}`}
            aria-label={`Study ${item.kanji} — ${item.meaning[0]}`}
            className="group block min-h-44 overflow-hidden rounded-2xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_14px_34px_rgba(38,37,34,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-h-52"
          >
            <div className="kanji-specimen-grid relative grid aspect-square place-items-center border-b border-border">
              <span className="absolute top-3 left-3 rounded-md bg-accent-soft px-2 py-1 text-[0.62rem] font-bold tracking-[0.12em] text-accent uppercase">
                {item.jlpt}
              </span>
              <span
                lang="ja"
                className="font-japanese text-6xl font-medium text-ink transition-transform duration-200 group-hover:scale-[1.04] sm:text-7xl"
              >
                {item.kanji}
              </span>
              <span className="absolute right-0 bottom-0 border-t border-l border-border bg-surface/95 px-2.5 py-1.5 text-[0.62rem] font-bold tracking-[0.08em] text-ink-muted uppercase">
                {item.strokes} strokes
              </span>
            </div>
            <div className="px-3.5 py-3 sm:px-4 sm:py-3.5">
              <p className="truncate text-sm font-semibold text-ink sm:text-base">
                {item.meaning.join(', ')}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
