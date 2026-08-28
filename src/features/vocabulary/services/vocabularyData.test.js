import { describe, expect, it } from 'vitest'
import {
  filterVocabulary,
  getVocabulary,
  getVocabularyById,
  getVocabularyTypes,
} from './vocabularyData'

describe('vocabulary data service', () => {
  it('provides 30 structured N5 entries', () => {
    const items = getVocabulary()

    expect(items).toHaveLength(30)
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

    expect(results).toHaveLength(4)
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
