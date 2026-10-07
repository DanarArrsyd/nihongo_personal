import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'

const dailyMissionMock = vi.hoisted(() => {
  const createTask = (id, type, target, unit, completed = false) => ({
    id,
    type,
    title: id,
    route: '/',
    target,
    unit,
    itemIds: [],
    completed,
    completedAt: null,
  })
  const mission = {
    date: '2026-10-04',
    status: 'not_started',
    tasks: [
      createTask('review', 'review', 0, 'item', true),
      createTask('vocabulary', 'learn', 5, 'kata'),
      createTask('kanji', 'learn', 2, 'kanji'),
      createTask('grammar', 'learn', 1, 'pola'),
      createTask('practice', 'practice', 10, 'soal'),
    ],
  }

  return {
    completeTask: vi.fn(),
    mission,
    retry: vi.fn(),
    start: vi.fn(async () => ({ ...mission, status: 'in_progress' })),
    status: 'ready',
  }
})

const progressAnalyticsMock = vi.hoisted(() => ({
  analytics: {
    dueReviewCount: 2,
    history: [{
      accuracy: 80,
      date: '2026-10-04T01:00:00.000Z',
      id: 'session-1',
      itemCount: 10,
      kind: 'quiz',
      label: 'Mixed Quiz',
      module: 'mixed',
    }],
    modules: [
      { id: 'kana', mastered: 4 },
      { id: 'vocabulary', mastered: 3 },
      { id: 'kanji', mastered: 2 },
      { id: 'grammar', mastered: 1 },
    ],
    streak: { current: 3 },
    today: { minutes: 12 },
    weeklyActivity: Array.from({ length: 7 }, (_, index) => ({ day: `D${index + 1}`, minutes: index * 2 })),
  },
  retry: vi.fn(),
  status: 'ready',
}))

vi.mock('../missions/useDailyMission.js', () => ({
  default: () => dailyMissionMock,
}))

vi.mock('../progress/useProgressAnalytics.js', () => ({
  default: () => progressAnalyticsMock,
}))

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
}

describe('Dashboard', () => {
  it('shows today’s study context and goal', () => {
    renderDashboard()

    expect(screen.getByText('おはようございます。')).toBeVisible()
    expect(screen.getByText('Welcome back.')).toBeVisible()
    expect(screen.getByText('JLPT N5')).toBeVisible()
    expect(screen.getByRole('progressbar', { name: 'Daily goal' })).toHaveAttribute(
      'aria-valuenow',
      '60',
    )
    expect(screen.getByText('12 / 20 minutes')).toBeVisible()
  })

  it('shows generated daily mission groups from persisted mission data', () => {
    renderDashboard()

    const mission = screen.getByRole('region', { name: 'Daily mission' })
    expect(within(mission).getByText('0 item')).toBeVisible()
    expect(within(mission).getByText('5 kata')).toBeVisible()
    expect(within(mission).getByText('2 kanji')).toBeVisible()
    expect(within(mission).getByText('1 pola')).toBeVisible()
    expect(within(mission).getByText('10 soal')).toBeVisible()
    expect(within(mission).getByRole('button', { name: 'Mulai misi' })).toBeVisible()
  })

  it('shows streak, learning statistics, weekly activity, and recent activity', () => {
    renderDashboard()

    expect(screen.getByText('3 days')).toBeVisible()
    expect(screen.getByRole('region', { name: 'Learning statistics' })).toBeInTheDocument()
    expect(screen.getByRole('figure', { name: 'Weekly learning activity' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Recent activity' })).toBeInTheDocument()
  })

  it('continues learning from dashboard to Learn', () => {
    renderDashboard()

    fireEvent.click(screen.getByRole('button', { name: 'Continue learning' }))

    expect(screen.getByRole('heading', { name: 'Learn', level: 1 })).toBeInTheDocument()
  })
})
