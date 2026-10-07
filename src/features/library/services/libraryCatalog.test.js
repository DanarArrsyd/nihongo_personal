import {
  countLibraryCategories,
  createLibraryCatalog,
  filterLibraryCatalog,
  getFavoriteKey,
} from './libraryCatalog'

const sources = {
  grammar: [{
    examples: [{ japanese: '私は学生です。', meaning: 'Saya pelajar.', reading: 'わたしはがくせいです。' }],
    explanation: 'Pola identitas sopan.',
    id: 'grammar-1',
    jlpt: 'N5',
    meaning: 'adalah',
    pattern: '～です',
    structure: 'Noun + です',
  }],
  kanji: [{
    id: 'kanji-1',
    jlpt: 'N5',
    kunyomi: ['た.べる'],
    meaning: ['makan', 'makanan'],
    onyomi: ['ショク'],
    strokes: 9,
    kanji: '食',
  }],
  vocabulary: [{
    examples: [],
    id: 'vocab-1',
    jlpt: 'N5',
    meaning: 'makan',
    reading: 'たべる',
    romaji: 'taberu',
    type: 'verb',
    word: '食べる',
  }],
}

describe('library catalog', () => {
  const catalog = createLibraryCatalog(sources)

  it('combines all supported reference modules with detail routes', () => {
    expect(catalog).toHaveLength(3)
    expect(catalog.map((item) => item.href)).toEqual([
      '/learn/vocabulary/vocab-1',
      '/learn/kanji/kanji-1',
      '/learn/grammar/grammar-1',
    ])
    expect(countLibraryCategories(catalog)).toEqual({ vocabulary: 1, kanji: 1, grammar: 1 })
  })

  it.each(['食べる', 'たべる', 'taberu', 'makan'])(
    'finds vocabulary using %s',
    (query) => {
      expect(filterLibraryCatalog(catalog, { query })).toContainEqual(
        expect.objectContaining({ id: 'vocab-1' }),
      )
    },
  )

  it('normalizes dotted kunyomi and searches grammar example readings', () => {
    expect(filterLibraryCatalog(catalog, { query: 'たべる', category: 'kanji' }))
      .toEqual([expect.objectContaining({ id: 'kanji-1' })])
    expect(filterLibraryCatalog(catalog, { query: 'がくせい', category: 'grammar' }))
      .toEqual([expect.objectContaining({ id: 'grammar-1' })])
  })

  it('combines category and favorite filters', () => {
    const favoriteKeys = new Set([getFavoriteKey('kanji', 'kanji-1')])

    expect(filterLibraryCatalog(
      catalog,
      { category: 'kanji', favoritesOnly: true },
      favoriteKeys,
    )).toEqual([expect.objectContaining({ id: 'kanji-1' })])
    expect(filterLibraryCatalog(
      catalog,
      { category: 'grammar', favoritesOnly: true },
      favoriteKeys,
    )).toEqual([])
  })
})
