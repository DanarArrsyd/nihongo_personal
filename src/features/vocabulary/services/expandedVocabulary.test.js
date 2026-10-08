import { describe, expect, it } from 'vitest'
import { createFlashcardDeck } from '../../flashcards/adapters/flashcardDeckAdapter.js'
import { createLibraryCatalog, filterLibraryCatalog } from '../../library/services/libraryCatalog.js'
import { createMixedQuiz } from '../../quiz/adapters/mixedQuizAdapter.js'
import { validateQuiz } from '../../quiz/services/questionValidation.js'
import { createReviewDeck } from '../../review/services/reviewQueue.js'
import { getVocabulary } from './vocabularyData.js'

const additions = getVocabulary().slice(30)

describe('expanded vocabulary integration', () => {
  it('exposes every added word in Library search and its detail route', () => {
    const catalog = createLibraryCatalog()
    expect(catalog.filter((item) => item.category === 'vocabulary')).toHaveLength(100)
    for (const item of additions) {
      const results = filterLibraryCatalog(catalog, { category: 'vocabulary', query: item.word })
      expect(results).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: item.id, href: `/learn/vocabulary/${item.id}` }),
      ]))
    }
  })

  it('includes all 100 words in flashcards and resolves all additions for SRS', () => {
    const deck = createFlashcardDeck({ module: 'vocabulary', count: 100, rng: () => 0 })
    expect(deck.error).toBeNull()
    expect(deck.cards).toHaveLength(100)
    const reviews = additions.map((item) => ({ itemType: 'vocabulary', itemId: item.id }))
    const cards = createReviewDeck(reviews)
    expect(cards).toHaveLength(70)
    expect(cards.map((card) => card.source.itemId)).toEqual(additions.map((item) => item.id))
    cards.forEach((card, index) => {
      expect(card.front.primary.text).toBe(additions[index].word)
      expect(card.back.title.text).toBe(additions[index].reading)
      expect(card.back.meaning).toBe(additions[index].meaning)
      expect(card.back.example).toEqual(additions[index].examples[0])
    })
  })

  it.each(['multiple_choice', 'reverse_multiple_choice', 'typing', 'recognition'])(
    'generates 30 valid questions from additions alone using %s',
    (type) => {
      const result = createMixedQuiz({
        count: 30,
        modules: ['vocabulary'],
        questionTypes: [type],
        sources: { vocabulary: additions },
        rng: () => 0,
      })
      expect(result.error).toBeNull()
      expect(result.questions).toHaveLength(30)
      expect(validateQuiz(result.questions)).toEqual({ valid: true, errors: [] })
      const addedIds = new Set(additions.map((item) => item.id))
      expect(result.questions.every((q) => addedIds.has(q.source.itemId))).toBe(true)
      expect(new Set(result.questions.map((q) => q.source.itemId)).size).toBe(30)
    },
  )
})
