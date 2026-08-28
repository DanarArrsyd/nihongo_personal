import { NavLink } from 'react-router-dom'

export default function GroupNavigation({ groups, script }) {
  return (
    <nav aria-label="Kana groups" className="overflow-x-auto pb-2 lg:overflow-visible lg:pb-0">
      <div className="flex min-w-max gap-2 lg:min-w-0 lg:flex-col">
        {groups.map((group) => (
          <NavLink
            key={group.id}
            to={`/learn/kana/${script}/${group.id}`}
            aria-label={group.name}
            className={({ isActive }) =>
              `flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isActive
                  ? 'border-accent/30 bg-accent-soft text-accent'
                  : 'border-transparent text-ink-muted hover:border-border hover:bg-surface hover:text-ink'
              }`
            }
          >
            <span>{group.name}</span>
            <span lang="ja" className="font-japanese font-normal opacity-70">{group.japaneseLabel}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
