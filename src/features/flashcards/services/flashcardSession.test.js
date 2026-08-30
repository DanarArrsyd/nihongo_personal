import { describe, expect, it } from 'vitest'

import { createFlashcardResponse } from './flashcardResponse.js'
import {
  createFlashcardState,
  flashcardSessionReducer,
  getCurrentCard,
  getFlashcardProgress,
  getRatingCounts,
} from './flashcardSession.js'

const cards = [
  { id: 'card-one', source: { module: 'vocabulary', itemId: 'vocab-one' } },
  { id: 'card-two', source: { module: 'vocabulary', itemId: 'vocab-two' } },
]

function rateCurrent(state, rating) {
  const card = getCurrentCard(state)
  const revealed = flashcardSessionReducer(state, { type: 'REVEAL' })
  const response = createFlashcardResponse({
    card,
    rating,
    now: () => new Date('2026-08-30T12:00:00.000Z'),
  })

  return flashcardSessionReducer(revealed, { type: 'RATE', response })
}

describe('flashcard session', () => {
  it('creates an active hidden session at the first card', () => {
    const state = createFlashcardState(cards)

    expect(state).toEqual({
      cards,
      currentIndex: 0,
      revealed: false,
      responses: [],
      status: 'active',
    })
    expect(getCurrentCard(state)).toBe(cards[0])
  })

  it('reveals the current card once', () => {
    const initial = createFlashcardState(cards)
    const revealed = flashcardSessionReducer(initial, { type: 'REVEAL' })

    expect(revealed).toEqual({ ...initial, revealed: true })
    expect(flashcardSessionReducer(revealed, { type: 'REVEAL' })).toBe(revealed)
  })

  it('ignores rating until the current card is revealed', () => {
    const state = createFlashcardState(cards)
    const response = createFlashcardResponse({ card: cards[0], rating: 'good' })

    expect(flashcardSessionReducer(state, { type: 'RATE', response })).toBe(state)
  })

  it('records one revealed rating and advances hidden to the next card', () => {
    const revealed = flashcardSessionReducer(createFlashcardState(cards), { type: 'REVEAL' })
    const response = createFlashcardResponse({ card: cards[0], rating: 'hard' })
    const next = flashcardSessionReducer(revealed, { type: 'RATE', response })

    expect(next.currentIndex).toBe(1)
    expect(next.revealed).toBe(false)
    expect(next.responses).toEqual([response])
    expect(next.status).toBe('active')
  })

  it('rejects unsupported, wrong-card, and duplicate ratings', () => {
    const revealed = flashcardSessionReducer(createFlashcardState(cards), { type: 'REVEAL' })
    const invalidRating = { cardId: 'card-one', rating: 'unknown' }
    const wrongCard = { cardId: 'card-two', rating: 'good' }
    const recorded = createFlashcardResponse({ card: cards[0], rating: 'good' })
    const duplicate = { ...revealed, responses: [recorded] }

    expect(flashcardSessionReducer(revealed, { type: 'RATE', response: invalidRating })).toBe(revealed)
    expect(flashcardSessionReducer(revealed, { type: 'RATE', response: wrongCard })).toBe(revealed)
    expect(flashcardSessionReducer(duplicate, { type: 'RATE', response: recorded })).toBe(duplicate)
  })

  it('completes after the final rating and derives exact counts', () => {
    const afterHard = rateCurrent(createFlashcardState(cards), 'hard')
    const completed = rateCurrent(afterHard, 'good')

    expect(completed.status).toBe('completed')
    expect(completed.revealed).toBe(false)
    expect(getCurrentCard(completed)).toBeNull()
    expect(getRatingCounts(completed)).toEqual({ again: 0, hard: 1, good: 1, easy: 0 })
  })

  it('derives current position progress without storing it in state', () => {
    const initial = createFlashcardState(cards)
    const afterFirst = rateCurrent(initial, 'again')
    const completed = rateCurrent(afterFirst, 'easy')

    expect(getFlashcardProgress(initial)).toEqual({ current: 1, total: 2, percentage: 50 })
    expect(getFlashcardProgress(afterFirst)).toEqual({ current: 2, total: 2, percentage: 100 })
    expect(getFlashcardProgress(completed)).toEqual({ current: 2, total: 2, percentage: 100 })
  })

  it('handles an empty card set without a current card or progress', () => {
    const state = createFlashcardState([])

    expect(getCurrentCard(state)).toBeNull()
    expect(getFlashcardProgress(state)).toEqual({ current: 0, total: 0, percentage: 0 })
    expect(getRatingCounts(state)).toEqual({ again: 0, hard: 0, good: 0, easy: 0 })
    expect(flashcardSessionReducer(state, { type: 'REVEAL' })).toBe(state)
  })

  it('restarts with replacement cards and clears prior responses', () => {
    const completed = rateCurrent(rateCurrent(createFlashcardState(cards), 'hard'), 'good')
    const replacement = [{ id: 'card-three', source: { module: 'grammar', itemId: 'grammar-three' } }]

    expect(flashcardSessionReducer(completed, { type: 'RESTART', cards: replacement })).toEqual({
      cards: replacement,
      currentIndex: 0,
      revealed: false,
      responses: [],
      status: 'active',
    })
  })
})
