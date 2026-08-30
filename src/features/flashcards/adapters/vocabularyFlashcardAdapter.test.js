import { describe, expect, it } from 'vitest'

import { createVocabularyFlashcard } from './vocabularyFlashcardAdapter.js'

const vocabularyFixture = {
  id: 'n5-vocab-001',
  word: '食べる',
  reading: 'たべる',
  romaji: 'taberu',
  meaning: 'makan',
  type: 'verb',
  jlpt: 'N5',
  examples: [
    {
      japanese: '私はパンを食べます。',
      reading: 'わたしはパンをたべます。',
      meaning: 'Saya makan roti.',
    },
  ],
}

describe('createVocabularyFlashcard', () => {
  it('maps vocabulary front, answer details, and real example', () => {
    expect(createVocabularyFlashcard(vocabularyFixture)).toEqual({
      id: 'flashcard-vocabulary-n5-vocab-001',
      source: { module: 'vocabulary', itemId: 'n5-vocab-001' },
      front: {
        eyebrow: 'Vocabulary',
        primary: { text: '食べる', lang: 'ja' },
        hint: 'Ingat bacaan dan artinya.',
      },
      back: {
        title: { text: 'たべる', lang: 'ja' },
        meaning: 'makan',
        details: [
          { label: 'Romaji', value: { text: 'taberu' } },
          { label: 'Jenis', value: { text: 'verb' } },
        ],
        example: {
          japanese: '私はパンを食べます。',
          reading: 'わたしはパンをたべます。',
          meaning: 'Saya makan roti.',
        },
      },
    })
  })

  it('returns null when identity or answer content is missing', () => {
    expect(createVocabularyFlashcard({ ...vocabularyFixture, id: '' })).toBeNull()
    expect(createVocabularyFlashcard({ ...vocabularyFixture, reading: '' })).toBeNull()
  })

  it('omits blank optional details and example data', () => {
    expect(createVocabularyFlashcard({
      ...vocabularyFixture,
      romaji: '',
      type: '',
      examples: [{ japanese: '', reading: '', meaning: '' }],
    })).toEqual({
      id: 'flashcard-vocabulary-n5-vocab-001',
      source: { module: 'vocabulary', itemId: 'n5-vocab-001' },
      front: {
        eyebrow: 'Vocabulary',
        primary: { text: '食べる', lang: 'ja' },
        hint: 'Ingat bacaan dan artinya.',
      },
      back: {
        title: { text: 'たべる', lang: 'ja' },
        meaning: 'makan',
        details: [],
      },
    })
  })
})
