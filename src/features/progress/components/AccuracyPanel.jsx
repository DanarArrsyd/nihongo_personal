function AccuracyMetric({ description, label, metric }) {
  return (
    <article className="flex min-w-0 flex-col justify-between gap-8 p-5 sm:p-7">
      <div>
        <h3 className="text-base font-semibold text-ink">{label}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">{description}</p>
      </div>
      <div className="flex items-end justify-between gap-4 border-t border-border pt-5">
        <p className="text-4xl font-semibold tracking-[-0.06em] tabular-nums text-ink">{metric.percentage}%</p>
        <p className="pb-1 text-right text-xs text-ink-muted">
          <strong className="block font-semibold tabular-nums text-ink">{metric.correct} / {metric.total}</strong>
          jawaban berhasil
        </p>
      </div>
    </article>
  )
}

export default function AccuracyPanel({ quizAccuracy, reviewAccuracy }) {
  return (
    <section aria-labelledby="accuracy-heading" className="rounded-2xl border border-border bg-surface">
      <header className="border-b border-border px-5 py-5 sm:px-7">
        <p className="font-japanese text-sm font-semibold text-accent">精度</p>
        <h2 id="accuracy-heading" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-ink">
          Akurasi latihan
        </h2>
      </header>
      <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
        <AccuracyMetric
          label="Quiz accuracy"
          description="Semua jawaban quiz yang tersimpan di perangkat ini."
          metric={quizAccuracy}
        />
        <AccuracyMetric
          label="Review accuracy"
          description="Rating Good dan Easy dari status review terakhir tiap materi."
          metric={reviewAccuracy}
        />
      </div>
    </section>
  )
}
