export function sampleFlashcards(items, { count = 10, rng = Math.random } = {}) {
  if (!Array.isArray(items) || items.length === 0 || !Number.isInteger(count) || count <= 0) {
    return []
  }

  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled.slice(0, Math.min(count, shuffled.length))
}
