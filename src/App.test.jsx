import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

function renderRoute(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
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
    ['/library', 'Library'],
  ])('renders the %s route as %s', (path, heading) => {
    renderRoute(path)

    expect(screen.getByRole('heading', { name: heading, level: 1 })).toBeInTheDocument()
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
