import { getGrammar } from '../../grammar/services/grammarData'
import { getKanji } from '../../kanji/services/kanjiData'
import { getVocabulary } from '../../vocabulary/services/vocabularyData'

export const libraryCategories = [
  { id: 'all', label: 'Semua' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'kanji', label: 'Kanji' },
  { id: 'grammar', label: 'Grammar' },
]

export function getFavoriteKey(itemType, itemId) {
  return `${itemType}:${itemId}`
}

function compactSearchText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[\s.・～〜]/g, '')
}

function createSearchText(values) {
  return compactSearchText(values.flat(Infinity).join(' '))
}

export function createLibraryCatalog({
  grammar = getGrammar(),
  kanji = getKanji(),
  vocabulary = getVocabulary(),
} = {}) {
  return [
    ...vocabulary.map((item) => ({
      category: 'vocabulary',
      detail: item.romaji,
      href: `/learn/vocabulary/${item.id}`,
      id: item.id,
      japanese: item.word,
      meaning: item.meaning,
      meta: `${item.type} · ${item.jlpt}`,
      reading: item.reading,
      searchText: createSearchText([
        item.word,
        item.reading,
        item.romaji,
        item.meaning,
        item.type,
        item.examples?.flatMap((example) => [example.japanese, example.reading, example.meaning]),
      ]),
    })),
    ...kanji.map((item) => ({
      category: 'kanji',
      detail: [...item.onyomi, ...item.kunyomi].join(' · '),
      href: `/learn/kanji/${item.id}`,
      id: item.id,
      japanese: item.kanji,
      meaning: item.meaning.join(', '),
      meta: `${item.strokes} strokes · ${item.jlpt}`,
      reading: item.onyomi.join('・'),
      searchText: createSearchText([
        item.kanji,
        item.meaning,
        item.onyomi,
        item.kunyomi,
      ]),
    })),
    ...grammar.map((item) => ({
      category: 'grammar',
      detail: item.structure,
      href: `/learn/grammar/${item.id}`,
      id: item.id,
      japanese: item.pattern,
      meaning: item.meaning,
      meta: item.jlpt,
      reading: item.examples?.[0]?.reading ?? '',
      searchText: createSearchText([
        item.pattern,
        item.meaning,
        item.structure,
        item.explanation,
        item.examples?.flatMap((example) => [example.japanese, example.reading, example.meaning]),
      ]),
    })),
  ]
}

export function filterLibraryCatalog(
  items,
  { category = 'all', favoritesOnly = false, query = '' },
  favoriteKeys = new Set(),
) {
  const normalizedQuery = compactSearchText(query.trim())

  return items.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category
    const matchesFavorite = !favoritesOnly || favoriteKeys.has(getFavoriteKey(item.category, item.id))
    const matchesQuery = !normalizedQuery || item.searchText.includes(normalizedQuery)

    return matchesCategory && matchesFavorite && matchesQuery
  })
}

export function countLibraryCategories(items) {
  return items.reduce((counts, item) => {
    counts[item.category] = (counts[item.category] ?? 0) + 1
    return counts
  }, {})
}
