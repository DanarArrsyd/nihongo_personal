const options = [
  ['new', 'New'],
  ['learning', 'Learning'],
  ['familiar', 'Familiar'],
  ['mastered', 'Mastered'],
]

export default function VocabularyStatusControl({ onChange, value }) {
  return (
    <label className="block">
      <span className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">Learning status</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>{label}</option>
        ))}
      </select>
    </label>
  )
}
