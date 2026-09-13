import Brand from './Brand'
import NavigationLinks from './NavigationLinks'

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col overflow-y-auto overscroll-contain border-r border-border bg-surface px-5 py-6 lg:flex">
      <Brand />
      <div className="mt-10 flex items-center gap-3 px-3.5">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[0.62rem] font-bold tracking-[0.18em] text-ink-muted uppercase">Study index</span>
      </div>
      <div className="mt-5">
        <NavigationLinks />
      </div>
      <div className="mt-auto flex items-end justify-between border-t border-border pt-5">
        <div>
          <p className="font-japanese text-sm font-medium text-ink">毎日、少しずつ。</p>
          <p className="mt-1 text-xs text-ink-muted">A little every day.</p>
        </div>
        <span className="study-seal" aria-hidden="true">学習</span>
      </div>
    </aside>
  )
}
