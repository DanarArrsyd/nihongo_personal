import { BookOpenCheck, ChevronRight, Flame, RotateCcw, ShieldCheck, TimerReset } from 'lucide-react'
import { Link } from 'react-router-dom'

import LoadingState from '../../components/feedback/LoadingState.jsx'
import Button from '../../components/ui/Button.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import AccuracyPanel from './components/AccuracyPanel.jsx'
import MasteryLedger from './components/MasteryLedger.jsx'
import StudyHistory from './components/StudyHistory.jsx'
import WeeklyStudyChart from './components/WeeklyStudyChart.jsx'
import useProgressAnalytics from './useProgressAnalytics.js'

function ErrorState({ onRetry }) {
  return (
    <div className="page-frame">
      <div className="max-w-xl rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="font-japanese text-sm font-semibold text-accent">読込エラー</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink">Progress belum dapat dibaca</h1>
        <p className="mt-3 text-sm leading-6 text-ink-muted">Data lokal tetap aman. Coba muat ulang ringkasan belajar.</p>
        <Button className="mt-6" onClick={onRetry}>
          <RotateCcw aria-hidden="true" size={17} /> Coba lagi
        </Button>
      </div>
    </div>
  )
}

export default function ProgressPage({ useAnalytics = useProgressAnalytics }) {
  const { analytics, retry, status } = useAnalytics()

  if (status === 'loading') {
    return <div className="page-frame"><LoadingState label="Memuat progress belajar" /></div>
  }

  if (status === 'error' || !analytics) return <ErrorState onRetry={retry} />

  return (
    <div className="page-frame">
      <header className="grid overflow-hidden rounded-2xl border border-border bg-surface lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="p-5 sm:p-8 lg:p-10">
          <p className="font-japanese text-sm font-semibold text-accent">学習記録</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-ink sm:text-5xl">Progress</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-ink-muted sm:text-base sm:leading-7">
            Ringkasan ini membaca aktivitas yang benar-benar tersimpan di perangkat Anda.
          </p>

          <div className="mt-8 max-w-xl">
            <ProgressBar label="Overall mastery" value={analytics.overall.percentage} />
            <p className="mt-3 text-sm text-ink-muted">
              <strong className="font-semibold tabular-nums text-ink">{analytics.overall.mastered}</strong> mastered,
              {' '}<strong className="font-semibold tabular-nums text-ink">{analytics.overall.studied}</strong> pernah dipelajari
              {' '}dari {analytics.overall.total} materi.
            </p>
          </div>
        </div>

        <div className="relative flex min-h-52 items-end justify-between border-t border-border bg-paper-deep/70 p-5 sm:p-8 lg:min-h-full lg:flex-col lg:items-stretch lg:border-l lg:border-t-0">
          <span className="absolute right-6 top-4 font-japanese text-8xl font-bold leading-none text-border/55" aria-hidden="true">歩</span>
          <p className="relative text-sm leading-6 text-ink-muted">Penguasaan tumbuh dari sesi kecil yang konsisten.</p>
          <p className="relative text-right">
            <strong className="block text-6xl font-semibold tracking-[-0.08em] tabular-nums text-accent">{analytics.overall.percentage}%</strong>
            <span className="text-xs font-semibold text-ink-muted">overall mastery</span>
          </p>
        </div>
      </header>

      <section aria-label="Ringkasan belajar" className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-surface lg:grid-cols-4">
        {[
          { icon: TimerReset, label: 'Belajar hari ini', value: `${analytics.today.minutes} min` },
          { icon: Flame, label: `Current streak · best ${analytics.streak.best}`, value: `${analytics.streak.current} hari` },
          { icon: BookOpenCheck, label: 'Sesi selesai', value: analytics.totalSessions },
          { icon: RotateCcw, label: 'Review jatuh tempo', value: analytics.dueReviewCount },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="border-b border-r border-border p-5 last:border-r-0 sm:p-6 lg:border-b-0">
            <Icon aria-hidden="true" size={18} className="text-accent" />
            <strong className="mt-5 block text-2xl font-semibold tracking-[-0.04em] tabular-nums text-ink">{value}</strong>
            <span className="mt-1 block text-xs text-ink-muted">{label}</span>
          </div>
        ))}
      </section>

      {analytics.empty ? (
        <p className="mt-6 rounded-xl border border-border bg-paper-deep px-4 py-3 text-sm leading-6 text-ink-muted">
          Belum ada aktivitas tersimpan. Statistik akan bergerak setelah Anda menyelesaikan sesi belajar.
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7"><MasteryLedger modules={analytics.modules} /></div>
        <div className="xl:col-span-5"><WeeklyStudyChart activity={analytics.weeklyActivity} /></div>
        <div className="xl:col-span-7"><AccuracyPanel quizAccuracy={analytics.quizAccuracy} reviewAccuracy={analytics.reviewAccuracy} /></div>
        <div className="xl:col-span-5"><StudyHistory history={analytics.history} /></div>
      </div>

      <section aria-labelledby="data-safety-heading" className="mt-6 grid gap-5 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-7">
        <span className="grid size-11 place-items-center rounded-xl bg-matcha-soft text-matcha">
          <ShieldCheck aria-hidden="true" size={22} />
        </span>
        <div>
          <p className="font-japanese text-xs font-semibold text-accent">データ保護</p>
          <h2 id="data-safety-heading" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-ink">Lindungi progress lokal</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">Unduh backup atau pulihkan data belajar dari file yang sudah divalidasi.</p>
        </div>
        <Link
          to="/data-safety"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-[#C9C0B2] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Kelola backup <ChevronRight aria-hidden="true" size={17} />
        </Link>
      </section>
    </div>
  )
}
