import { createReviewDeck, summarizeReviews } from './reviewQueue.js'

describe('review queue', () => {
  it('summarizes due records by supported module', () => {
    expect(summarizeReviews([
      { itemType: 'vocabulary' },
      { itemType: 'vocabulary' },
      { itemType: 'kanji' },
      { itemType: 'grammar' },
    ])).toEqual({ total: 4, vocabulary: 2, kanji: 1, grammar: 1, kana: 0 })
  })

  it('maps persisted review records to ordered learning cards', () => {
    const cards = createReviewDeck([
      { itemType: 'vocabulary', itemId: 'n5-vocab-001' },
      { itemType: 'kanji', itemId: 'n5-kanji-001' },
      { itemType: 'grammar', itemId: 'n5-grammar-001' },
      { itemType: 'kana', itemId: 'hiragana:a' },
    ])

    expect(cards.map((card) => card.source)).toEqual([
      { module: 'vocabulary', itemId: 'n5-vocab-001' },
      { module: 'kanji', itemId: 'n5-kanji-001' },
      { module: 'grammar', itemId: 'n5-grammar-001' },
      { module: 'kana', itemId: 'hiragana:a' },
    ])
  })

  it('ignores stale and unsupported review records', () => {
    expect(createReviewDeck([
      { itemType: 'vocabulary', itemId: 'missing' },
      { itemType: 'kana', itemId: 'hiragana:missing' },
    ])).toEqual([])
  })
})
