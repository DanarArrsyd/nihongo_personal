export function createFlashcardResponse({ card, rating, now = () => new Date() }) {
  const associatedItem = Object.freeze({
    module: card.source.module,
    itemId: card.source.itemId,
  })

  return Object.freeze({
    cardId: card.id,
    rating,
    timestamp: now().toISOString(),
    associatedItem,
  })
}
