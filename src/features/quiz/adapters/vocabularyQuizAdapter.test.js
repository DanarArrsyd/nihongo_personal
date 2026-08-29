import { describe, expect, it } from 'vitest'

import { getVocabulary } from '../../vocabulary/services/vocabularyData.js'
import { validateQuestion } from '../services/questionValidation.js'
import { createVocabularyQuestion } from './vocabularyQuizAdapter.js'

const zeroRng = () => 0
const [item, truthItem, ...distractors] = getVocabulary()

describe('Vocabulary quiz adapter', () => {
  it('maps a word to its meaning with unique real options', () => {
    const question = createVocabularyQuestion({
      item,
      type: 'multiple_choice',
      distractors: distractors.slice(0, 3),
      rng: zeroRng,
    })

    expect(question).toMatchObject({
      type: 'multiple_choice',
      source: { module: 'vocabulary', itemId: item.id },
      content: { kind: 'text', text: item.word, lang: 'ja' },
      answer: { value: item.meaning, acceptedValues: [item.meaning] },
    })
    expect(question.options.map((option) => option.value).sort()).toEqual([
      item.meaning,
      ...distractors.slice(0, 3).map((candidate) => candidate.meaning),
    ].sort())
    expect(new Set(question.options.map((option) => option.value)).size).toBe(4)
    expect(validateQuestion(question)).toEqual({ valid: true, errors: [] })
  })

  it('maps a meaning back to its Japanese word', () => {
    const question = createVocabularyQuestion({
      item,
      type: 'reverse_multiple_choice',
      distractors: distractors.slice(0, 3),
      rng: zeroRng,
    })

    expect(question).toMatchObject({
      type: 'reverse_multiple_choice',
      source: { module: 'vocabulary', itemId: item.id },
      content: { kind: 'text', text: item.meaning },
      answer: { value: item.word, acceptedValues: [item.word] },
    })
    expect(question.options.map((option) => option.value).sort()).toEqual([
      item.word,
      ...distractors.slice(0, 3).map((candidate) => candidate.word),
    ].sort())
    expect(question.options.every((option) => option.lang === 'ja')).toBe(true)
  })

  it('accepts both kana and romaji for typing answers', () => {
    const question = createVocabularyQuestion({ item, type: 'typing', distractors, rng: zeroRng })

    expect(question).toMatchObject({
      type: 'typing',
      source: { module: 'vocabulary', itemId: item.id },
      content: { kind: 'text', text: item.word, lang: 'ja' },
      answer: { value: item.reading, acceptedValues: [item.reading, item.romaji] },
    })
    expect(question.options).toBeUndefined()
    expect(validateQuestion(question)).toEqual({ valid: true, errors: [] })
  })

  it('creates a false recognition claim using another real vocabulary record', () => {
    const question = createVocabularyQuestion({
      item,
      type: 'recognition',
      distractors,
      truthItem,
      rng: zeroRng,
    })

    expect(question).toMatchObject({
      type: 'recognition',
      source: { module: 'vocabulary', itemId: item.id },
      content: { kind: 'pair', primary: item.word, secondary: truthItem.meaning },
      answer: { value: false, acceptedValues: [false] },
    })
    expect(question.options).toEqual([
      { value: false, label: 'Salah' },
      { value: true, label: 'Benar' },
    ])
    expect(validateQuestion(question)).toEqual({ valid: true, errors: [] })
  })

  it('returns null for unsupported types or missing records', () => {
    expect(createVocabularyQuestion({ item, type: 'matching', distractors, rng: zeroRng })).toBeNull()
    expect(createVocabularyQuestion({ type: 'typing', distractors, rng: zeroRng })).toBeNull()
  })
})
