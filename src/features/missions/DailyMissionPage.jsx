import {
  ArrowLeft,
  ArrowUpRight,
  BookOpenCheck,
  Brain,
  Check,
  CheckCircle2,
  Dumbbell,
  Play,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import LoadingState from '../../components/feedback/LoadingState.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import { getMissionProgress } from './services/dailyMission.js'
import useDailyMission from './useDailyMission.js'

const taskIcons = {
  review: Brain,
  learn: BookOpenCheck,
  practice: Dumbbell,
}

function formatMissionDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

function statusLabel(status) {
  if (status === 'completed') return 'Selesai'
  if (status === 'in_progress') return 'Sedang berjalan'
  return 'Belum dimulai'
}

export default function DailyMissionPage({ useMission = useDailyMission }) {
  const dailyMission = useMission()
  const [busyTask, setBusyTask] = useState(null)
  const [starting, setStarting] = useState(false)

  async function startMission() {
    setStarting(true)
    await dailyMission.start()
    setStarting(false)
  }

  async function completeTask(taskId) {
    setBusyTask(taskId)
    await dailyMission.completeTask(taskId)
    setBusyTask(null)
  }

  if (dailyMission.status === 'loading') {
    return (
      <div className="page-frame max-w-6xl">
        <LoadingState label="Memuat Daily Mission" />
      </div>
    )
  }

  if (dailyMission.status === 'error' || !dailyMission.mission) {
    return (
      <div className="page-frame max-w-6xl">
        <Card>
          <h1 className="text-2xl font-semibold text-ink">Daily Mission belum tersedia</h1>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Penyimpanan lokal belum dapat menyiapkan misi hari ini.
          </p>
          <Button className="mt-6" onClick={dailyMission.retry}>Coba lagi</Button>
        </Card>
      </div>
    )
  }

  const mission = dailyMission.mission
  const progress = getMissionProgress(mission)
  const started = mission.status !== 'not_started'

  return (
    <div className="page-frame max-w-6xl">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft aria-hidden="true" size={16} /> Dashboard
      </Link>

      <header className="mt-5 grid gap-6 border-b border-border pb-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-japanese text-sm font-semibold text-accent">今日の学習</span>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-ink">
              {statusLabel(mission.status)}
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-ink sm:text-5xl">
            Daily Mission
          </h1>
          <p className="mt-3 text-sm text-ink-muted">{formatMissionDate(mission.date)}</p>
        </div>
        <ProgressBar
          label={`${progress.completed} dari ${progress.total} langkah`}
          value={progress.percentage}
        />
      </header>

      {mission.status === 'completed' ? (
        <section className="mt-8 flex items-start gap-4 rounded-2xl border border-matcha/30 bg-matcha-soft p-5 sm:p-6">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-matcha" size={24} />
          <div>
            <h2 className="text-lg font-semibold text-ink">Misi hari ini selesai</h2>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              Misi tetap tersimpan sampai hari berganti. Besok sistem menyiapkan rutinitas baru.
            </p>
          </div>
        </section>
      ) : null}

      {!started ? (
        <Card className="mt-8 grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <h2 className="text-xl font-semibold text-ink">Mulai dari langkah pertama</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
              Progres tersimpan di perangkat ini. Anda dapat berhenti dan melanjutkan lagi hari ini.
            </p>
          </div>
          <Button disabled={starting} onClick={startMission}>
            <Play aria-hidden="true" size={17} />
            {starting ? 'Memulai…' : 'Mulai misi'}
          </Button>
        </Card>
      ) : null}

      <ol className="mt-8 space-y-4">
        {mission.tasks.map((task, index) => {
          const Icon = taskIcons[task.type]

          return (
            <li key={task.id}>
              <Card className={`mission-task grid min-w-0 gap-5 p-5 sm:p-6 lg:grid-cols-[3rem_minmax(0,1fr)_auto] lg:items-center ${task.completed ? 'border-matcha/30 bg-matcha-soft/35' : ''}`}>
                <div className={`grid size-11 place-items-center rounded-full text-sm font-semibold ${task.completed ? 'bg-matcha text-white' : 'bg-paper-deep text-ink-muted'}`}>
                  {task.completed ? <Check aria-hidden="true" size={19} /> : String(index + 1).padStart(2, '0')}
                </div>

                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon aria-hidden="true" className="shrink-0 text-accent" size={17} />
                    <h2 className="truncate text-lg font-semibold text-ink">{task.title}</h2>
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">
                    Target: <strong className="font-semibold text-ink">{task.target} {task.unit}</strong>
                  </p>
                  {task.itemIds.length > 0 ? (
                    <p className="mt-1 text-xs text-ink-muted">Materi dipilih dari progres lokal Anda.</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                  {!task.completed && task.target > 0 ? (
                    <Link
                      to={task.route}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      Buka materi <ArrowUpRight aria-hidden="true" size={16} />
                    </Link>
                  ) : null}
                  {!task.completed ? (
                    <Button
                      disabled={!started || busyTask === task.id}
                      onClick={() => completeTask(task.id)}
                    >
                      {busyTask === task.id ? 'Menyimpan…' : 'Tandai selesai'}
                    </Button>
                  ) : (
                    <span className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-matcha">
                      <Check aria-hidden="true" size={17} /> Selesai
                    </span>
                  )}
                </div>
              </Card>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
