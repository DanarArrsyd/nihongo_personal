import { getGrammar } from '../../grammar/services/grammarData.js'
import { getKanji } from '../../kanji/services/kanjiData.js'
import { getVocabulary } from '../../vocabulary/services/vocabularyData.js'
import { sampleFlashcards } from '../services/flashcardGeneration.js'
import { createGrammarFlashcard } from './grammarFlashcardAdapter.js'
import { createKanjiFlashcard } from './kanjiFlashcardAdapter.js'
import { createVocabularyFlashcard } from './vocabularyFlashcardAdapter.js'

export const FLASHCARD_MODULES = ['vocabulary', 'kanji', 'grammar']

const moduleAdapters = {
  vocabulary: createVocabularyFlashcard,
  kanji: createKanjiFlashcard,
  grammar: createGrammarFlashcard,
}

const moduleSources = {
  vocabulary: getVocabulary,
  kanji: getKanji,
  grammar: getGrammar,
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidDetail(detail) {
  return hasText(detail?.label)
    && hasText(detail.value?.text)
    && (detail.value.lang === undefined || hasText(detail.value.lang))
}

function isValidFlashcard(card, module) {
  return hasText(card?.id)
    && card.source?.module === module
    && FLASHCARD_MODULES.includes(card.source.module)
    && hasText(card.source.itemId)
    && hasText(card.front?.primary?.text)
    && hasText(card.back?.title?.text)
    && Array.isArray(card.back?.details)
    && card.back.details.every(isValidDetail)
}

function getSourceItems(module, sources) {
  if (sources !== undefined) return sources?.[module]

  return moduleSources[module]()
}

export function createFlashcardDeck({ module, count = 10, rng = Math.random, sources } = {}) {
  if (!FLASHCARD_MODULES.includes(module)) {
    return { cards: [], error: 'unknown-module' }
  }

  const items = getSourceItems(module, sources)
  if (!Array.isArray(items)) return { cards: [], error: 'unavailable' }

  const cards = items.map(moduleAdapters[module]).filter(Boolean)
  const selectedCards = sampleFlashcards(cards, { count, rng })
  const uniqueIds = new Set(selectedCards.map(({ id }) => id))

  if (selectedCards.length === 0
    || selectedCards.length !== uniqueIds.size
    || !selectedCards.every((card) => isValidFlashcard(card, module))) {
    return { cards: [], error: 'unavailable' }
  }

  return { cards: selectedCards, error: null }
}
