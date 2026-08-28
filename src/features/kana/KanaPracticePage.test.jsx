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

describe('Kana practice', () => {
  it('opens Hiragana and Katakana practice from the overview', () => {
    renderRoute('/practice')

    expect(screen.getByRole('heading', { name: 'Practice', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Practice Hiragana' })).toHaveAttribute(
      'href',
      '/practice/kana/hiragana/recognition',
    )
    expect(screen.getByRole('link', { name: 'Practice Katakana' })).toHaveAttribute(
      'href',
      '/practice/kana/katakana/recognition',
    )
  })

  it('runs recognition questions and advances', () => {
    renderRoute('/practice/kana/hiragana/recognition')

    expect(screen.getByRole('heading', { name: 'Hiragana recognition' })).toBeInTheDocument()
    expect(screen.getByText('あ')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'a' }))
    expect(screen.getByRole('status')).toHaveTextContent('Correct')

    fireEvent.click(screen.getByRole('button', { name: 'Next question' }))
    expect(screen.getByText('い')).toBeVisible()
  })

  it('runs reverse questions', () => {
    renderRoute('/practice/kana/hiragana/reverse')

    expect(screen.getByText('a')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'あ' }))
    expect(screen.getByRole('status')).toHaveTextContent('Correct')
  })

  it('checks typed romaji', () => {
    renderRoute('/practice/kana/hiragana/typing')

    fireEvent.change(screen.getByRole('textbox', { name: 'Your romaji answer' }), {
      target: { value: 'a' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))

    expect(screen.getByRole('status')).toHaveTextContent('Correct')
  })

  it('reveals the correct answer after a mistake', () => {
    renderRoute('/practice/kana/katakana/recognition')

    fireEvent.click(screen.getByRole('button', { name: 'i' }))
    expect(screen.getByRole('status')).toHaveTextContent('Not quite. Correct answer: a')
  })

  it('shows safe recovery for an invalid practice path', () => {
    renderRoute('/practice/kana/hiragana/matching')

    expect(screen.getByRole('heading', { name: 'Practice path not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Practice' })).toHaveAttribute('href', '/practice')
  })
})
