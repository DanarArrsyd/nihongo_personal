import { BookOpenCheck, Brain, Dumbbell } from 'lucide-react'
import Card from '../../../components/ui/Card'
import SectionHeading from './SectionHeading'

const missionIcons = {
  review: Brain,
  learn: BookOpenCheck,
  practice: Dumbbell,
}

export default function DailyMission({ mission }) {
  return (
    <Card aria-label="Daily mission" className="h-full">
      <SectionHeading eyebrow="Today’s path" title="Daily Mission" trailing={<span className="font-japanese text-sm text-accent">今日</span>} />
      <ol className="mt-7 divide-y divide-border">
        {mission.map((step, index) => {
          const Icon = missionIcons[step.id]

          return (
            <li key={step.id} className="grid min-w-0 gap-4 py-5 first:pt-0 last:pb-0 md:grid-cols-[2.5rem_minmax(0,1fr)_auto] md:items-center">
              <span className="text-xs font-bold tabular-nums text-ink-muted">{String(index + 1).padStart(2, '0')}</span>
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-paper-deep text-ink-muted">
                  <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink">{step.label}</h3>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">{step.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pl-[3.25rem] md:max-w-52 md:justify-end md:pl-0">
                {step.items.map((item) => (
                  <span key={item} className="rounded-full border border-border bg-paper px-2.5 py-1 text-xs font-semibold text-ink">
                    {item}
                  </span>
                ))}
              </div>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
