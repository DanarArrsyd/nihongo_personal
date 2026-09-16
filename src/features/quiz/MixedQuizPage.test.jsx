import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'

const {
  createMixedQuizMock,
  createStudySessionMock,
  onCompleteMock,
  onResponseMock,
  useQuizPersistenceMock,
} = vi.hoisted(() => ({
  createMixedQuizMock: vi.fn(),
  createStudySessionMock: vi.fn(),
  onCompleteMock: vi.fn(),
  onResponseMock: vi.fn(),
  useQuizPersistenceMock: vi.fn(),
}))

vi.mock('./adapters/mixedQuizAdapter.js', () => ({ createMixedQuiz: createMixedQuizMock }))
vi.mock('../../services/studySession.js', () => ({ createStudySession: createStudySessionMock }))
vi.mock('../persistence/useQuizPersistence.js', () => ({ default: useQuizPersistenceMock }))

const questions = [
  {
    id: 'mixed-kana-choice', type: 'multiple_choice',
    source: { module: 'kana', itemId: 'hiragana:a' }, instruction: 'Pilih romaji yang tepat.',
    content: { kind: 'text', text: 'あ', lang: 'ja' }, answer: { value: 'a', acceptedValues: ['a'] },
    options: [{ value: 'a', label: 'a' }, { value: 'i', label: 'i' }],
  },
  {
    id: 'mixed-vocabulary-choice', type: 'multiple_choice',
    source: { module: 'vocabulary', itemId: 'vocab-eat' }, instruction: 'Pilih arti yang tepat.',
    content: { kind: 'text', text: '食べる', lang: 'ja' }, answer: { value: 'makan', acceptedValues: ['makan'] },
    options: [{ value: 'makan', label: 'makan' }, { value: 'minum', label: 'minum' }],
  },
  {
    id: 'mixed-kana-reverse', type: 'reverse_multiple_choice',
    source: { module: 'kana', itemId: 'katakana:a' }, instruction: 'Pilih kana yang tepat.',
    content: { kind: 'text', text: 'a' }, answer: { value: 'ア', acceptedValues: ['ア'] },
    options: [{ value: 'ア', label: 'ア', lang: 'ja' }, { value: 'イ', label: 'イ', lang: 'ja' }],
  },
  {
    id: 'mixed-vocabulary-reverse', type: 'reverse_multiple_choice',
    source: { module: 'vocabulary', itemId: 'vocab-drink' }, instruction: 'Pilih kosakata yang tepat.',
    content: { kind: 'text', text: 'minum' }, answer: { value: '飲む', acceptedValues: ['飲む'] },
    options: [{ value: '飲む', label: '飲む', lang: 'ja' }, { value: '食べる', label: '食べる', lang: 'ja' }],
  },
  {
    id: 'mixed-vocabulary-typing', type: 'typing',
    source: { module: 'vocabulary', itemId: 'vocab-see' }, instruction: 'Ketik bacaan yang tepat.',
    content: { kind: 'text', text: '見る', lang: 'ja' }, answer: { value: 'みる', acceptedValues: ['みる', 'miru'] },
  },
  {
    id: 'mixed-kanji-typing', type: 'typing',
    source: { module: 'kanji', itemId: 'kanji-water' }, instruction: 'Ketik bacaan yang tepat.',
    content: { kind: 'text', text: '水', lang: 'ja' }, answer: { value: 'スイ', acceptedValues: ['スイ', 'みず'] },
  },
  {
    id: 'mixed-kanji-recognition', type: 'recognition',
    source: { module: 'kanji', itemId: 'kanji-fire' }, instruction: 'Apakah pasangan ini benar?',
    content: { kind: 'pair', primary: '火', secondary: 'api' }, answer: { value: true, acceptedValues: [true] },
    options: [{ value: true, label: 'Benar' }, { value: false, label: 'Salah' }],
  },
  {
    id: 'mixed-grammar-recognition', type: 'recognition',
    source: { module: 'grammar', itemId: 'grammar-wa' }, instruction: 'Apakah pasangan ini benar?',
    content: { kind: 'pair', primary: '～は', secondary: 'penanda topik' }, answer: { value: true, acceptedValues: [true] },
    options: [{ value: true, label: 'Benar' }, { value: false, label: 'Salah' }],
  },
  {
    id: 'mixed-grammar-completion-one', type: 'sentence_completion',
    source: { module: 'grammar', itemId: 'grammar-wa-completion' }, instruction: 'Pilih partikel yang tepat.',
    content: { kind: 'sentence', before: '私', after: '学生です。', lang: 'ja' }, answer: { value: 'は', acceptedValues: ['は'] },
    options: [{ value: 'は', label: 'は', lang: 'ja' }, { value: 'を', label: 'を', lang: 'ja' }],
  },
  {
    id: 'mixed-grammar-completion-two', type: 'sentence_completion',
    source: { module: 'grammar', itemId: 'grammar-o-completion' }, instruction: 'Pilih partikel yang tepat.',
    content: { kind: 'sentence', before: '水', after: '飲みます。', lang: 'ja' }, answer: { value: 'を', acceptedValues: ['を'] },
    options: [{ value: 'を', label: 'を', lang: 'ja' }, { value: 'に', label: 'に', lang: 'ja' }],
  },
]

