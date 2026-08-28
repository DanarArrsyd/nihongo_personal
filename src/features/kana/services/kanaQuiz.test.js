import { describe, expect, it } from 'vitest'
import { checkKanaAnswer, createKanaQuestion } from './kanaQuiz'

const item = { id: 'a', character: 'あ', romaji: 'a' }
const distractors = [
  { id: 'i', character: 'い', romaji: 'i' },
  { id: 'u', character: 'う', romaji: 'u' },
]

describe('Kana quiz service', () => {
  it('creates recognition questions from Kana to romaji', () => {
    expect(createKanaQuestion({ item, mode: 'recognition', distractors })).toEqual({
      type: 'multiple_choice',
      mode: 'recognition',
      prompt: 'あ',
      answer: 'a',
      options: ['a', 'i', 'u'],
    })
  })

  it('creates reverse questions from romaji to Kana', () => {
    expect(createKanaQuestion({ item, mode: 'reverse', distractors })).toEqual({
      type: 'multiple_choice',
      mode: 'reverse',
      prompt: 'a',
      answer: 'あ',
      options: ['あ', 'い', 'う'],
    })
  })

  it('creates typing questions without choices', () => {
    expect(createKanaQuestion({ item, mode: 'typing', distractors })).toEqual({
      type: 'typing',
      mode: 'typing',
      prompt: 'あ',
      answer: 'a',
      options: [],
    })
  })

  it('normalizes latin answers but keeps wrong answers false', () => {
    const question = createKanaQuestion({ item, mode: 'typing', distractors })

    expect(checkKanaAnswer(question, ' A ')).toBe(true)
    expect(checkKanaAnswer(question, 'i')).toBe(false)
  })

  it('rejects unsupported practice modes', () => {
    expect(() => createKanaQuestion({ item, mode: 'matching', distractors })).toThrow(
      'Unsupported Kana practice mode: matching',
    )
  })
})
