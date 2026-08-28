import { describe, expect, it } from 'vitest'
import { getAllKana, getKanaGroup, getKanaGroups } from './kanaData'

describe('Kana data selectors', () => {
  it('keeps Hiragana and Katakana group structure aligned', () => {
    const hiraganaIds = getKanaGroups('hiragana').map((group) => group.id)
    const katakanaIds = getKanaGroups('katakana').map((group) => group.id)

    expect(hiraganaIds).toEqual(katakanaIds)
    expect(hiraganaIds).toEqual([
      'vowels', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w',
      'dakuten', 'handakuten', 'combinations',
    ])
  })

  it('selects script-specific characters from shared content', () => {
    expect(getKanaGroup('hiragana', 'vowels').items[0]).toMatchObject({
      id: 'a',
      character: 'あ',
      romaji: 'a',
    })
    expect(getKanaGroup('katakana', 'vowels').items[0]).toMatchObject({
      id: 'a',
      character: 'ア',
      romaji: 'a',
    })
  })

  it('includes voiced, semi-voiced, and combination boundaries', () => {
    expect(getKanaGroup('hiragana', 'dakuten').items).toEqual(
      expect.arrayContaining([expect.objectContaining({ character: 'ば', romaji: 'ba' })]),
    )
    expect(getKanaGroup('katakana', 'handakuten').items).toEqual(
      expect.arrayContaining([expect.objectContaining({ character: 'ポ', romaji: 'po' })]),
    )
    expect(getKanaGroup('hiragana', 'combinations').items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ character: 'きゃ', romaji: 'kya' }),
        expect.objectContaining({ character: 'りょ', romaji: 'ryo' }),
      ]),
    )
  })

  it('returns unique item IDs for one script', () => {
    const ids = getAllKana('hiragana').map((item) => item.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('returns safe empty results for unsupported parameters', () => {
    expect(getKanaGroups('romaji')).toEqual([])
    expect(getKanaGroup('hiragana', 'missing')).toBeNull()
    expect(getAllKana('romaji')).toEqual([])
  })
})
