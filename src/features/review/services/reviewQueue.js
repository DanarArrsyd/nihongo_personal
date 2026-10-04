import { createFlashcardForItem } from '../../flashcards/adapters/flashcardDeckAdapter.js'
import { getAllKana, isSupportedScript } from '../../kana/services/kanaData.js'

const REVIEW_MODULES = ['vocabulary', 'kanji', 'grammar', 'kana']

export function summarizeReviews(reviews) {
  const counts = Object.fromEntries(REVIEW_MODULES.map((module) => [module, 0]))

  reviews.forEach(({ itemType }) => {
    if (Object.hasOwn(counts, itemType)) counts[itemType] += 1
  })

  return { total: reviews.length, ...counts }
}

function createKanaReviewCard(itemId) {
  const [script, kanaId] = itemId.split(':')
  if (!isSupportedScript(script) || !kanaId) return null

  const item = getAllKana(script).find((candidate) => candidate.id === kanaId)
  if (!item) return null

  return {
    id: `flashcard-kana-${script}-${item.id}`,
    source: { module: 'kana', itemId },
    front: {
      eyebrow: script === 'hiragana' ? 'Hiragana' : 'Katakana',
      primary: { text: item.character, lang: 'ja' },
      hint: 'Ingat bunyi romaji karakter ini.',
    },
    back: {
      title: { text: item.romaji },
      details: [],
    },
  }
}

export function createReviewDeck(reviews) {
  return reviews.map(({ itemType, itemId }) => (
    itemType === 'kana'
      ? createKanaReviewCard(itemId)
      : createFlashcardForItem({ module: itemType, itemId })
  )).filter(Boolean)
}
