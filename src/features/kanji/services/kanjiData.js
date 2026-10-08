import kanji from '../../../data/kanji/n5.json'
import { getVocabulary, getVocabularyById } from '../../vocabulary/services/vocabularyData'

export function getKanji() {
  return kanji
}

export function getKanjiById(id) {
  return kanji.find((item) => item.id === id) ?? null
}

export function getRelatedVocabulary(item) {
  if (!item) return []

  const declared = (item.relatedVocabularyIds ?? []).map(getVocabularyById).filter(Boolean)
  const discovered = item.kanji
    ? getVocabulary().filter((word) => word.word.includes(item.kanji))
    : []
  const seen = new Set()

  return [...declared, ...discovered].filter((word) => {
    if (seen.has(word.id)) return false
    seen.add(word.id)
    return true
  })
}

export function getKanjiExamples(item) {
  if (!item?.kanji) return []

  const examples = [
    ...(item.exampleSentences ?? []),
    ...getRelatedVocabulary(item).flatMap((word) => word.examples ?? []),
  ]
  const seen = new Set()

  return examples.filter((example) => {
    if (!example?.japanese?.includes(item.kanji) || !example.reading || !example.meaning
      || seen.has(example.japanese)) return false
    seen.add(example.japanese)
    return true
  }).slice(0, 3)
}
