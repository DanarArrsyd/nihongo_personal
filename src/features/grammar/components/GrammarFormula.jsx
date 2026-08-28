export default function GrammarFormula({ structure }) {
  const segments = structure.split(' + ')

  return (
    <div className="overflow-x-auto">
      <div
        role="group"
        aria-label={structure}
        className="grammar-construction-rail flex w-max min-w-full items-center gap-3 whitespace-nowrap"
      >
        {segments.map((segment, index) => (
          <span key={`${segment}-${index}`} className="contents">
            {index > 0 && <span aria-hidden="true" className="text-lg font-semibold text-ink-muted">+</span>}
            <span
              lang={/[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/u.test(segment) ? 'ja' : undefined}
              className={`rounded-xl border border-border bg-paper px-4 py-3 text-sm font-semibold text-ink${
                /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/u.test(segment) ? ' font-japanese' : ''
              }`}
            >
              {segment}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
