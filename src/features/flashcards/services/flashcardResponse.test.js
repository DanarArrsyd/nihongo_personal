import { describe, expect, it } from 'vitest'

import { createFlashcardResponse } from './flashcardResponse.js'

const card = {
  id: 'card-one',
  source: { module: 'vocabulary', itemId: 'vocab-one' },
}

describe('createFlashcardResponse', () => {
  it('creates an immutable deterministic rating record', () => {
    const response = createFlashcardResponse({
      card,
      rating: 'good',
      now: () => new Date('2026-08-30T12:00:00.000Z'),
    })

    expect(response).toEqual({
      cardId: 'card-one',
      rating: 'good',
      timestamp: '2026-08-30T12:00:00.000Z',
      associatedItem: { module: 'vocabulary', itemId: 'vocab-one' },
    })
    expect(response.associatedItem).not.toBe(card.source)
    expect(Object.isFrozen(response)).toBe(true)
    expect(Object.isFrozen(response.associatedItem)).toBe(true)
  })
})
