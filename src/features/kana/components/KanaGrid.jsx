import { Check } from 'lucide-react'

export default function KanaGrid({ items, learnedIds, onSelect, selectedId }) {
  return (
    <div className="genko-grid rounded-2xl border border-border p-3 sm:p-4">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
        {items.map((item) => {
          const isLearned = learnedIds.has(item.id)
          const isSelected = selectedId === item.id

          return (
            <button
              key={item.id}
              type="button"
              aria-label={`${item.character}, ${item.romaji}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(item.id)}
              className={`relative aspect-square rounded-xl border bg-surface p-2 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isSelected ? 'border-accent shadow-[0_8px_22px_rgba(201,74,69,0.12)]' : 'hover:-translate-y-0.5 hover:border-gold'
              }`}
            >
              {isLearned && (
                <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-matcha text-white" aria-hidden="true">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
              <span lang="ja" className="font-japanese block text-3xl font-medium sm:text-4xl">{item.character}</span>
              <span className="mt-1 block text-xs font-semibold text-ink-muted">{item.romaji}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
