export default function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent font-japanese text-lg font-bold text-white shadow-[0_8px_20px_rgba(201,74,69,0.18)]"
      >
        日
      </span>
      <div className={compact ? 'sr-only' : ''}>
        <p className="text-[0.68rem] font-bold tracking-[0.16em] text-ink-muted uppercase">Personal workspace</p>
        <p className="mt-0.5 text-[0.98rem] font-bold tracking-[-0.02em] text-ink">Nihongo Personal</p>
      </div>
    </div>
  )
}
