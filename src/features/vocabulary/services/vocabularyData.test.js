import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import {
  filterVocabulary,
  getVocabulary,
  getVocabularyById,
  getVocabularyTypes,
} from './vocabularyData'

describe('vocabulary data service', () => {
  it('preserves all original 30 entries for existing progress and backups', () => {
    const originalEntries = getVocabulary().slice(0, 30)
    expect(createHash('sha256').update(JSON.stringify(originalEntries)).digest('hex'))
      .toBe('5631cd7e572ba68b5f2e22554439a72c91b630a65921d2fb44d1f356cf2c9d8c')
  })

  it('provides 100 complete, uniquely identified N5 entries', () => {
    const items = getVocabulary()

    expect(items).toHaveLength(100)
    expect(new Set(items.map((item) => item.id)).size).toBe(100)
    expect(new Set(items.map((item) => item.word)).size).toBe(100)
    for (const item of items) {
      for (const field of ['word', 'reading', 'romaji', 'meaning', 'type']) {
        expect(item[field].trim().length).toBeGreaterThan(0)
      }
      expect(item.jlpt).toBe('N5')
      expect(item.reading).toMatch(/^[ぁ-ゖァ-ヺー]+$/u)
      expect(item.examples[0].japanese).toMatch(/[ぁ-ゖァ-ヺ一-龯]/u)
      for (const value of Object.values(item.examples[0])) {
        expect(value.trim().length).toBeGreaterThan(0)
      }
    }
    expect(items[0]).toMatchObject({
      id: 'n5-vocab-001',
      word: '食べる',
      reading: 'たべる',
      romaji: 'taberu',
      meaning: 'makan',
      type: 'verb',
      jlpt: 'N5',
    })
    expect(items.every((item) => item.examples.length === 1)).toBe(true)
  })

  it('returns an item by ID and null for unknown IDs', () => {
    expect(getVocabularyById('n5-vocab-011')?.word).toBe('学校')
    expect(getVocabularyById('not-real')).toBeNull()
  })

  it.each(['食べ', 'たべ', 'TABERU', 'makan'])(
    'searches Japanese, reading, romaji, or meaning with %s',
    (query) => {
      const results = filterVocabulary(
        getVocabulary(),
        { query, type: 'all', status: 'all' },
        () => 'new',
      )

      expect(results.map((item) => item.id)).toContain('n5-vocab-001')
    },
  )

  it('filters word type', () => {
    const results = filterVocabulary(
      getVocabulary(),
      { query: '', type: 'adjective', status: 'all' },
      () => 'new',
    )

    expect(results).toHaveLength(16)
    expect(results.every((item) => item.type === 'adjective')).toBe(true)
  })

  it('combines type and session status filters', () => {
    const results = filterVocabulary(
      getVocabulary(),
      { query: '', type: 'verb', status: 'learning' },
      (id) => (id === 'n5-vocab-001' ? 'learning' : 'new'),
    )

    expect(results.map((item) => item.id)).toEqual(['n5-vocab-001'])
  })

  it('returns sorted unique word types', () => {
    expect(getVocabularyTypes(getVocabulary())).toEqual([
      'adjectival noun',
      'adjective',
      'noun',
      'verb',
    ])
  })
})
