import { getWritingKana, getWritingKanaById, isSupportedWritingScript } from './writingData.js'

describe('writingData', () => {
  it('provides every single-character kana in both scripts', () => {
    expect(getWritingKana('hiragana')).toHaveLength(71)
    expect(getWritingKana('katakana')).toHaveLength(71)
    expect(getWritingKana('romaji')).toEqual([])
  })

  it('returns pinned KanjiVG paths for a requested kana', () => {
    expect(getWritingKanaById('hiragana', 'o')).toMatchObject({
      character: 'お',
      romaji: 'o',
      sourceFile: '0304a.svg',
    })
    expect(getWritingKanaById('hiragana', 'o').strokes).toHaveLength(3)
  })

  it('recognizes only supported writing scripts', () => {
    expect(isSupportedWritingScript('hiragana')).toBe(true)
    expect(isSupportedWritingScript('katakana')).toBe(true)
    expect(isSupportedWritingScript('kanji')).toBe(false)
  })
})
