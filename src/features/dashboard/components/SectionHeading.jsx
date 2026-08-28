export default function SectionHeading({ eyebrow, title, trailing }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[0.65rem] font-bold tracking-[0.18em] text-ink-muted uppercase">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">{title}</h2>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  )
}
