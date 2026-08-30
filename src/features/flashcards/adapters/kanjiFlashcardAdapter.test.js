import { describe, expect, it } from 'vitest'

import { createKanjiFlashcard } from './kanjiFlashcardAdapter.js'

const kanjiFixture = {
  id: 'n5-kanji-001',
  kanji: '食',
  meaning: ['makan', 'makanan'],
  onyomi: ['ショク'],
  kunyomi: ['た.べる'],
  jlpt: 'N5',
  strokes: 9,
  relatedVocabularyIds: ['n5-vocab-001', 'n5-vocab-018'],
}

describe('createKanjiFlashcard', () => {
  it('maps meanings, readings, stroke count, and level', () => {
    expect(createKanjiFlashcard(kanjiFixture)).toEqual({
      id: 'flashcard-kanji-n5-kanji-001',
      source: { module: 'kanji', itemId: 'n5-kanji-001' },
      front: {
        eyebrow: 'Kanji',
        primary: { text: '食', lang: 'ja' },
        hint: 'Ingat arti dan bacaannya.',
      },
      back: {
        title: { text: 'makan, makanan' },
        details: [
          { label: "On'yomi", value: { text: 'ショク', lang: 'ja' } },
          { label: "Kun'yomi", value: { text: 'た.べる', lang: 'ja' } },
          { label: 'Jumlah goresan', value: { text: '9' } },
          { label: 'JLPT', value: { text: 'N5' } },
        ],
      },
    })
  })

  it('returns null when identity or primary content is missing', () => {
    expect(createKanjiFlashcard({ ...kanjiFixture, id: '' })).toBeNull()
    expect(createKanjiFlashcard({ ...kanjiFixture, meaning: [] })).toBeNull()
  })

  it('omits blank optional reading and metadata rows', () => {
    expect(createKanjiFlashcard({
      ...kanjiFixture,
      onyomi: [],
      kunyomi: [],
      strokes: null,
      jlpt: '',
    })).toEqual({
      id: 'flashcard-kanji-n5-kanji-001',
      source: { module: 'kanji', itemId: 'n5-kanji-001' },
      front: {
        eyebrow: 'Kanji',
        primary: { text: '食', lang: 'ja' },
        hint: 'Ingat arti dan bacaannya.',
      },
      back: {
        title: { text: 'makan, makanan' },
        details: [],
      },
    })
  })
})
