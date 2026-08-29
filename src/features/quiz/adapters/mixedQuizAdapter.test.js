import { describe, expect, it } from 'vitest'

import { getGrammar } from '../../grammar/services/grammarData.js'
import { getAllKana } from '../../kana/services/kanaData.js'
import { getKanji } from '../../kanji/services/kanjiData.js'
import { getVocabulary } from '../../vocabulary/services/vocabularyData.js'
import { validateQuiz } from '../services/questionValidation.js'
import { createMixedQuiz } from './mixedQuizAdapter.js'

const zeroRng = () => 0

function countBy(items, selectKey) {
  return items.reduce((counts, item) => ({
    ...counts,
    [selectKey(item)]: (counts[selectKey(item)] ?? 0) + 1,
  }), {})
}

function createCustomSources() {
  const kanaItems = (prefix, characters) => characters.map((character, index) => ({
    id: `${prefix}-${index + 1}`,
    character,
    romaji: `${prefix}romaji${index + 1}`,
  }))
  const vocabulary = Array.from({ length: 6 }, (_, index) => ({
    id: `custom-vocabulary-${index + 1}`,
    word: `単語${index + 1}`,
    reading: `たんご${index + 1}`,
    romaji: `tango${index + 1}`,
    meaning: `arti ${index + 1}`,
  }))
  const kanji = Array.from({ length: 3 }, (_, index) => ({
    id: `custom-kanji-${index + 1}`,
    kanji: `字${index + 1}`,
    meaning: [`makna ${index + 1}`],
    onyomi: [`オン${index + 1}`],
    kunyomi: [`くん.${index + 1}`],
  }))
  const grammarTokens = ['は', 'も', 'の', 'を', 'に']
  const grammar = grammarTokens.map((token, index) => ({
    id: `custom-grammar-${index + 1}`,
    pattern: `～${token}`,
    meaning: `fungsi ${index + 1}`,
    examples: [{ japanese: `私${token}学生です。` }],
  }))

  return {
    kana: {
      hiragana: kanaItems('custom-hiragana', ['あ', 'い', 'う', 'え']),
      katakana: kanaItems('custom-katakana', ['ア', 'イ', 'ウ', 'エ']),
    },
    vocabulary,
    kanji,
    grammar,
  }
}

describe('Mixed quiz adapter', () => {
  it('creates the exact balanced ten-question blueprint', () => {
    const result = createMixedQuiz({ rng: zeroRng })

    expect(result.error).toBeNull()
    expect(result.questions).toHaveLength(10)
    expect(new Set(result.questions.map((question) => question.id)).size).toBe(10)
    expect(countBy(result.questions, (question) => question.type)).toEqual({
      multiple_choice: 2,
      reverse_multiple_choice: 2,
      typing: 2,
      recognition: 2,
      sentence_completion: 2,
    })
    expect(countBy(result.questions, (question) => question.source.module)).toEqual({
      kana: 2,
      vocabulary: 3,
      kanji: 2,
      grammar: 3,
    })
    expect(new Set(result.questions.map((question) => question.source.module)))
      .toEqual(new Set(['kana', 'vocabulary', 'kanji', 'grammar']))
    expect(result.questions.every((question) => (
      question.id.startsWith(`mixed-${question.source.module}-${question.source.itemId}-${question.type}-`)
    ))).toBe(true)
    expect(validateQuiz(result.questions)).toEqual({ valid: true, errors: [] })
  })

  it('uses real source content for prompts, pair claims, and distractors', () => {
    const sources = {
      kana: { hiragana: getAllKana('hiragana'), katakana: getAllKana('katakana') },
      vocabulary: getVocabulary(),
      kanji: getKanji(),
      grammar: getGrammar(),
    }
    const { questions } = createMixedQuiz({ rng: zeroRng, sources })

    questions.forEach((question) => {
      if (question.source.module === 'kana') {
        const [script, itemId] = question.source.itemId.split(':')
        const sourceItem = sources.kana[script].find((item) => item.id === itemId)
        const allowedValues = new Set(sources.kana[script].map((item) => (
          question.type === 'multiple_choice' ? item.romaji : item.character
        )))

        expect(sourceItem).toBeDefined()
        expect(question.options.every((option) => allowedValues.has(option.value))).toBe(true)
      }

      if (question.source.module === 'vocabulary') {
        const allowedValues = new Set(sources.vocabulary.map((item) => (
          question.type === 'multiple_choice' ? item.meaning : item.word
        )))

        if (question.options) {
          expect(question.options.every((option) => allowedValues.has(option.value))).toBe(true)
        }
      }

      if (question.source.module === 'kanji' && question.type === 'recognition') {
        expect(sources.kanji.some((item) => item.meaning[0] === question.content.secondary)).toBe(true)
      }

      if (question.source.module === 'grammar' && question.type === 'recognition') {
        expect(sources.grammar.some((item) => item.meaning === question.content.secondary)).toBe(true)
      }

      if (question.type === 'sentence_completion') {
        const tokens = new Set(sources.grammar.map((item) => item.pattern.slice(1)))
        expect(question.options.every((option) => tokens.has(option.value))).toBe(true)
      }
    })
  })

  it('is deterministic and uses only records from the injected sources seam', () => {
    const sources = createCustomSources()
    const first = createMixedQuiz({ rng: zeroRng, sources })
    const second = createMixedQuiz({ rng: zeroRng, sources })
    const allowedItemIds = new Set([
      ...sources.kana.hiragana.map((item) => `hiragana:${item.id}`),
      ...sources.kana.katakana.map((item) => `katakana:${item.id}`),
      ...sources.vocabulary.map((item) => item.id),
      ...sources.kanji.map((item) => item.id),
      ...sources.grammar.map((item) => item.id),
    ])

    expect(first).toEqual(second)
    expect(first.error).toBeNull()
    expect(first.questions).toHaveLength(10)
    expect(first.questions.every((question) => allowedItemIds.has(question.source.itemId))).toBe(true)
    expect(validateQuiz(first.questions)).toEqual({ valid: true, errors: [] })
  })

  it('returns the unavailable result when an injected pool cannot fill every slot', () => {
    const sources = createCustomSources()
    sources.grammar = sources.grammar.slice(0, 1)

    expect(createMixedQuiz({ rng: zeroRng, sources })).toEqual({
      questions: [],
      error: 'Quiz belum tersedia.',
    })
  })
})
