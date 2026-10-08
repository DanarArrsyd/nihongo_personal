import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import ProgressPage from './ProgressPage.jsx'

const analytics = {
  dueReviewCount: 2,
  empty: false,
  history: [
    {
      accuracy: 80,
      date: '2026-10-07T02:00:00.000Z',
      durationMinutes: 12,
      id: 'session-1',
      itemCount: 10,
      kind: 'quiz',
      label: 'Mixed Quiz',
      module: 'mixed',
    },
  ],
  modules: [
    { id: 'kana', label: 'Kana', japanese: 'かな', mastered: 4, percentage: 25, studied: 8, total: 16 },
    { id: 'vocabulary', label: 'Vocabulary', japanese: '言葉', mastered: 3, percentage: 10, studied: 5, total: 30 },
    { id: 'kanji', label: 'Kanji', japanese: '漢字', mastered: 1, percentage: 5, studied: 2, total: 20 },
    { id: 'grammar', label: 'Grammar', japanese: '文法', mastered: 1, percentage: 8, studied: 2, total: 12 },
  ],
  overall: { mastered: 9, percentage: 12, studied: 17, total: 78 },
  quizAccuracy: { correct: 8, percentage: 80, total: 10 },
  reviewAccuracy: { correct: 3, percentage: 75, total: 4 },
  streak: { best: 5, current: 3 },
  today: { minutes: 12, sessions: 1 },
  totalSessions: 24,
  weeklyActivity: Array.from({ length: 7 }, (_, index) => ({
    date: `2026-10-0${index + 1}`,
    day: `D${index + 1}`,
    minutes: index * 2,
    sessions: index ? 1 : 0,
  })),
}

describe('ProgressPage', () => {
  it('renders persisted analytics and study history', () => {
    const useAnalytics = () => ({ analytics, retry: vi.fn(), status: 'ready' })
    render(<MemoryRouter><ProgressPage useAnalytics={useAnalytics} /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: 'Progress', level: 1 })).toBeVisible()
    expect(screen.getByRole('progressbar', { name: 'Overall mastery' })).toHaveAttribute('aria-valuenow', '12')
    expect(screen.getByRole('heading', { name: 'Mastery per modul' })).toBeVisible()
    expect(screen.getByText('Mixed Quiz')).toBeVisible()
    expect(screen.getAllByText('80%')).toHaveLength(2)
    expect(screen.getByText('3 hari')).toBeVisible()
    expect(screen.getByText('24')).toBeVisible()
    expect(screen.getByText('Current streak · best 5')).toBeVisible()
    expect(screen.getByRole('link', { name: /Kelola backup/ })).toHaveAttribute('href', '/data-safety')
  })

  it('shows an honest empty-state note', () => {
    const useAnalytics = () => ({
      analytics: { ...analytics, empty: true, history: [] },
      retry: vi.fn(),
      status: 'ready',
    })
    render(<MemoryRouter><ProgressPage useAnalytics={useAnalytics} /></MemoryRouter>)

    expect(screen.getByText(/Belum ada aktivitas tersimpan/)).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Belum ada sesi selesai' })).toBeVisible()
  })

  it('retries after a persistence failure', () => {
    const retry = vi.fn()
    const useAnalytics = () => ({ analytics: null, retry, status: 'error' })
    render(<MemoryRouter><ProgressPage useAnalytics={useAnalytics} /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
