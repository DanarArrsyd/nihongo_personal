export default function WeeklyStudyChart({ activity }) {
  const maxMinutes = Math.max(...activity.map((day) => day.minutes), 1)
  const totalMinutes = activity.reduce((total, day) => total + day.minutes, 0)

  return (
    <figure aria-labelledby="weekly-heading" className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="font-japanese text-sm font-semibold text-accent">七日</p>
          <h2 id="weekly-heading" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-ink">
            Aktivitas 7 hari
          </h2>
        </div>
        <p className="text-right">
          <strong className="block text-2xl font-semibold tracking-[-0.04em] tabular-nums text-ink">{totalMinutes}</strong>
          <span className="text-xs text-ink-muted">menit</span>
        </p>
      </div>

      <div className="mt-8 grid h-52 grid-cols-7 items-end gap-2 sm:gap-4">
        {activity.map((day) => (
          <div key={day.date} className="flex h-full min-w-0 flex-col justify-end gap-3 text-center">
            <div className="relative flex flex-1 items-end overflow-hidden rounded-t-lg bg-paper-deep/70">
              <div
                className="w-full rounded-t-lg bg-matcha"
                style={{ height: day.minutes ? `${Math.max(10, (day.minutes / maxMinutes) * 100)}%` : '0%' }}
                aria-hidden="true"
              />
              <span className="sr-only">{day.minutes} menit, {day.sessions} sesi</span>
            </div>
            <span className="truncate text-[0.68rem] font-semibold text-ink-muted">{day.day}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-5 text-xs leading-5 text-ink-muted">
        Durasi berasal dari sesi belajar yang selesai dan tersimpan secara lokal.
      </figcaption>
    </figure>
  )
}
