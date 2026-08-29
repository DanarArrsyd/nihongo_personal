import { describe, expect, it } from 'vitest'

import { getGrammar } from '../../grammar/services/grammarData.js'
import { validateQuestion } from '../services/questionValidation.js'
import { createGrammarQuestion } from './grammarQuizAdapter.js'

const zeroRng = () => 0
const grammar = getGrammar()
const topicItem = grammar.find((item) => item.pattern === '～は')
const otherItem = grammar.find((item) => item.id !== topicItem.id)
const particleDistractors = grammar.filter((item) => ['～も', '～の', '～を'].includes(item.pattern))

describe('Grammar quiz adapter', () => {
  it('creates a false recognition claim from another real Grammar meaning', () => {
    const question = createGrammarQuestion({
      item: topicItem,
      type: 'recognition',
      truthItem: otherItem,
      rng: zeroRng,
    })

    expect(question).toMatchObject({
      type: 'recognition',
      source: { module: 'grammar', itemId: topicItem.id },
      content: { kind: 'pair', primary: '～は', secondary: otherItem.meaning },
      answer: { value: false, acceptedValues: [false] },
    })
    expect(question.options).toEqual([
      { value: false, label: 'Salah' },
      { value: true, label: 'Benar' },
    ])
    expect(validateQuestion(question)).toEqual({ valid: true, errors: [] })
  })

  it('splits the first real particle occurrence and builds real particle options', () => {
    const question = createGrammarQuestion({
      item: topicItem,
      type: 'sentence_completion',
      distractors: particleDistractors,
      rng: zeroRng,
    })

    expect(question).toMatchObject({
      type: 'sentence_completion',
      source: { module: 'grammar', itemId: topicItem.id },
      content: {
        kind: 'sentence',
        before: '私',
        after: 'インドネシア人です。',
        lang: 'ja',
      },
      answer: { value: 'は', acceptedValues: ['は'] },
    })
    expect(new Set(question.options.map((option) => option.value))).toEqual(
      new Set(['は', 'も', 'の', 'を']),
    )
    expect(question.options.every((option) => option.lang === 'ja')).toBe(true)
    expect(validateQuestion(question)).toEqual({ valid: true, errors: [] })
  })

  it('rejects sentence completions that do not identify one simple particle token', () => {
    const ambiguousItem = grammar.find((item) => item.pattern === '～があります／います')
    const missingPrefix = { ...topicItem, id: 'missing-prefix', pattern: 'は' }
    const missingOccurrence = {
      ...topicItem,
      id: 'missing-occurrence',
      examples: [{ japanese: '学生です。' }],
    }

    expect(createGrammarQuestion({
      item: ambiguousItem,
      type: 'sentence_completion',
      distractors: particleDistractors,
      rng: zeroRng,
    })).toBeNull()
    expect(createGrammarQuestion({
      item: missingPrefix,
      type: 'sentence_completion',
      distractors: particleDistractors,
      rng: zeroRng,
    })).toBeNull()
    expect(createGrammarQuestion({
      item: missingOccurrence,
      type: 'sentence_completion',
      distractors: particleDistractors,
      rng: zeroRng,
    })).toBeNull()
  })

  it('removes only the first occurrence of the particle token', () => {
    const repeatedItem = {
      ...topicItem,
      id: 'repeated-particle',
      examples: [{ japanese: '私は猫は好きです。' }],
    }

    expect(createGrammarQuestion({
      item: repeatedItem,
      type: 'sentence_completion',
      distractors: particleDistractors,
      rng: zeroRng,
    }).content).toEqual({
      kind: 'sentence',
      before: '私',
      after: '猫は好きです。',
      lang: 'ja',
    })
  })

  it('returns null for unsupported types or missing records', () => {
    expect(createGrammarQuestion({ item: topicItem, type: 'typing', rng: zeroRng })).toBeNull()
    expect(createGrammarQuestion({ type: 'recognition', rng: zeroRng })).toBeNull()
  })
})
