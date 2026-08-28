import { CircleDotDashed } from 'lucide-react'

export default function EmptyState({ action, description, title }) {
  return (
    <div className="flex max-w-lg flex-col items-start">
      <span className="mb-5 grid size-11 place-items-center rounded-full bg-accent-soft text-accent">
        <CircleDotDashed aria-hidden="true" size={21} strokeWidth={1.8} />
      </span>
      <h2 className="text-xl font-semibold tracking-[-0.025em] text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
