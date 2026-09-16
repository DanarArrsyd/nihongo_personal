import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import QuizSession from './QuizSession'

const questions = [
  {
    id: 'vocabulary-meaning',
    type: 'multiple_choice',
    source: { module: 'vocabulary', itemId: 'n5-vocab-001' },
    instruction: 'Pilih arti yang tepat.',
    content: { kind: 'text', text: '食べる', lang: 'ja' },
    answer: { value: 'makan', acceptedValues: ['makan'] },
    options: [
      { value: 'makan', label: 'makan', lang: 'id' },
      { value: 'minum', label: 'minum', lang: 'id' },
    ],
  },
  {
    id: 'kanji-recognition',
    type: 'recognition',
    source: { module: 'kanji', itemId: 'n5-kanji-001' },
    instruction: 'Apakah pasangan ini benar?',
    content: { kind: 'pair', primary: '食', secondary: 'makan' },
    answer: { value: true, acceptedValues: [true] },
    options: [
      { value: true, label: 'Benar' },
      { value: false, label: 'Salah' },
    ],
  },
]

const thirdQuestion = {
  id: 'grammar-completion',
  type: 'sentence_completion',
  source: { module: 'grammar', itemId: 'n5-grammar-001' },
  instruction: 'Pilih partikel yang tepat.',
  content: { kind: 'sentence', before: '学校', after: '行きます。', lang: 'ja' },
  answer: { value: 'へ', acceptedValues: ['へ'] },
  options: [
    { value: 'へ', label: 'へ', lang: 'ja' },
    { value: 'を', label: 'を', lang: 'ja' },
  ],
}

const japaneseAnswerQuestions = [
  {
    id: 'kana-reverse',
    type: 'reverse_multiple_choice',
    source: { module: 'kana', itemId: 'hiragana:a' },
    instruction: 'Pilih kana yang tepat.',
    content: { kind: 'text', text: 'a' },
    answer: { value: 'あ', acceptedValues: ['あ'] },
    options: [
      { value: 'あ', label: 'あ', lang: 'ja' },
      { value: 'い', label: 'い', lang: 'ja' },
    ],
  },
  {
    id: 'vocabulary-reading',
    type: 'typing',
    source: { module: 'vocabulary', itemId: 'n5-vocab-002' },
    instruction: 'Ketik bacaan yang tepat.',
    content: { kind: 'text', text: '飲む', lang: 'ja' },
    answer: { value: 'のむ', acceptedValues: ['のむ', 'nomu'] },
  },
]

