import grammar from '../../../data/grammar/n5.json'

export function getGrammar() {
  return grammar
}

export function getGrammarLevels() {
  return [...new Set(grammar.map((item) => item.jlpt))]
}

export function filterGrammarByLevel(items, level) {
  if (level === 'all') return items
  return items.filter((item) => item.jlpt === level)
}

export function getGrammarById(id) {
  return grammar.find((item) => item.id === id) ?? null
}

export function getRelatedGrammar(item) {
  if (!item?.relatedGrammarIds) return []
  return item.relatedGrammarIds.map(getGrammarById).filter(Boolean)
}
