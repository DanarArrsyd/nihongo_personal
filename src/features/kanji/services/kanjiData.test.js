import { describe, expect, it } from 'vitest'
import { getKanji, getKanjiById, getRelatedVocabulary } from './kanjiData'

describe('kanji data service', () => {
  it('provides 20 structured beginner Kanji', () => {
    const items = getKanji()

    expect(items).toHaveLength(20)
    expect(items[0]).toEqual({
      id: 'n5-kanji-001',
      kanji: '食',
      meaning: ['makan', 'makanan'],
      onyomi: ['ショク'],
      kunyomi: ['た.べる'],
      jlpt: 'N5',
      strokes: 9,
      relatedVocabularyIds: ['n5-vocab-001', 'n5-vocab-018'],
    })
  })

  it('returns a Kanji by ID and null for an unknown ID', () => {
    expect(getKanjiById('n5-kanji-012')?.kanji).toBe('校')
    expect(getKanjiById('not-real')).toBeNull()
  })

  it('resolves related vocabulary in declared order', () => {
    expect(getRelatedVocabulary(getKanjiById('n5-kanji-001')).map((item) => item.word)).toEqual([
      '食べる',
      'ご飯',
    ])
  })

  it('ignores stale vocabulary IDs and empty Kanji input', () => {
    expect(
      getRelatedVocabulary({ relatedVocabularyIds: ['not-real', 'n5-vocab-017'] }).map(
        (item) => item.word,
      ),
    ).toEqual(['水'])
    expect(getRelatedVocabulary(null)).toEqual([])
  })
})
