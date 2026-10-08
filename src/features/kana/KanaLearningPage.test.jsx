import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'

function renderRoute(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('Kana learning', () => {
  it('opens Hiragana and Katakana from Learn overview', () => {
    renderRoute('/learn')

    expect(screen.getByRole('heading', { name: 'Learn', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Study Hiragana' })).toHaveAttribute(
      'href',
      '/learn/kana/hiragana/vowels',
    )
    expect(screen.getByRole('link', { name: 'Study Katakana' })).toHaveAttribute(
      'href',
      '/learn/kana/katakana/vowels',
    )
  })

  it.each([
    ['/learn/kana/hiragana/vowels', 'Hiragana', 'あ, a'],
    ['/learn/kana/katakana/vowels', 'Katakana', 'ア, a'],
  ])('renders shared script learning at %s', (path, heading, firstCharacter) => {
    renderRoute(path)

    expect(screen.getByRole('heading', { name: heading, level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Vowels' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: firstCharacter })).toBeInTheDocument()
  })

  it('changes group and selected character detail', () => {
    renderRoute('/learn/kana/hiragana/vowels')

    fireEvent.click(screen.getByRole('link', { name: 'K Group' }))
    expect(screen.getByRole('heading', { name: 'K Group' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'き, ki' }))
    expect(screen.getByRole('region', { name: 'Character detail' })).toHaveTextContent('き')
    expect(screen.getByRole('region', { name: 'Character detail' })).toHaveTextContent('ki')
    expect(screen.getByRole('link', { name: 'Practice writing き' }))
      .toHaveAttribute('href', '/practice/writing/kana/hiragana/ki')
  })

  it('tracks learned characters only in current session', () => {
    renderRoute('/learn/kana/hiragana/vowels')

    expect(screen.getByText('0 of 104 learned')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Mark あ as learned' }))

    expect(screen.getByText('1 of 104 learned')).toBeVisible()
    expect(screen.getByText('Learned')).toBeVisible()
  })

  it('shows pronunciation fallback without browser speech support', () => {
    renderRoute('/learn/kana/hiragana/vowels')

    fireEvent.click(screen.getByRole('button', { name: 'Pronounce あ' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Japanese pronunciation is not available in this browser.',
    )
  })

  it('shows safe recovery for an invalid Kana path', () => {
    renderRoute('/learn/kana/romaji/vowels')

    expect(screen.getByRole('heading', { name: 'Kana path not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Learn' })).toHaveAttribute('href', '/learn')
  })
})
