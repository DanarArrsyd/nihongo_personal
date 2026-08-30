import { describe, expect, it } from 'vitest'

import { createGrammarFlashcard } from './grammarFlashcardAdapter.js'

const grammarFixture = {
  id: 'n5-grammar-001',
  pattern: '～です',
  meaning: 'adalah; menyatakan identitas atau keadaan dengan sopan',
  jlpt: 'N5',
  structure: 'Noun + です',
  explanation: 'Tambahkan です setelah nomina untuk menyatakan identitas atau keadaan dengan sopan.',
  examples: [
    {
      japanese: '私は学生です。',
      reading: 'わたしはがくせいです。',
      meaning: 'Saya seorang pelajar.',
    },
  ],
  relatedGrammarIds: ['n5-grammar-002', 'n5-grammar-003'],
}

describe('createGrammarFlashcard', () => {
  it('maps meaning, structure, explanation, and a real example', () => {
    expect(createGrammarFlashcard(grammarFixture)).toEqual({
      id: 'flashcard-grammar-n5-grammar-001',
      source: { module: 'grammar', itemId: 'n5-grammar-001' },
      front: {
        eyebrow: 'Grammar',
        primary: { text: '～です', lang: 'ja' },
        hint: 'Ingat arti dan polanya.',
      },
      back: {
        title: { text: 'adalah; menyatakan identitas atau keadaan dengan sopan' },
        details: [
          { label: 'Struktur', value: { text: 'Noun + です' } },
          {
            label: 'Penjelasan',
            value: { text: 'Tambahkan です setelah nomina untuk menyatakan identitas atau keadaan dengan sopan.' },
          },
        ],
        example: {
          japanese: '私は学生です。',
          reading: 'わたしはがくせいです。',
          meaning: 'Saya seorang pelajar.',
        },
      },
    })
  })

  it('returns null when identity or primary content is missing', () => {
    expect(createGrammarFlashcard({ ...grammarFixture, id: '' })).toBeNull()
    expect(createGrammarFlashcard({ ...grammarFixture, pattern: '' })).toBeNull()
  })

  it('omits blank optional details and example data', () => {
    expect(createGrammarFlashcard({
      ...grammarFixture,
      structure: '',
      explanation: '',
      examples: [{ japanese: '', reading: '', meaning: '' }],
    })).toEqual({
      id: 'flashcard-grammar-n5-grammar-001',
      source: { module: 'grammar', itemId: 'n5-grammar-001' },
      front: {
        eyebrow: 'Grammar',
        primary: { text: '～です', lang: 'ja' },
        hint: 'Ingat arti dan polanya.',
      },
      back: {
        title: { text: 'adalah; menyatakan identitas atau keadaan dengan sopan' },
        details: [],
      },
    })
  })
})
