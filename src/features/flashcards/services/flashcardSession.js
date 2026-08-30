export const FLASHCARD_RATINGS = ['again', 'hard', 'good', 'easy']

export function createFlashcardState(cards) {
  return {
    cards: Array.isArray(cards) ? cards : [],
    currentIndex: 0,
    revealed: false,
    responses: [],
    status: 'active',
  }
}

export function getCurrentCard(state) {
  if (state.status !== 'active') return null

  return state.cards[state.currentIndex] ?? null
}

export function getFlashcardProgress(state) {
  const total = state.cards.length
  const current = total === 0 ? 0 : Math.min(state.currentIndex + 1, total)

  return {
    current,
    total,
    percentage: total === 0 ? 0 : Math.round((current / total) * 100),
  }
}

export function getRatingCounts(state) {
  return state.responses.reduce((counts, response) => {
    if (FLASHCARD_RATINGS.includes(response.rating)) {
      counts[response.rating] += 1
    }

    return counts
  }, { again: 0, hard: 0, good: 0, easy: 0 })
}

export function flashcardSessionReducer(state, action) {
  if (!action) return state

  switch (action.type) {
    case 'REVEAL': {
      if (state.status !== 'active' || state.revealed || !getCurrentCard(state)) return state

      return { ...state, revealed: true }
    }

    case 'RATE': {
      const card = getCurrentCard(state)
      const response = action.response
      const hasResponse = state.responses.some(({ cardId }) => cardId === card?.id)
      const isValidResponse = response
        && response.cardId === card?.id
        && FLASHCARD_RATINGS.includes(response.rating)

      if (!state.revealed || !card || !isValidResponse || hasResponse) return state

      const responses = [...state.responses, response]
      const isFinalCard = state.currentIndex === state.cards.length - 1

      if (isFinalCard) {
        return { ...state, revealed: false, responses, status: 'completed' }
      }

      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        revealed: false,
        responses,
      }
    }

    case 'RESTART':
      return createFlashcardState(action.cards)

    default:
      return state
  }
}
