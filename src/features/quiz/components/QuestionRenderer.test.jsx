import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import QuestionRenderer from './QuestionRenderer'

const baseQuestion = {
  id: 'question-1',
  source: { module: 'vocabulary', itemId: 'n5-vocab-001' },
  answer: { value: 'makan', acceptedValues: ['makan'] },
}

function renderQuestion(question, props = {}) {
  return render(
    <MemoryRouter>
      <QuestionRenderer question={question} onAnswer={vi.fn()} {...props} />
    </MemoryRouter>,
  )
}

describe('QuestionRenderer', () => {
  it('renders multiple choice content and submits the selected primitive value', () => {
    const onAnswer = vi.fn()
    const question = {
      ...baseQuestion,
      type: 'multiple_choice',
      instruction: 'Pilih arti yang tepat.',
      content: { kind: 'text', text: '食べる', lang: 'ja' },
      options: [
        { value: 'makan', label: 'makan', lang: 'id' },
        { value: 'minum', label: 'minum', lang: 'id' },
      ],
    }

    renderQuestion(question, { onAnswer })

    expect(screen.getByRole('heading', { name: '食べる' })).toHaveAttribute('lang', 'ja')
    fireEvent.click(screen.getByRole('button', { name: 'makan' }))

    expect(onAnswer).toHaveBeenCalledWith('makan')
  })

  it('renders reverse-choice Japanese options and locks every choice when disabled', () => {
    const question = {
      ...baseQuestion,
      id: 'question-2',
      type: 'reverse_multiple_choice',
      instruction: 'Pilih kata Jepang yang tepat.',
      content: { kind: 'text', text: 'makan' },
      options: [
        { value: '食べる', label: '食べる', lang: 'ja' },
        { value: '飲む', label: '飲む', lang: 'ja' },
      ],
      answer: { value: '食べる', acceptedValues: ['食べる'] },
    }

    renderQuestion(question, { disabled: true })

    const choices = screen.getAllByRole('button')
    expect(screen.getByRole('button', { name: '食べる' })).toHaveAttribute('lang', 'ja')
    expect(choices).toHaveLength(2)
    choices.forEach((choice) => expect(choice).toBeDisabled())
  })

  it('submits typed text through a visibly labelled form and locks controls when disabled', () => {
    const onAnswer = vi.fn()
    const question = {
      ...baseQuestion,
      id: 'question-3',
      type: 'typing',
      instruction: 'Ketik romaji yang tepat.',
      content: { kind: 'text', text: '食べる', lang: 'ja' },
      answer: { value: 'taberu', acceptedValues: ['taberu'] },
    }

    const { rerender } = renderQuestion(question, { onAnswer })
    const answerInput = screen.getByRole('textbox', { name: 'Jawaban' })

    expect(screen.getByText('Jawaban')).toBeVisible()
    expect(screen.getByRole('heading', { name: '食べる' })).toHaveAttribute('lang', 'ja')
    fireEvent.change(answerInput, { target: { value: 'taberu' } })
    fireEvent.submit(screen.getByRole('form', { name: 'Kirim jawaban' }))

    expect(onAnswer).toHaveBeenCalledWith('taberu')

    rerender(
      <MemoryRouter>
        <QuestionRenderer question={question} disabled onAnswer={onAnswer} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('textbox', { name: 'Jawaban' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Kirim jawaban' })).toBeDisabled()
  })

  it('clears typing input when the question ID changes', () => {
    const question = {
      ...baseQuestion,
      id: 'typing-1',
      type: 'typing',
      instruction: 'Ketik romaji yang tepat.',
      content: { kind: 'text', text: '食べる', lang: 'ja' },
      answer: { value: 'taberu', acceptedValues: ['taberu'] },
    }
    const { rerender } = renderQuestion(question)

    fireEvent.change(screen.getByRole('textbox', { name: 'Jawaban' }), {
      target: { value: 'taberu' },
    })
    rerender(
      <MemoryRouter>
        <QuestionRenderer
          question={{ ...question, id: 'typing-2', content: { ...question.content, text: '飲む' } }}
          onAnswer={vi.fn()}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('textbox', { name: 'Jawaban' })).toHaveValue('')
  })

  it('renders exactly two explicit recognition answers with boolean callback values', () => {
    const onAnswer = vi.fn()
    const question = {
      ...baseQuestion,
      id: 'question-4',
      type: 'recognition',
      instruction: 'Apakah pasangan ini benar?',
      content: { kind: 'pair', primary: '食', secondary: 'makan' },
      answer: { value: true, acceptedValues: [true] },
      options: [
        { value: true, label: 'Benar' },
        { value: false, label: 'Salah' },
      ],
    }

    renderQuestion(question, { onAnswer })

    const answers = screen.getAllByRole('button')
    expect(answers).toHaveLength(2)
    expect(screen.getByText('食')).toHaveAttribute('lang', 'ja')
    fireEvent.click(screen.getByRole('button', { name: 'Salah' }))

    expect(onAnswer).toHaveBeenCalledWith(false)
  })

  it('renders a visible accessible sentence blank and submits a selected token', () => {
    const onAnswer = vi.fn()
    const question = {
      ...baseQuestion,
      id: 'question-5',
      type: 'sentence_completion',
      instruction: 'Pilih partikel yang tepat.',
      content: { kind: 'sentence', before: '学校', after: '行きます。', lang: 'ja' },
      answer: { value: 'へ', acceptedValues: ['へ'] },
      options: [
        { value: 'へ', label: 'へ', lang: 'ja' },
        { value: 'を', label: 'を', lang: 'ja' },
      ],
    }

    renderQuestion(question, { onAnswer })

    expect(screen.getByText('学校').parentElement).toHaveAttribute('lang', 'ja')
    expect(screen.getByText('＿＿')).toBeVisible()
    expect(screen.getByRole('img', { name: 'Bagian kosong' })).toBeInTheDocument()
    expect(screen.getByText('行きます。')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'へ' }))

    expect(onAnswer).toHaveBeenCalledWith('へ')
  })

  it('keeps every answer control touch-sized with visible keyboard focus styles', () => {
    const question = {
      ...baseQuestion,
      id: 'question-6',
      type: 'typing',
      instruction: 'Ketik romaji yang tepat.',
      content: { kind: 'text', text: '飲む', lang: 'ja' },
      answer: { value: 'nomu', acceptedValues: ['nomu'] },
    }

    renderQuestion(question)

    const controls = [
      screen.getByRole('textbox', { name: 'Jawaban' }),
      screen.getByRole('button', { name: 'Kirim jawaban' }),
    ]
    controls.forEach((control) => {
      expect(control).toHaveClass('min-h-11')
      expect(control.className).toContain('focus-visible:outline-2')
    })
  })

  it('shows recovery UI for an unsupported question type without throwing', () => {
    renderQuestion({ ...baseQuestion, type: 'matching' })

    expect(screen.getByRole('heading', { name: 'Tipe soal tidak didukung' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Kembali ke Practice' })).toHaveAttribute(
      'href',
      '/practice',
    )
  })
})
