import { NavLink } from 'react-router-dom'

export default function ScriptSwitcher({ groupId }) {
  return (
    <nav aria-label="Kana script" className="inline-flex rounded-xl border border-border bg-paper-deep p-1">
      {['hiragana', 'katakana'].map((script) => (
        <NavLink
          key={script}
          to={`/learn/kana/${script}/${groupId}`}
          className={({ isActive }) =>
            `rounded-lg px-4 py-2 text-sm font-semibold capitalize transition focus-visible:outline-2 focus-visible:outline-accent ${
              isActive ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
            }`
          }
        >
          {script}
        </NavLink>
      ))}
    </nav>
  )
}
