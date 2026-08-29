import { describe, expect, it } from 'vitest'

import { validateQuiz } from '../services/questionValidation.js'
import { createKanaQuiz } from './kanaQuizAdapter.js'

const zeroRng = () => 0

function seededRng(seed) {
  let state = seed

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

describe('Kana quiz adapter', () => {
  it.each(['hiragana', 'katakana'])('creates ten unique valid %s questions', (script) => {
    const questions = createKanaQuiz({ script, mode: 'recognition', rng: zeroRng })

    expect(questions).toHaveLength(10)
    expect(new Set(questions.map((question) => question.id)).size).toBe(10)
    expect(new Set(questions.map((question) => question.source.itemId)).size).toBe(10)
    expect(validateQuiz(questions)).toEqual({ valid: true, errors: [] })
  })

  it('maps each Kana practice mode to its shared quiz question type', () => {
    expect(createKanaQuiz({ script: 'hiragana', mode: 'recognition', rng: zeroRng }).every(
      (question) => question.type === 'multiple_choice',
    )).toBe(true)
    expect(createKanaQuiz({ script: 'hiragana', mode: 'reverse', rng: zeroRng })[0].type)
      .toBe('reverse_multiple_choice')
    expect(createKanaQuiz({ script: 'katakana', mode: 'typing', rng: zeroRng })[0].type)
      .toBe('typing')
  })

  it('maps prompts, options, and associated item IDs in each direction', () => {
    const recognition = createKanaQuiz({ script: 'hiragana', mode: 'recognition', count: 1, rng: zeroRng })[0]
    const reverse = createKanaQuiz({ script: 'katakana', mode: 'reverse', count: 1, rng: zeroRng })[0]
    const typing = createKanaQuiz({ script: 'hiragana', mode: 'typing', count: 1, rng: zeroRng })[0]

    expect(recognition).toMatchObject({
      source: { module: 'kana', itemId: 'hiragana:i' },
      content: { kind: 'text', text: 'い', lang: 'ja' },
      answer: { value: 'i', acceptedValues: ['i'] },
    })
    expect(recognition.options.every((option) => option.lang === undefined)).toBe(true)
    expect(reverse).toMatchObject({
      source: { module: 'kana', itemId: 'katakana:i' },
      content: { kind: 'text', text: 'i' },
      answer: { value: 'イ', acceptedValues: ['イ'] },
    })
    expect(reverse.options.every((option) => option.lang === 'ja')).toBe(true)
    expect(typing).toMatchObject({
      source: { module: 'kana', itemId: 'hiragana:i' },
      content: { kind: 'text', text: 'い', lang: 'ja' },
      answer: { value: 'i', acceptedValues: ['i'] },
    })
    expect(typing.options).toBeUndefined()
  })

  it('returns no questions for unsupported scripts, modes, or insufficient pools', () => {
    expect(createKanaQuiz({ script: 'invalid', mode: 'typing', rng: zeroRng })).toEqual([])
    expect(createKanaQuiz({ script: 'hiragana', mode: 'invalid', rng: zeroRng })).toEqual([])
    expect(createKanaQuiz({ script: 'hiragana', mode: 'typing', count: 1000, rng: zeroRng })).toEqual([])
  })

  it('uses supplied source items while preserving the default data source', () => {
    const items = [
      { id: 'custom-a', character: '亜', romaji: 'custom-a' },
      { id: 'custom-i', character: '伊', romaji: 'custom-i' },
      { id: 'custom-u', character: '宇', romaji: 'custom-u' },
      { id: 'custom-e', character: '江', romaji: 'custom-e' },
    ]
    const customQuestion = createKanaQuiz({
      script: 'hiragana',
      mode: 'recognition',
      count: 1,
      rng: zeroRng,
      items,
    })[0]
    const defaultQuestion = createKanaQuiz({
      script: 'hiragana',
      mode: 'recognition',
      count: 1,
      rng: zeroRng,
    })[0]

    expect(customQuestion.source.itemId).toBe('hiragana:custom-i')
    expect(customQuestion.options.every((option) => (
      items.some((item) => item.romaji === option.value)
    ))).toBe(true)
    expect(defaultQuestion.source.itemId).toBe('hiragana:i')
  })

  it('keeps ten recognition questions when a seeded run selects duplicate-romaji distractors', () => {
    const questions = createKanaQuiz({ script: 'hiragana', mode: 'recognition', rng: seededRng(424) })

    expect(questions).toHaveLength(10)
    expect(questions.every((question) => question.options.length === 4)).toBe(true)
    expect(questions.every((question) => (
      new Set(question.options.map((option) => option.value)).size === 4
    ))).toBe(true)
  })
})
