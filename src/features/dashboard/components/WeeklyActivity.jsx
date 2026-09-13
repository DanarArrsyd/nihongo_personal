import Card from '../../../components/ui/Card'
import SectionHeading from './SectionHeading'

export default function WeeklyActivity({ activity }) {
  const maxMinutes = Math.max(...activity.map((entry) => entry.minutes), 1)
  const totalMinutes = activity.reduce((total, entry) => total + entry.minutes, 0)

  return (
    <figure aria-label="Weekly learning activity">
      <Card>
        <SectionHeading
          eyebrow="Last 7 days"
          title="Weekly activity"
          trailing={
            <p className="text-right">
              <span className="block text-lg font-semibold tabular-nums text-ink">{totalMinutes}</span>
              <span className="text-[0.65rem] font-bold tracking-[0.12em] text-ink-muted uppercase">minutes</span>
            </p>
          }
        />
        <div className="mt-8 grid h-52 grid-cols-7 items-end gap-1.5 sm:gap-4">
          {activity.map((entry) => (
            <div key={entry.day} className="flex h-full flex-col justify-end gap-3 text-center">
              <div className="group relative flex flex-1 items-end justify-center rounded-t-lg bg-paper-deep/70">
                <span className="sr-only">{entry.minutes} minutes</span>
                <div
                  className="w-full rounded-t-lg bg-matcha transition-[height,background-color] duration-300 group-hover:bg-[#62795A] motion-reduce:transition-none"
                  style={{ height: `${Math.max(12, (entry.minutes / maxMinutes) * 100)}%` }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-[0.68rem] font-semibold text-ink-muted">{entry.day}</span>
            </div>
          ))}
        </div>
        <figcaption className="sr-only">Minutes studied each day during the last seven days.</figcaption>
      </Card>
    </figure>
  )
}
