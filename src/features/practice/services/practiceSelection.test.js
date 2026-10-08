import { describe, expect, it } from 'vitest'
import { selectPracticeQuestions } from './practiceSelection.js'

const zeroRng = () => 0

function question(id, module = 'vocabulary', type = 'typing') {
  return { id, type, source: { module, itemId: id } }
}

describe('practice question selection', () => {
  it('removes duplicate question IDs and rejects an undersized pool', () => {
    const duplicate = question('one')

    expect(selectPracticeQuestions({ questions: [duplicate, duplicate], count: 2, rng: zeroRng }))
      .toEqual([])
  })

  it('deprioritizes items shown in recent history', () => {
    const questions = [question('recent'), question('fresh'), question('fresh-two')]
    const selected = selectPracticeQuestions({
      questions,
      count: 2,
      history: [{ itemType: 'vocabulary', itemId: 'recent' }],
      rng: zeroRng,
    })

    expect(selected.map(({ id }) => id)).toEqual(['fresh', 'fresh-two'])
  })

  it('prioritizes weak items over mastered items at the same balance level', () => {
    const questions = [question('mastered'), question('weak')]
    const selected = selectPracticeQuestions({
      questions,
      count: 1,
      progress: [
        { itemType: 'vocabulary', itemId: 'mastered', correctCount: 10, incorrectCount: 0, status: 'mastered' },
        { itemType: 'vocabulary', itemId: 'weak', correctCount: 1, incorrectCount: 9, status: 'learning' },
      ],
      rng: zeroRng,
    })

    expect(selected[0].id).toBe('weak')
  })

  it('balances modules and question types before repeating either', () => {
    const questions = [
      question('kana-choice', 'kana', 'multiple_choice'),
      question('kana-typing', 'kana', 'typing'),
      question('vocab-choice', 'vocabulary', 'multiple_choice'),
      question('vocab-typing', 'vocabulary', 'typing'),
    ]
    const selected = selectPracticeQuestions({ questions, count: 4, rng: zeroRng })

    expect(new Set(selected.map(({ source }) => source.module))).toEqual(new Set(['kana', 'vocabulary']))
    expect(new Set(selected.map(({ type }) => type))).toEqual(new Set(['multiple_choice', 'typing']))
  })
})
