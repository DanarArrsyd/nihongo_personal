import { describe, expect, it } from 'vitest'

import { createQuizResponse } from './quizResponse.js'

const question = {
  id: 'vocab-001-meaning',
  type: 'multiple_choice',
  source: { module: 'vocabulary', itemId: 'n5-vocab-001' },
  answer: { value: 'makan', acceptedValues: ['makan'] },
}

describe('quiz response', () => {
  it('creates an immutable timestamped response from an evaluated answer', () => {
    const response = createQuizResponse({
      question,
      userAnswer: 'makan',
      now: () => new Date('2026-08-28T12:00:00.000Z'),
    })

    expect(response).toEqual({
      questionId: 'vocab-001-meaning',
      questionType: 'multiple_choice',
      userAnswer: 'makan',
      correctAnswer: 'makan',
      result: true,
      timestamp: '2026-08-28T12:00:00.000Z',
      associatedItem: { module: 'vocabulary', itemId: 'n5-vocab-001' },
    })
    expect(response.associatedItem).not.toBe(question.source)
    expect(question).toEqual({
      id: 'vocab-001-meaning',
      type: 'multiple_choice',
      source: { module: 'vocabulary', itemId: 'n5-vocab-001' },
      answer: { value: 'makan', acceptedValues: ['makan'] },
    })
  })
})
