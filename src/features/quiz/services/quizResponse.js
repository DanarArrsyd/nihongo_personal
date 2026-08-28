import { evaluateAnswer } from './answerEvaluation.js'

export function createQuizResponse({ question, userAnswer, now = () => new Date() }) {
  return {
    questionId: question.id,
    questionType: question.type,
    userAnswer,
    correctAnswer: question.answer.value,
    result: evaluateAnswer(question, userAnswer),
    timestamp: now().toISOString(),
    associatedItem: { ...question.source },
  }
}
