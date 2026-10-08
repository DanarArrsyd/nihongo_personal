import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { getKanji, getKanjiById, getKanjiExamples, getRelatedVocabulary } from './kanjiData'

describe('kanji data service', () => {
  it('provides 60 structured beginner Kanji', () => {
    const items = getKanji()

    expect(items).toHaveLength(60)
    expect(new Set(items.map((item) => item.id)).size).toBe(60)
    expect(new Set(items.map((item) => item.kanji)).size).toBe(60)
    for (const item of items) {
      expect(item.kanji).toMatch(/^[一-龯]$/u)
      expect(Number.isInteger(item.strokes) && item.strokes > 0).toBe(true)
      expect(item.meaning.length).toBeGreaterThan(0)
      expect(item.onyomi.length + item.kunyomi.length).toBeGreaterThan(0)
      expect(item.onyomi.every((reading) => /^[ァ-ヺー]+$/u.test(reading))).toBe(true)
      expect(item.kunyomi.every((reading) => /^[ぁ-ゖ.ー-]+$/u.test(reading))).toBe(true)
    }
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

  it('preserves all original 20 records for progress, favorites, and backups', () => {
    expect(createHash('sha256').update(JSON.stringify(getKanji().slice(0, 20))).digest('hex'))
      .toBe('a605200f65439f6ff5fbfaee66b998b0c3c51381a44df292ed9db0d15b3daba6')
  })

  it('discovers added words without removing declared connections or creating duplicates', () => {
    expect(getRelatedVocabulary(getKanjiById('n5-kanji-007')).map((item) => item.word))
      .toEqual(['話す', '友達', '電話'])
    expect(getRelatedVocabulary(getKanjiById('n5-kanji-027')).map((item) => item.word))
      .toEqual(['電車', '車', '自転車'])
  })

  it('resolves complete contextual examples for every added character', () => {
    for (const item of getKanji().slice(20)) {
      const examples = getKanjiExamples(item)
      expect(examples.length).toBeGreaterThan(0)
      expect(examples.length).toBeLessThanOrEqual(3)
      for (const example of examples) {
        expect(example.japanese).toContain(item.kanji)
        expect(example.reading.trim().length).toBeGreaterThan(0)
        expect(example.meaning.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('handles absent examples and deduplicates shared vocabulary sentences', () => {
    expect(getKanjiExamples(null)).toEqual([])
    const sentence = { japanese: '山を見ます。', reading: 'やまをみます。', meaning: 'Saya melihat gunung.' }
    const examples = getKanjiExamples({
      kanji: '山', relatedVocabularyIds: [],
      exampleSentences: [sentence, sentence, { japanese: '本です。' }],
    })
    expect(examples.filter((example) => example.japanese === sentence.japanese)).toHaveLength(1)
    expect(examples.every((example) => example.japanese.includes('山'))).toBe(true)
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
