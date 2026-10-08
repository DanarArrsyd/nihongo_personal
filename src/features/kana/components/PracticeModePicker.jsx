import { NavLink } from 'react-router-dom'

const modes = [
  { id: 'recognition', label: 'Recognition' },
  { id: 'reverse', label: 'Reverse' },
  { id: 'typing', label: 'Typing' },
  { id: 'writing', label: 'Writing', to: (script) => `/practice/writing/kana/${script}` },
]

export default function PracticeModePicker({ script }) {
  return (
    <nav aria-label="Practice mode" className="flex flex-wrap gap-2">
      {modes.map((mode) => (
        <NavLink
          key={mode.id}
          to={mode.to ? mode.to(script) : `/practice/kana/${script}/${mode.id}`}
          className={({ isActive }) =>
            `inline-flex min-h-11 items-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isActive ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-surface text-ink-muted hover:text-ink'
            }`
          }
        >
          {mode.label}
        </NavLink>
      ))}
    </nav>
  )
}