function renderRoute(path) {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

function answerCurrent(question) {
  if (question.type === 'typing') {
    fireEvent.change(screen.getByRole('textbox', { name: 'Jawaban' }), {
      target: { value: question.answer.value },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Kirim jawaban' }))
    return
  }

  const option = question.options.find(({ value }) => value === question.answer.value)
  fireEvent.click(screen.getByRole('button', { name: option.label }))
}

describe('Mixed quiz route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createMixedQuizMock.mockReturnValue({ questions, error: null })
    let sessionCount = 0
    createStudySessionMock.mockImplementation(({ kind, module }) => ({
      sessionId: `mixed-session-${++sessionCount}`,
      kind,
      module,
      startedAt: '2026-09-15T01:00:00.000Z',
    }))
    useQuizPersistenceMock.mockReturnValue({
      onComplete: onCompleteMock,
      onResponse: onResponseMock,
    })
  })

  it('adds a primary Mixed Quiz entry to Practice while keeping Kana practice', () => {
    renderRoute('/practice')

    expect(screen.getByRole('link', { name: 'Mulai Mixed Quiz' })).toHaveAttribute('href', '/practice/mixed')
    expect(screen.getByRole('link', { name: 'Practice Hiragana' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Practice Katakana' })).toBeVisible()
  })

  it('completes ten questions, reviews every answer, and restarts a fresh session', () => {
    renderRoute('/practice/mixed')

    expect(createStudySessionMock).toHaveBeenCalledWith({ kind: 'quiz', module: 'mixed' })
    expect(useQuizPersistenceMock).toHaveBeenCalledWith({
      sessionId: 'mixed-session-1',
      kind: 'quiz',
      module: 'mixed',
      startedAt: '2026-09-15T01:00:00.000Z',
    })

    expect(screen.getByRole('heading', { name: 'Mixed Quiz', level: 1 })).toBeVisible()
    expect(screen.getByText(/Kana, Vocabulary, Kanji, dan Grammar/)).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Soal 1 dari 10' })).toBeVisible()

    questions.forEach((question, index) => {
      answerCurrent(question)
      if (index < questions.length - 1) {
        fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))
      }
    })

    expect(screen.getByRole('heading', { name: 'Hasil quiz' })).toBeVisible()
    expect(screen.getByText('10 dari 10')).toBeVisible()
    expect(screen.getAllByRole('listitem')).toHaveLength(10)
    expect(onResponseMock).toHaveBeenCalledTimes(10)
    expect(onCompleteMock).toHaveBeenCalledOnce()
    expect(onCompleteMock).toHaveBeenCalledWith({
      itemCount: 10,
      correctCount: 10,
      score: 100,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Mulai lagi' }))

    expect(screen.getByRole('heading', { name: 'Soal 1 dari 10' })).toBeVisible()
    expect(createMixedQuizMock).toHaveBeenCalledTimes(2)
    expect(createStudySessionMock).toHaveBeenCalledTimes(2)
    expect(useQuizPersistenceMock).toHaveBeenLastCalledWith({
      sessionId: 'mixed-session-2',
      kind: 'quiz',
      module: 'mixed',
      startedAt: '2026-09-15T01:00:00.000Z',
    })
  })

  it('shows exact recovery when mixed generation is unavailable', () => {
    createMixedQuizMock.mockReturnValue({ questions: [], error: 'Quiz belum tersedia.' })

    renderRoute('/practice/mixed')

    expect(screen.getByRole('heading', { name: 'Quiz belum tersedia' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Kembali ke Practice' })).toHaveAttribute('href', '/practice')
  })
})
