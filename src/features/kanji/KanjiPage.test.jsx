import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'

function renderRoute(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('Kanji learning', () => {
  it('opens Kanji from Learn', () => {
    renderRoute('/learn')

    expect(screen.getByRole('link', { name: 'Study Kanji' })).toHaveAttribute(
      'href',
      '/learn/kanji',
    )
  })

  it('shows the 60-character Kanji index', () => {
    renderRoute('/learn/kanji')

    expect(screen.getByRole('heading', { name: 'Kanji', level: 1 })).toBeVisible()
    expect(screen.getByText('60 characters')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Study 食 — makan' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Study 日 — hari' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Study 八 — delapan' })).toBeVisible()
  })

  it('shows added Kanji with linked vocabulary and contextual examples', () => {
    renderRoute('/learn/kanji/n5-kanji-027')
    expect(screen.getByRole('heading', { name: '車', level: 1 })).toBeVisible()
    expect(screen.getByText('7 strokes')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Open vocabulary 自転車' }))
      .toHaveAttribute('href', '/learn/vocabulary/n5-vocab-072')
    expect(screen.getByRole('heading', { name: 'Kanji in context' })).toBeVisible()
    expect(screen.getByText('電車で学校へ行きます。')).toBeVisible()
  })

  it('shows standalone examples when no vocabulary entry contains the Kanji', () => {
    renderRoute('/learn/kanji/n5-kanji-060')
    expect(screen.getByRole('heading', { name: '八', level: 1 })).toBeVisible()
    expect(screen.getByText('八時に学校へ行きます。')).toBeVisible()
    expect(screen.getByText('はちじにがっこうへいきます。')).toBeVisible()
    expect(screen.getByText('Saya pergi ke sekolah pukul delapan.')).toBeVisible()
  })

  it('shows Kanji details and related vocabulary links', () => {
    renderRoute('/learn/kanji/n5-kanji-001')

    expect(screen.getByRole('heading', { name: '食', level: 1 })).toBeVisible()
    expect(screen.getByText('makan, makanan')).toBeVisible()
    expect(screen.getByText('ショク')).toBeVisible()
    expect(screen.getByText('た.べる')).toBeVisible()
    expect(screen.getByText('9 strokes')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Open vocabulary 食べる' })).toHaveAttribute(
      'href',
      '/learn/vocabulary/n5-vocab-001',
    )
    expect(screen.getByRole('link', { name: 'Open vocabulary ご飯' })).toHaveAttribute(
      'href',
      '/learn/vocabulary/n5-vocab-018',
    )
  })

  it('renders an empty kunyomi without losing its label', () => {
    renderRoute('/learn/kanji/n5-kanji-012')

    expect(screen.getByText("Kun'yomi")).toBeVisible()
    expect(screen.getByText('—')).toBeVisible()
  })

  it('shows safe recovery for an invalid Kanji ID', () => {
    renderRoute('/learn/kanji/not-real')

    expect(screen.getByRole('heading', { name: 'Kanji not found' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to Kanji' })).toHaveAttribute(
      'href',
      '/learn/kanji',
    )
  })
})
