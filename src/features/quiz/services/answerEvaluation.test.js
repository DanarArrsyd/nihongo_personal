import { describe, expect, it } from 'vitest'

import { evaluateAnswer, normalizeAnswer } from './answerEvaluation.js'

const validChoice = {
  answer: { value: 'makan', acceptedValues: ['makan'] },
}
const recognitionQuestion = { answer: { value: true, acceptedValues: [true] } }

describe('answer evaluation', () => {
  it('normalizes Unicode, whitespace, and case for strings', () => {
    expect(normalizeAnswer('  ＴＡＢＥＲＵ ')).toBe('taberu')
  })

  it('accepts normalized answer values and accepted alternatives', () => {
    expect(evaluateAnswer(validChoice, ' MAKAN ')).toBe(true)
    expect(evaluateAnswer({ answer: { value: 'taberu', acceptedValues: ['たべる'] } }, 'たべる')).toBe(true)
  })

  it('compares boolean answers strictly', () => {
    expect(evaluateAnswer(recognitionQuestion, true)).toBe(true)
    expect(evaluateAnswer(recognitionQuestion, 'true')).toBe(false)
  })

  it('rejects incorrect answers', () => {
    expect(evaluateAnswer(validChoice, 'minum')).toBe(false)
  })
})
