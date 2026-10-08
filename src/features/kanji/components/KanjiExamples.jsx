export default function KanjiExamples({ examples }) {
  if (examples.length === 0) return null

  return (
    <section aria-labelledby="kanji-examples-title">
      <h2 id="kanji-examples-title" className="text-xl font-semibold tracking-[-0.025em] text-ink">
        Kanji in context
      </h2>
      <ul className="mt-5 space-y-4">
        {examples.map((example) => (
          <li key={example.japanese} className="min-w-0 rounded-xl border border-border bg-paper p-4">
            <p lang="ja" className="font-japanese break-words text-lg leading-8 text-ink [overflow-wrap:anywhere]">
              {example.japanese}
            </p>
            <p lang="ja" className="font-japanese mt-2 break-words text-sm leading-6 text-ink-muted [overflow-wrap:anywhere]">
              {example.reading}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{example.meaning}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
