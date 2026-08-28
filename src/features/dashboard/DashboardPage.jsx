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

export default function DashboardPage() {
  const navigate = useNavigate()
  const { dailyGoal, mission, profile, recentActivity, statistics, streak, weeklyActivity } = dashboardData
  const goalPercentage = Math.round((dailyGoal.current / dailyGoal.target) * 100)

  return (
    <div className="page-frame dashboard-page">
      <Card className="relative overflow-hidden p-0 sm:p-0">
        <div className="absolute inset-y-0 right-0 hidden w-[34%] bg-paper-deep/70 md:block" aria-hidden="true" />
        <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center lg:p-10">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="accent">{profile.level}</Badge>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                <Sparkles aria-hidden="true" size={14} className="text-gold" />
                Today’s study
              </span>
            </div>
            <h1 aria-label="Dashboard" className="mt-6 whitespace-nowrap font-japanese text-[clamp(1.45rem,7vw,2.75rem)] font-semibold tracking-[-0.04em] text-ink">
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
                <span><strong className="font-semibold text-ink">{streak.days} days</strong> current streak</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-5 md:min-w-64 md:justify-center">
            <div
              className="goal-enso"
              style={{ '--goal-progress': `${goalPercentage * 3.6}deg` }}
              aria-hidden="true"
            >
              <span className="text-2xl font-semibold tracking-[-0.04em] text-ink">{dailyGoal.current}</span>
              <span className="text-[0.62rem] font-bold tracking-[0.12em] text-ink-muted uppercase">minutes</span>
            </div>
            <div className="min-w-32 flex-1 md:max-w-36">
              <ProgressBar label="Daily goal" value={goalPercentage} />
              <p className="mt-2 text-xs text-ink-muted">{dailyGoal.current} / {dailyGoal.target} {dailyGoal.unit}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7"><DailyMission mission={mission} /></div>
        <div className="xl:col-span-5"><LearningStatistics statistics={statistics} /></div>
        <div className="xl:col-span-7"><WeeklyActivity activity={weeklyActivity} /></div>
        <div className="xl:col-span-5"><RecentActivity activities={recentActivity} /></div>
      </div>
    </div>
  )
}
