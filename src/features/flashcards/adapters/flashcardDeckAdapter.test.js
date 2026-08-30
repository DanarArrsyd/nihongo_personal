import { describe, expect, it } from 'vitest'

import { createFlashcardDeck, FLASHCARD_MODULES } from './flashcardDeckAdapter.js'

function createVocabularyItem(index) {
  return {
    id: `n5-vocab-${index}`,
    word: `語${index}`,
    reading: `ご${index}`,
    romaji: `go${index}`,
    meaning: `arti ${index}`,
    type: 'noun',
    jlpt: 'N5',
    examples: [{ japanese: `語${index}です。`, reading: `ご${index}です。`, meaning: `Ini arti ${index}.` }],
  }
}

function createKanjiItem(index) {
  return {
    id: `n5-kanji-${index}`,
    kanji: String.fromCodePoint(0x4e00 + index),
    meaning: [`arti ${index}`],
    onyomi: [`オン${index}`],
    kunyomi: [`くん${index}`],
    jlpt: 'N5',
    strokes: index,
    relatedVocabularyIds: [`n5-vocab-${index}`],
  }
}

function createGrammarItem(index) {
  return {
    id: `n5-grammar-${index}`,
    pattern: `～${index}`,
    meaning: `arti grammar ${index}`,
    jlpt: 'N5',
    structure: `Noun + ${index}`,
    explanation: `Penjelasan ${index}.`,
    examples: [{ japanese: `例文${index}。`, reading: `れいぶん${index}。`, meaning: `Contoh ${index}.` }],
    relatedGrammarIds: [],
  }
}

const completeSources = {
  vocabulary: Array.from({ length: 12 }, (_, index) => createVocabularyItem(index + 1)),
  kanji: Array.from({ length: 12 }, (_, index) => createKanjiItem(index + 1)),
  grammar: Array.from({ length: 12 }, (_, index) => createGrammarItem(index + 1)),
}

describe('flashcard deck adapter', () => {
  it('exports the supported modules', () => {
    expect(FLASHCARD_MODULES).toEqual(['vocabulary', 'kanji', 'grammar'])
  })

  it.each(['vocabulary', 'kanji', 'grammar'])('builds a valid unique %s deck', (module) => {
    const result = createFlashcardDeck({
      module,
      rng: () => 0,
      sources: completeSources,
    })

    expect(result.error).toBeNull()
    expect(result.cards).toHaveLength(10)
    expect(new Set(result.cards.map(({ id }) => id)).size).toBe(10)
    expect(result.cards.every((card) => card.source.module === module)).toBe(true)
  })

  it('uses the module data service when sources are omitted', () => {
    const result = createFlashcardDeck({ module: 'vocabulary', rng: () => 0 })

    expect(result.error).toBeNull()
    expect(result.cards).toHaveLength(10)
    expect(result.cards.every((card) => card.source.module === 'vocabulary')).toBe(true)
  })

  it('rejects an unknown module', () => {
    expect(createFlashcardDeck({ module: 'kana', sources: completeSources }))
      .toEqual({ cards: [], error: 'unknown-module' })
  })

  it('rejects an empty or fully malformed source', () => {
    expect(createFlashcardDeck({ module: 'grammar', sources: { grammar: [] } }))
      .toEqual({ cards: [], error: 'unavailable' })
    expect(createFlashcardDeck({
      module: 'grammar',
      sources: { grammar: [{ id: 'broken', pattern: '', meaning: '' }] },
    })).toEqual({ cards: [], error: 'unavailable' })
  })

  it('rejects selected cards with duplicate normalized identities', () => {
    expect(createFlashcardDeck({
      module: 'vocabulary',
      count: 10,
      rng: () => 0,
      sources: { vocabulary: Array.from({ length: 10 }, () => createVocabularyItem(1)) },
    })).toEqual({ cards: [], error: 'unavailable' })
  })
})
