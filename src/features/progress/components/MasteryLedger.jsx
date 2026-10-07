import ProgressBar from '../../../components/ui/ProgressBar.jsx'

export default function MasteryLedger({ modules }) {
  return (
    <section aria-labelledby="mastery-heading" className="rounded-2xl border border-border bg-surface">
      <header className="border-b border-border px-5 py-5 sm:px-7">
        <p className="font-japanese text-sm font-semibold text-accent">習得</p>
        <h2 id="mastery-heading" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-ink">
          Mastery per modul
        </h2>
      </header>

      <div className="divide-y divide-border">
        {modules.map((module) => (
          <article key={module.id} className="grid gap-4 px-5 py-5 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-center sm:px-7">
            <div>
              <p className="font-japanese text-xs font-semibold text-accent">{module.japanese}</p>
              <h3 className="mt-1 font-semibold text-ink">{module.label}</h3>
            </div>
            <ProgressBar label={`${module.label} mastery`} value={module.percentage} />
            <p className="text-sm tabular-nums text-ink-muted sm:min-w-28 sm:text-right">
              <strong className="font-semibold text-ink">{module.mastered}</strong> mastered
              <span className="block text-xs">{module.studied} dipelajari / {module.total}</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
