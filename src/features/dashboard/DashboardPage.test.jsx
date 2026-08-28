import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'

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
      '90',
    )
    expect(screen.getByText('18 / 20 minutes')).toBeVisible()
  })

  it('shows complete daily mission groups from dashboard data', () => {
    renderDashboard()

    const mission = screen.getByRole('region', { name: 'Daily mission' })
    expect(within(mission).getByText('18 items')).toBeVisible()
    expect(within(mission).getByText('5 Vocabulary')).toBeVisible()
    expect(within(mission).getByText('2 Kanji')).toBeVisible()
    expect(within(mission).getByText('1 Grammar')).toBeVisible()
    expect(within(mission).getByText('10 Questions')).toBeVisible()
  })

  it('shows streak, learning statistics, weekly activity, and recent activity', () => {
    renderDashboard()

    expect(screen.getByText('12 days')).toBeVisible()
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
