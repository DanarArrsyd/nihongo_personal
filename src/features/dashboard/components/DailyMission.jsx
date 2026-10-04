import { BookOpenCheck, Brain, Check, Dumbbell, Play } from 'lucide-react'

import LoadingState from '../../../components/feedback/LoadingState.jsx'
import Button from '../../../components/ui/Button.jsx'
import Card from '../../../components/ui/Card.jsx'
import ProgressBar from '../../../components/ui/ProgressBar.jsx'
import { getMissionGroups, getMissionProgress } from '../../missions/services/dailyMission.js'
import SectionHeading from './SectionHeading.jsx'

const missionIcons = {
  review: Brain,
  learn: BookOpenCheck,
  practice: Dumbbell,
}
function formatTarget(task) {
  return `${task.target} ${task.unit}`
}

export default function DailyMission({ mission, onOpen, onRetry, status }) {
  if (status === 'loading') {
    return (
      <Card aria-label="Daily mission" className="h-full">
        <LoadingState label="Memuat Daily Mission" />
      </Card>
    )
  }

  if (status === 'error' || !mission) {
    return (
      <Card aria-label="Daily mission" className="h-full">
        <SectionHeading eyebrow="Rencana hari ini" title="Daily Mission" />
        <p className="mt-6 text-sm leading-6 text-ink-muted">
          Misi belum dapat dimuat dari penyimpanan lokal.
        </p>
        <Button className="mt-5" variant="secondary" onClick={onRetry}>Coba lagi</Button>
      </Card>
    )
  }

  const groups = getMissionGroups(mission)
  const progress = getMissionProgress(mission)
  const actionLabel = mission.status === 'completed'
    ? 'Lihat misi selesai'
    : mission.status === 'in_progress'
      ? 'Lanjutkan misi'
      : 'Mulai misi'

  return (
    <Card aria-label="Daily mission" className="h-full overflow-hidden p-0 sm:p-0">
      <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_9rem]">
        <div className="p-5 sm:p-6">
          <SectionHeading
            eyebrow="Rencana hari ini"
            title="Daily Mission"
            trailing={<span className="font-japanese text-sm text-accent">今日</span>}
          />

          <div className="mt-6">
            <ProgressBar label={`${progress.completed} dari ${progress.total} langkah`} value={progress.percentage} />
          </div>

          <ol className="mt-7 divide-y divide-border">
            {groups.map((group, index) => {
              const Icon = missionIcons[group.id]

              return (
                <li key={group.id} className="grid min-w-0 gap-3 py-4 first:pt-0 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center">
                  <span className="text-xs font-semibold tabular-nums text-ink-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${group.completed ? 'bg-matcha-soft text-matcha' : 'bg-paper-deep text-ink-muted'}`}>
                      {group.completed
                        ? <Check aria-hidden="true" size={17} />
                        : <Icon aria-hidden="true" size={17} strokeWidth={1.8} />}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-ink">{group.label}</h3>
                      <p className="mt-1 text-xs leading-5 text-ink-muted">{group.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-12 sm:max-w-56 sm:justify-end sm:pl-0">
                    {group.items.map((task) => (
                      <span key={task.id} className="rounded-full border border-border bg-paper px-2.5 py-1 text-xs font-semibold text-ink">
                        {formatTarget(task)}
                      </span>
                    ))}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="flex flex-col justify-between border-t border-border bg-paper-deep p-5 lg:border-t-0 lg:border-l">
          <div>
            <p className="font-japanese text-3xl font-semibold text-accent">一日</p>
            <p className="mt-2 text-xs leading-5 text-ink-muted">Satu misi untuk satu hari belajar.</p>
          </div>
          <Button className="mt-6 w-full lg:px-3" onClick={onOpen}>
            <Play aria-hidden="true" size={16} />
            {actionLabel}
          </Button>
        </div>
      </div>
    </Card>
  )
}
