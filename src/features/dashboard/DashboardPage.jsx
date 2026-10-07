import { ArrowRight, Flame, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'
import { dashboardData } from '../../data/dashboard/dashboardData'
import DailyMission from './components/DailyMission'
import LearningStatistics from './components/LearningStatistics'
import RecentActivity from './components/RecentActivity'
import WeeklyActivity from './components/WeeklyActivity'
import useDailyMission from '../missions/useDailyMission.js'
import useProgressAnalytics from '../progress/useProgressAnalytics.js'

const activityTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function createDashboardAnalytics(analytics) {
  if (!analytics) {
    return {
      dailyMinutes: 0,
      recentActivity: [],
      statistics: [],
      streak: 0,
      weeklyActivity: [],
    }
  }

  const moduleById = Object.fromEntries(analytics.modules.map((module) => [module.id, module]))

  return {
    dailyMinutes: analytics.today.minutes,
    recentActivity: analytics.history.slice(0, 3).map((session) => ({
      detail: `${session.itemCount} item${session.accuracy === null ? '' : ` · ${session.accuracy}% accuracy`}`,
      id: session.id,
      time: activityTimeFormatter.format(new Date(session.date)),
      title: session.label,
      type: session.module === 'review' ? 'Review' : (session.kind === 'quiz' ? 'Practice' : 'Learn'),
    })),
    statistics: [
      { id: 'vocabulary', label: 'Vocabulary mastered', value: moduleById.vocabulary.mastered },
      { id: 'kanji', label: 'Kanji mastered', value: moduleById.kanji.mastered },
      { id: 'grammar', label: 'Grammar mastered', value: moduleById.grammar.mastered },
      { id: 'reviews', label: 'Reviews due today', value: analytics.dueReviewCount },
    ],
    streak: analytics.streak.current,
    weeklyActivity: analytics.weeklyActivity,
  }
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { dailyGoal, profile } = dashboardData
  const dailyMission = useDailyMission()
  const progressAnalytics = useProgressAnalytics()
  const dashboardAnalytics = createDashboardAnalytics(progressAnalytics.analytics)
  const goalPercentage = Math.min(100, Math.round((dashboardAnalytics.dailyMinutes / dailyGoal.target) * 100))

  async function openMission() {
    if (dailyMission.mission?.status === 'not_started') {
      const started = await dailyMission.start()
      if (!started) return
    }

    navigate('/mission')
  }

  return (
    <div className="page-frame dashboard-page">
      <Card className="relative overflow-hidden p-0 sm:p-0">
        <div className="absolute inset-y-0 right-0 hidden w-[34%] bg-paper-deep/70 xl:block" aria-hidden="true" />
        <div className="relative grid min-w-0 gap-8 p-5 sm:p-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center xl:p-10">
          <div className="min-w-0 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="accent">{profile.level}</Badge>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                <Sparkles aria-hidden="true" size={14} className="text-gold" />
                Today’s study
              </span>
            </div>
            <h1 aria-label="Dashboard" className="mt-6 break-words font-japanese text-[clamp(1.45rem,7vw,2.75rem)] font-semibold tracking-[-0.04em] text-ink">
              {profile.greeting}
            </h1>
            <p className="mt-3 text-base text-ink-muted">{profile.welcome}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button onClick={() => navigate('/learn')}>
                Continue learning
                <ArrowRight aria-hidden="true" size={17} />
              </Button>
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Flame aria-hidden="true" size={17} className="text-accent" />
                <span><strong className="font-semibold text-ink">{dashboardAnalytics.streak} days</strong> current streak</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex min-w-0 flex-col items-start gap-5 min-[360px]:flex-row min-[360px]:items-center sm:max-w-md xl:min-w-64 xl:justify-center">
            <div
              className="goal-enso"
              style={{ '--goal-progress': `${goalPercentage * 3.6}deg` }}
              aria-hidden="true"
            >
              <span className="text-2xl font-semibold tracking-[-0.04em] text-ink">{dashboardAnalytics.dailyMinutes}</span>
              <span className="text-[0.62rem] font-bold tracking-[0.12em] text-ink-muted uppercase">minutes</span>
            </div>
            <div className="w-full min-w-0 flex-1 min-[360px]:min-w-32 xl:max-w-36">
              <ProgressBar label="Daily goal" value={goalPercentage} />
              <p className="mt-2 text-xs text-ink-muted">{dashboardAnalytics.dailyMinutes} / {dailyGoal.target} {dailyGoal.unit}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <DailyMission
            mission={dailyMission.mission}
            status={dailyMission.status}
            onOpen={openMission}
            onRetry={dailyMission.retry}
          />
        </div>
        <div className="xl:col-span-5"><LearningStatistics statistics={dashboardAnalytics.statistics} /></div>
        <div className="xl:col-span-7"><WeeklyActivity activity={dashboardAnalytics.weeklyActivity} /></div>
        <div className="xl:col-span-5"><RecentActivity activities={dashboardAnalytics.recentActivity} /></div>
      </div>
    </div>
  )
}
