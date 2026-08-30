import { describe, expect, it } from 'vitest'

import { sampleFlashcards } from './flashcardGeneration.js'

describe('sampleFlashcards', () => {
  it('selects at most ten unique items without mutating source order', () => {
    const items = Array.from({ length: 12 }, (_, index) => ({ id: `card-${index}` }))
    const original = [...items]

    const selected = sampleFlashcards(items, { rng: () => 0 })

    expect(selected).toHaveLength(10)
    expect(new Set(selected.map(({ id }) => id)).size).toBe(10)
    expect(items).toEqual(original)
  })

  it('returns every item when source contains fewer than requested', () => {
    expect(sampleFlashcards([{ id: 'one' }, { id: 'two' }], { count: 10, rng: () => 0 }))
      .toHaveLength(2)
  })

  it('returns an empty selection when count is not a positive integer', () => {
    expect(sampleFlashcards([{ id: 'one' }], { count: 1.5 })).toEqual([])
    expect(sampleFlashcards([{ id: 'one' }], { count: 0 })).toEqual([])
  })

  it.each([null, {}, []])('returns an empty selection for unusable input %#', (items) => {
    expect(sampleFlashcards(items)).toEqual([])
  })
})