function renderSession(props = {}) {
  return render(
    <MemoryRouter>
      <QuizSession
        questions={questions}
        now={() => new Date('2026-08-28T12:00:00.000Z')}
        onRestart={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  )
}

function answerFirstQuestion() {
  fireEvent.click(screen.getByRole('button', { name: 'makan' }))
}

describe('QuizSession', () => {
  it('shows the current question count and semantic answer trail without moving initial focus', () => {
    renderSession()

    const heading = screen.getByRole('heading', { name: 'Soal 1 dari 2', level: 1 })
    expect(heading).not.toHaveFocus()
    expect(screen.getByRole('button', { name: 'Soal 1, saat ini' }))
      .toHaveAttribute('aria-current', 'step')
    expect(screen.getByRole('button', { name: 'Soal 2, belum dijawab' })).toBeDisabled()
  })

  it('locks a submitted answer, announces feedback, and guards next navigation', () => {
    renderSession()

    const next = screen.getByRole('button', { name: 'Soal berikutnya' })
    expect(next).toBeDisabled()

    answerFirstQuestion()

    const feedback = screen.getByRole('status')
    expect(feedback).toHaveTextContent('Benar')
    expect(feedback).toHaveClass('text-ink')
    expect(feedback.querySelector('svg')).toHaveClass('text-matcha')
    expect(screen.getByRole('button', { name: 'makan' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'minum' })).toBeDisabled()
    expect(next).toBeEnabled()
  })

  it('reports each accepted response once with the real quiz response payload', () => {
    const onResponse = vi.fn()
    const view = renderSession({ onResponse })

    answerFirstQuestion()

    expect(onResponse).toHaveBeenCalledOnce()
    expect(onResponse).toHaveBeenCalledWith({
      questionId: 'vocabulary-meaning',
      questionType: 'multiple_choice',
      userAnswer: 'makan',
      correctAnswer: 'makan',
      result: true,
      timestamp: '2026-08-28T12:00:00.000Z',
      associatedItem: { module: 'vocabulary', itemId: 'n5-vocab-001' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))
    fireEvent.click(screen.getByRole('button', { name: 'Soal sebelumnya' }))
    view.rerender(
      <MemoryRouter>
        <QuizSession
          questions={questions}
          now={() => new Date('2026-08-28T12:00:00.000Z')}
          onResponse={onResponse}
          onRestart={vi.fn()}
        />
      </MemoryRouter>,
    )

    expect(onResponse).toHaveBeenCalledOnce()
  })

  it('moves focus to the new question heading after next navigation', () => {
    renderSession()
    answerFirstQuestion()

    fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))

    expect(screen.getByRole('heading', { name: 'Soal 2 dari 2', level: 1 })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Soal 1, benar' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Soal 2, saat ini' }))
      .toHaveAttribute('aria-current', 'step')
  })

  it('reviews locked previous answers and navigates between answered trail positions', () => {
    renderSession({ questions: [...questions, thirdQuestion] })
    answerFirstQuestion()
    fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))
    fireEvent.click(screen.getByRole('button', { name: 'Benar' }))

    fireEvent.click(screen.getByRole('button', { name: 'Soal sebelumnya' }))

    expect(screen.getByRole('heading', { name: 'Soal 1 dari 3', level: 1 })).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('Benar')
    expect(screen.getByRole('button', { name: 'makan' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Soal 2, benar' }))

    expect(screen.getByRole('heading', { name: 'Soal 2 dari 3', level: 1 })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Benar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Soal 3, belum dijawab' })).toBeDisabled()
  })

  it('announces an incorrect answer with a localized boolean correction', () => {
    renderSession({ questions: [...questions, thirdQuestion] })
    answerFirstQuestion()
    fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))

    fireEvent.click(screen.getByRole('button', { name: 'Salah' }))

    const feedback = screen.getByRole('status')
    expect(feedback).toHaveTextContent('Belum tepat. Jawaban benar: Benar')
    expect(feedback).toHaveClass('text-ink')
    expect(feedback.querySelector('svg')).toHaveClass('text-accent')
    expect(screen.getByRole('button', { name: 'Soal 2, saat ini' }))
      .toHaveAttribute('aria-current', 'step')
    fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))
    expect(screen.getByRole('button', { name: 'Soal 2, salah' })).toBeEnabled()
  })

  it('shows a derived result and ordered per-question review with localized answers', () => {
    renderSession()
    answerFirstQuestion()
    fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salah' }))

    expect(screen.getByRole('heading', { name: 'Hasil quiz', level: 1 })).toBeVisible()
    expect(screen.getByText('1 dari 2')).toBeVisible()
    expect(screen.getByText('50%')).toHaveClass('text-ink')

    const reviews = screen.getAllByRole('listitem')
    expect(reviews).toHaveLength(2)
    expect(within(reviews[0]).getByText('Vocabulary')).toBeVisible()
    expect(within(reviews[0]).getByText('食べる')).toHaveAttribute('lang', 'ja')
    expect(within(reviews[0]).getByText('Jawaban Anda: makan')).toBeVisible()
    expect(within(reviews[0]).getByText('Jawaban benar: makan')).toBeVisible()
    const correctStatus = within(reviews[0]).getByText('Benar')
    expect(correctStatus).toHaveClass('text-ink')
    expect(correctStatus.querySelector('svg')).toHaveClass('text-matcha')
    expect(within(reviews[1]).getByText('Kanji')).toBeVisible()
    expect(within(reviews[1]).getByText('Jawaban Anda: Salah')).toBeVisible()
    expect(within(reviews[1]).getByText('Jawaban benar: Benar')).toBeVisible()
    const incorrectStatus = within(reviews[1]).getByText('Belum tepat')
    expect(incorrectStatus).toHaveClass('text-ink')
    expect(incorrectStatus.querySelector('svg')).toHaveClass('text-accent')
  })

  it('reports literal completion totals once after the final accepted answer', () => {
    const onComplete = vi.fn()
    const onResponse = vi.fn()
    const view = renderSession({ onComplete, onResponse })

    answerFirstQuestion()
    fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salah' }))

    expect(onResponse).toHaveBeenCalledTimes(2)
    expect(onComplete).toHaveBeenCalledOnce()
    expect(onComplete).toHaveBeenCalledWith({
      itemCount: 2,
      correctCount: 1,
      score: 50,
    })

    view.rerender(
      <MemoryRouter>
        <QuizSession
          questions={questions}
          now={() => new Date('2026-08-28T12:00:00.000Z')}
          onComplete={onComplete}
          onResponse={onResponse}
          onRestart={vi.fn()}
        />
      </MemoryRouter>,
    )

    expect(onResponse).toHaveBeenCalledTimes(2)
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('marks Japanese answers in feedback and results with Japanese language semantics', () => {
    renderSession({ questions: japaneseAnswerQuestions })

    fireEvent.click(screen.getByRole('button', { name: 'い' }))

    const feedback = screen.getByRole('status')
    expect(within(feedback).getByText('あ')).toHaveAttribute('lang', 'ja')
    expect(within(feedback).getByText('あ')).toHaveClass('font-japanese')

    fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Jawaban' }), {
      target: { value: 'nomu' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Kirim jawaban' }))

    const reviews = screen.getAllByRole('listitem')
    expect(within(reviews[0]).getByText('い')).toHaveAttribute('lang', 'ja')
    expect(within(reviews[0]).getByText('あ')).toHaveAttribute('lang', 'ja')
    expect(within(reviews[1]).getByText('のむ')).toHaveAttribute('lang', 'ja')
    expect(within(reviews[1]).getByText('のむ')).toHaveClass('font-japanese')
    expect(within(reviews[1]).getByText('Jawaban Anda: nomu')).not.toHaveAttribute('lang')
  })

  it('calls the restart callback from results', () => {
    const onRestart = vi.fn()
    renderSession({ onRestart })
    answerFirstQuestion()
    fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salah' }))

    fireEvent.click(screen.getByRole('button', { name: 'Mulai lagi' }))

    expect(onRestart).toHaveBeenCalledOnce()
  })

  it('renders Practice recovery UI for an invalid question set', () => {
    renderSession({ questions: [] })

    expect(screen.getByRole('heading', { name: 'Quiz belum tersedia' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Kembali ke Practice' })).toHaveAttribute(
      'href',
      '/practice',
    )
  })
})
