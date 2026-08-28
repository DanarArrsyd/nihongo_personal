import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../config/navigation'

export default function NavigationLinks({ onNavigate }) {
  return (
    <nav aria-label="Primary navigation" className="flex flex-col gap-1.5">
      {navigationItems.map(({ icon: Icon, label, path }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isActive
                ? 'bg-accent-soft text-[#9E3834]'
                : 'text-ink-muted hover:bg-paper-deep hover:text-ink'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon aria-hidden="true" size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{label}</span>
              {isActive ? <span aria-hidden="true" className="ml-auto size-1.5 rounded-full bg-accent" /> : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
