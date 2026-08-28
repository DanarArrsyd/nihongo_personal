function clampProgress(value) {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) return 0
  return Math.min(100, Math.max(0, numericValue))
}

export default function ProgressBar({ label, value = 0 }) {
  const safeValue = clampProgress(value)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-semibold tabular-nums text-ink-muted">{safeValue}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={safeValue}
        className="h-2.5 overflow-hidden rounded-full bg-paper-deep"
      >
        <div
          className="h-full rounded-full bg-matcha transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  )
}
