export function createQuizState(questions) {
  return { questions, currentIndex: 0, responses: {}, status: 'active' }
}

export function getQuizScore(state) {
  return Object.values(state.responses).filter((response) => response.result).length
}

export function isQuizComplete(state) {
  return state.questions.length > 0
    && state.questions.every((question) => state.responses[question.id])
}

export function canNavigateTo(state, index) {
  if (!Number.isInteger(index) || index < 0 || index >= state.questions.length) return false

  const question = state.questions[index]
  return index === state.currentIndex || Boolean(state.responses[question.id])
}

export function quizSessionReducer(state, action) {
  switch (action.type) {
    case 'ANSWER': {
      const question = state.questions[state.currentIndex]
      const response = action.response
      if (!question || !response || response.questionId !== question.id || state.responses[question.id]) {
        return state
      }

      const responses = { ...state.responses, [question.id]: response }
      const nextState = { ...state, responses }
      return isQuizComplete(nextState) ? { ...nextState, status: 'completed' } : nextState
    }

    case 'NEXT': {
      const question = state.questions[state.currentIndex]
      if (!question || !state.responses[question.id] || state.currentIndex >= state.questions.length - 1) {
        return state
      }
      return { ...state, currentIndex: state.currentIndex + 1 }
    }

    case 'PREVIOUS':
      return state.currentIndex === 0 ? state : { ...state, currentIndex: state.currentIndex - 1 }

    case 'GO_TO':
      return canNavigateTo(state, action.index) && action.index !== state.currentIndex
        ? { ...state, currentIndex: action.index }
        : state

    case 'RESTART':
      return createQuizState(action.questions)

    default:
      return state
  }
}
