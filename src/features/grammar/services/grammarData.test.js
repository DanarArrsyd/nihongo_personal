import {
  filterGrammarByLevel,
  getGrammar,
  getGrammarById,
  getGrammarLevels,
  getRelatedGrammar,
} from './grammarData'

describe('grammarData', () => {
  it('returns the 12-pattern curriculum in order', () => {
    const grammar = getGrammar()
    expect(grammar).toHaveLength(12)
    expect(grammar[0].id).toBe('n5-grammar-001')
    expect(grammar[11].id).toBe('n5-grammar-012')
    expect(grammar.every((item) => item.examples.length >= 2)).toBe(true)
  })

  it('derives levels and filters records', () => {
    const grammar = getGrammar()
    expect(getGrammarLevels()).toEqual(['N5'])
    expect(filterGrammarByLevel(grammar, 'all')).toHaveLength(12)
    expect(filterGrammarByLevel(grammar, 'N5')).toHaveLength(12)
    expect(filterGrammarByLevel(grammar, 'N4')).toEqual([])
  })

  it('looks up known IDs and safely rejects unknown IDs', () => {
    expect(getGrammarById('n5-grammar-012')?.pattern).toBe('～たいです')
    expect(getGrammarById('not-real')).toBeNull()
  })

  it('resolves related grammar in declared order', () => {
    const related = getRelatedGrammar(getGrammarById('n5-grammar-001'))
    expect(related.map((item) => item.id)).toEqual([
      'n5-grammar-002',
      'n5-grammar-003',
    ])
  })

  it('ignores stale relationships and empty input', () => {
    expect(getRelatedGrammar({ relatedGrammarIds: ['missing', 'n5-grammar-012'] }))
      .toEqual([getGrammarById('n5-grammar-012')])
    expect(getRelatedGrammar()).toEqual([])
  })
})
