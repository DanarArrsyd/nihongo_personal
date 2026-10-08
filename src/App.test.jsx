import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import PersistenceProvider from './features/persistence/PersistenceProvider'

const progressAnalyticsMock = vi.hoisted(() => ({
  analytics: {
    dueReviewCount: 0,
    empty: true,
    history: [],
    modules: [
      { id: 'kana', label: 'Kana', japanese: 'かな', mastered: 0, percentage: 0, studied: 0, total: 2 },
      { id: 'vocabulary', label: 'Vocabulary', japanese: '言葉', mastered: 0, percentage: 0, studied: 0, total: 2 },
      { id: 'kanji', label: 'Kanji', japanese: '漢字', mastered: 0, percentage: 0, studied: 0, total: 1 },
      { id: 'grammar', label: 'Grammar', japanese: '文法', mastered: 0, percentage: 0, studied: 0, total: 1 },
    ],
    overall: { mastered: 0, percentage: 0, studied: 0, total: 6 },
    quizAccuracy: { correct: 0, percentage: 0, total: 0 },
    reviewAccuracy: { correct: 0, percentage: 0, total: 0 },
    streak: { best: 0, current: 0 },
    today: { minutes: 0, sessions: 0 },
    totalSessions: 0,
    weeklyActivity: Array.from({ length: 7 }, (_, index) => ({
      date: `2026-10-0${index + 1}`,
      day: `D${index + 1}`,
      minutes: 0,
      sessions: 0,
    })),
  },
  retry: vi.fn(),
  status: 'ready',
}))

const libraryFavoritesMock = vi.hoisted(() => ({
  favoriteKeys: new Set(),
  retry: vi.fn(),
  status: 'ready',
  toggleFavorite: vi.fn(),
}))

vi.mock('./features/progress/useProgressAnalytics.js', () => ({
  default: () => progressAnalyticsMock,
}))

vi.mock('./features/library/useLibraryFavorites.js', () => ({
  default: () => libraryFavoritesMock,
}))

function renderRoute(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PersistenceProvider>
        <App />
      </PersistenceProvider>
    </MemoryRouter>,
  )
}

describe('application routes', () => {
  it.each([
    ['/', 'Dashboard'],
    ['/learn', 'Learn'],
    ['/practice', 'Practice'],
    ['/review', 'Review'],
    ['/progress', 'Progress'],
    ['/data-safety', 'Backup & restore'],
    ['/library', 'Library'],
  ])('renders the %s route as %s', async (path, heading) => {
    renderRoute(path)

    expect(await screen.findByRole('heading', { name: heading, level: 1 })).toBeInTheDocument()
  })

  it('marks the current destination in primary navigation', () => {
    renderRoute('/review')

    expect(screen.getByRole('link', { name: 'Review' })).toHaveAttribute('aria-current', 'page')
  })

  it('opens and dismisses mobile navigation with the keyboard', () => {
    renderRoute('/')

    expect(screen.queryByRole('dialog', { name: 'Mobile navigation' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }))
    expect(screen.getByRole('dialog', { name: 'Mobile navigation' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Mobile navigation' })).not.toBeInTheDocument()
  })

  it('adds Flashcards to Practice while preserving Mixed Quiz and Kana', () => {
    renderRoute('/practice')

    expect(screen.getByRole('link', { name: 'Pilih deck Flashcards' }))
      .toHaveAttribute('href', '/practice/flashcards')
    expect(screen.getByRole('link', { name: 'Mulai Mixed Quiz' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Practice Hiragana' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Practice Katakana' })).toBeVisible()
  })

  it('returns from an unknown route to the dashboard', () => {
    renderRoute('/missing-page')

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Back to dashboard' }))
    expect(screen.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeInTheDocument()
  })
})
