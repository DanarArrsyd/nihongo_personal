export default function GrammarFilters({ levels, selectedLevel, onLevelChange }) {
  return (
    <div>
      <label htmlFor="grammar-level" className="text-sm font-semibold text-ink">JLPT level</label>
      <select
        id="grammar-level"
        value={selectedLevel}
        onChange={(event) => onLevelChange(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
      >
        <option value="all">Semua</option>
        {levels.map((level) => <option key={level} value={level}>{level}</option>)}
      </select>
    </div>
  )
}
