import { describe, expect, it } from 'vitest'

import { getKanji } from '../../kanji/services/kanjiData.js'
import { validateQuestion } from '../services/questionValidation.js'
import { createKanjiQuestion } from './kanjiQuizAdapter.js'

const zeroRng = () => 0
const [item, truthItem, ...distractors] = getKanji()

describe('Kanji quiz adapter', () => {
  it('accepts on readings and dot-free kun readings for typing', () => {
    const question = createKanjiQuestion({ item, type: 'typing', distractors, rng: zeroRng })

    expect(question).toMatchObject({
      type: 'typing',
      source: { module: 'kanji', itemId: item.id },
      content: { kind: 'text', text: item.kanji, lang: 'ja' },
      answer: {
        value: item.onyomi[0],
        acceptedValues: [...item.onyomi, ...item.kunyomi.map((reading) => reading.replaceAll('.', ''))],
      },
    })
    expect(question.options).toBeUndefined()
    expect(validateQuestion(question)).toEqual({ valid: true, errors: [] })
  })

  it('creates a false recognition claim with another Kanji primary meaning', () => {
    const question = createKanjiQuestion({
      item,
      type: 'recognition',
      distractors,
      truthItem,
      rng: zeroRng,
    })

    expect(question).toMatchObject({
      type: 'recognition',
      source: { module: 'kanji', itemId: item.id },
      content: { kind: 'pair', primary: item.kanji, secondary: truthItem.meaning[0] },
      answer: { value: false, acceptedValues: [false] },
    })
    expect(question.options).toEqual([
      { value: false, label: 'Salah' },
      { value: true, label: 'Benar' },
    ])
    expect(validateQuestion(question)).toEqual({ valid: true, errors: [] })
  })

  it('uses the item primary meaning for true recognition claims', () => {
    const question = createKanjiQuestion({ item, type: 'recognition', distractors, rng: zeroRng })

    expect(question).toMatchObject({
      content: { kind: 'pair', primary: item.kanji, secondary: item.meaning[0] },
      answer: { value: true, acceptedValues: [true] },
    })
  })

  it('returns null for unsupported types or missing records', () => {
    expect(createKanjiQuestion({ item, type: 'multiple_choice', distractors, rng: zeroRng })).toBeNull()
    expect(createKanjiQuestion({ type: 'typing', distractors, rng: zeroRng })).toBeNull()
  })
})
