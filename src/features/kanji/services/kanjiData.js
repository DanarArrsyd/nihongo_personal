import kanji from '../../../data/kanji/n5.json'
import { getVocabularyById } from '../../vocabulary/services/vocabularyData'

export function getKanji() {
  return kanji
}

export function getKanjiById(id) {
  return kanji.find((item) => item.id === id) ?? null
}

export function getRelatedVocabulary(item) {
  if (!item?.relatedVocabularyIds) return []

  return item.relatedVocabularyIds.map(getVocabularyById).filter(Boolean)
}
