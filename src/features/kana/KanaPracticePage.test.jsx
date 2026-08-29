import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'

const { createKanaQuizMock } = vi.hoisted(() => ({ createKanaQuizMock: vi.fn() }))

vi.mock('../quiz/adapters/kanaQuizAdapter.js', () => ({ createKanaQuiz: createKanaQuizMock }))

function createQuestion({ id, mode, prompt, answer, distractor }) {
  const reverse = mode === 'reverse'
  const typing = mode === 'typing'
  const question = {
    id,
    type: typing ? 'typing' : reverse ? 'reverse_multiple_choice' : 'multiple_choice',
    source: { module: 'kana', itemId: `hiragana:${id}` },
    instruction: typing
      ? 'Ketik romaji yang tepat.'
      : reverse ? 'Pilih kana yang tepat.' : 'Pilih romaji yang tepat.',
    content: { kind: 'text', text: prompt, ...(reverse ? {} : { lang: 'ja' }) },
    answer: { value: answer, acceptedValues: [answer] },
  }

  if (!typing) {
    question.options = [answer, distractor].map((value) => ({
      value,
      label: value,
      ...(reverse ? { lang: 'ja' } : {}),
    }))
  }

  return question
}

function questionsForMode(mode) {
  const fixtures = mode === 'reverse'
    ? [
        { prompt: 'a', answer: 'あ', distractor: 'い' },
        { prompt: 'i', answer: 'い', distractor: 'う' },
      ]
    : [
        { prompt: 'あ', answer: 'a', distractor: 'i' },
        { prompt: 'い', answer: 'i', distractor: 'u' },
      ]

  return fixtures.map((fixture, index) => createQuestion({
    ...fixture,
    id: `kana-${mode}-${index + 1}`,
    mode,
  }))
}

function renderRoute(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

function answerTyping(value) {
  fireEvent.change(screen.getByRole('textbox', { name: 'Jawaban' }), {
    target: { value },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Kirim jawaban' }))
}

describe('Kana practice', () => {
  beforeEach(() => {
    createKanaQuizMock.mockReset()
    createKanaQuizMock.mockImplementation(({ mode }) => questionsForMode(mode))
  })

  it('keeps Hiragana and Katakana practice entries on the overview', () => {
    renderRoute('/practice')

    expect(screen.getByRole('link', { name: 'Practice Hiragana' })).toHaveAttribute(
      'href',
      '/practice/kana/hiragana/recognition',
    )
    expect(screen.getByRole('link', { name: 'Practice Katakana' })).toHaveAttribute(
      'href',
      '/practice/kana/katakana/recognition',
    )
  })

  it('runs recognition through the shared session with locked feedback and navigation', () => {
    renderRoute('/practice/kana/hiragana/recognition')

    expect(screen.getByRole('heading', { name: 'Hiragana recognition' })).toBeVisible()
    expect(screen.getByText('あ')).toHaveAttribute('lang', 'ja')
    fireEvent.click(screen.getByRole('button', { name: 'a' }))

    expect(screen.getByRole('status')).toHaveTextContent('Benar')
    expect(screen.getByRole('button', { name: 'a' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))
    expect(screen.getByText('い')).toBeVisible()
  })

  it('runs reverse through the shared session with locked feedback and navigation', () => {
    renderRoute('/practice/kana/hiragana/reverse')

    expect(screen.getByText('a')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'あ' }))

    expect(screen.getByRole('status')).toHaveTextContent('Benar')
    expect(screen.getByRole('button', { name: 'あ' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))
    expect(screen.getByText('i')).toBeVisible()
  })

  it('runs typing through the shared session with locked feedback and navigation', () => {
    renderRoute('/practice/kana/hiragana/typing')

    expect(screen.getByText('あ')).toHaveAttribute('lang', 'ja')
    answerTyping('a')

    expect(screen.getByRole('status')).toHaveTextContent('Benar')
    expect(screen.getByRole('textbox', { name: 'Jawaban' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))
    expect(screen.getByText('い')).toBeVisible()
  })

  it('completes a deterministic Kana session and restarts with replacement questions', () => {
    renderRoute('/practice/kana/hiragana/typing')

    answerTyping('a')
    fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))
    answerTyping('i')

    expect(screen.getByRole('heading', { name: 'Hasil quiz' })).toBeVisible()
    expect(screen.getByText('2 dari 2')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Mulai lagi' }))

    expect(screen.getByRole('heading', { name: 'Soal 1 dari 2' })).toBeVisible()
    expect(createKanaQuizMock).toHaveBeenCalledTimes(2)
  })

  it('shows safe recovery for an invalid practice path', () => {
    renderRoute('/practice/kana/hiragana/matching')

    expect(screen.getByRole('heading', { name: 'Practice path not found' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to Practice' })).toHaveAttribute('href', '/practice')
    expect(createKanaQuizMock).not.toHaveBeenCalled()
  })
})
