export default function GrammarFormula({ structure }) {
  const segments = structure.split(' + ')

  return (
    <div className="overflow-x-auto">
      <div
        aria-label={structure}
        className="grammar-construction-rail flex w-max min-w-full items-center gap-3 whitespace-nowrap"
      >
        {segments.map((segment, index) => (
          <span key={`${segment}-${index}`} className="contents">
            {index > 0 && <span aria-hidden="true" className="text-lg font-semibold text-ink-muted">+</span>}
            <span className="rounded-xl border border-border bg-paper px-4 py-3 text-sm font-semibold text-ink">
              {segment}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
