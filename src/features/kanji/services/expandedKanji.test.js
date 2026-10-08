import { describe, expect, it } from 'vitest'
import { createFlashcardDeck } from '../../flashcards/adapters/flashcardDeckAdapter.js'
import { createLibraryCatalog, filterLibraryCatalog } from '../../library/services/libraryCatalog.js'
import { createMixedQuiz } from '../../quiz/adapters/mixedQuizAdapter.js'
import { validateQuiz } from '../../quiz/services/questionValidation.js'
import { createReviewDeck } from '../../review/services/reviewQueue.js'
import { getVocabularyById } from '../../vocabulary/services/vocabularyData.js'
import { getKanji } from './kanjiData.js'

const additions = getKanji().slice(20)

describe('expanded Kanji integration', () => {
  it('resolves every declared vocabulary connection to a word containing the character', () => {
    for (const item of additions) {
      for (const id of item.relatedVocabularyIds) {
        expect(getVocabularyById(id)?.word).toContain(item.kanji)
      }
    }
  })

  it('exposes all additions in Library and their detail routes', () => {
    const catalog = createLibraryCatalog()
    expect(catalog.filter((item) => item.category === 'kanji')).toHaveLength(60)
    for (const item of additions) {
      expect(filterLibraryCatalog(catalog, { category: 'kanji', query: item.kanji }))
        .toEqual(expect.arrayContaining([
          expect.objectContaining({ id: item.id, href: `/learn/kanji/${item.id}` }),
        ]))
    }
  })

  it('includes all 60 characters in flashcards and resolves additions for SRS', () => {
    const deck = createFlashcardDeck({ module: 'kanji', count: 60, rng: () => 0 })
    expect(deck.error).toBeNull()
    expect(deck.cards).toHaveLength(60)
    const cards = createReviewDeck(additions.map((item) => ({ itemType: 'kanji', itemId: item.id })))
    expect(cards).toHaveLength(40)
    cards.forEach((card, index) => {
      expect(card.source.itemId).toBe(additions[index].id)
      expect(card.front.primary.text).toBe(additions[index].kanji)
      expect(card.back.title.text).toBe(additions[index].meaning.join(', '))
    })
  })

  it.each(['typing', 'recognition'])('generates valid 30-question sessions using added Kanji for %s', (type) => {
    const result = createMixedQuiz({
      count: 30, modules: ['kanji'], questionTypes: [type],
      sources: { kanji: additions }, rng: () => 0,
    })
    expect(result.error).toBeNull()
    expect(result.questions).toHaveLength(30)
    expect(validateQuiz(result.questions)).toEqual({ valid: true, errors: [] })
    expect(new Set(result.questions.map((q) => q.source.itemId)).size).toBe(30)
  })
})
