import { NavLink } from 'react-router-dom'

const modes = [
  ['recognition', 'Recognition'],
  ['reverse', 'Reverse'],
  ['typing', 'Typing'],
]

export default function PracticeModePicker({ script }) {
  return (
    <nav aria-label="Practice mode" className="flex flex-wrap gap-2">
      {modes.map(([mode, label]) => (
        <NavLink
          key={mode}
          to={`/practice/kana/${script}/${mode}`}
          className={({ isActive }) =>
            `rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isActive ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-surface text-ink-muted hover:text-ink'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
