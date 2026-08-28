import vocabulary from '../../../data/vocabulary/n5.json'

export function getVocabulary() {
  return vocabulary
}

export function getVocabularyById(id) {
  return vocabulary.find((item) => item.id === id) ?? null
}

export function getVocabularyTypes(items = vocabulary) {
  return [...new Set(items.map((item) => item.type))].sort()
}

export function filterVocabulary(
  items,
  { query = '', type = 'all', status = 'all' },
  getStatus = () => 'new',
) {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  return items.filter((item) => {
    const searchableText = [item.word, item.reading, item.romaji, item.meaning]
      .join(' ')
      .toLocaleLowerCase()
    const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery)
    const matchesType = type === 'all' || item.type === type
    const matchesStatus = status === 'all' || getStatus(item.id) === status

    return matchesQuery && matchesType && matchesStatus
  })
}
