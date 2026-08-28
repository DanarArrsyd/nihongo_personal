import { describe, expect, it } from 'vitest'

import {
  canNavigateTo,
  createQuizState,
  getQuizScore,
  isQuizComplete,
  quizSessionReducer,
} from './quizSession.js'

const questionOne = { id: 'question-one', type: 'multiple_choice' }
const questionTwo = { id: 'question-two', type: 'typing' }
const responseOne = { questionId: 'question-one', result: true }
const changedResponse = { questionId: 'question-one', result: false }
const responseTwo = { questionId: 'question-two', result: false }

describe('quiz session', () => {
  it('creates an active state without changing the question set', () => {
    const questions = [questionOne, questionTwo]

    expect(createQuizState(questions)).toEqual({
      questions: [questionOne, questionTwo],
      currentIndex: 0,
      responses: {},
      status: 'active',
    })
    expect(questions).toEqual([questionOne, questionTwo])
  })

  it('locks each current-question response and does not advance before it is answered', () => {
    const initial = createQuizState([questionOne, questionTwo])

    expect(quizSessionReducer(initial, { type: 'NEXT' })).toBe(initial)

    const answered = quizSessionReducer(initial, { type: 'ANSWER', response: responseOne })
    expect(answered.responses[questionOne.id]).toBe(responseOne)
    expect(quizSessionReducer(answered, { type: 'ANSWER', response: changedResponse })).toBe(answered)
    expect(quizSessionReducer(answered, { type: 'NEXT' }).currentIndex).toBe(1)
    expect(initial.responses).toEqual({})
  })

  it('rejects a response for a question other than the current question', () => {
    const initial = createQuizState([questionOne, questionTwo])

    expect(quizSessionReducer(initial, { type: 'ANSWER', response: responseTwo })).toBe(initial)
  })

  it('allows moving to answered questions, but not ahead of the current answer trail', () => {
    const answered = quizSessionReducer(createQuizState([questionOne, questionTwo]), {
      type: 'ANSWER',
      response: responseOne,
    })
    const secondQuestion = quizSessionReducer(answered, { type: 'NEXT' })

    expect(canNavigateTo(answered, 1)).toBe(false)
    expect(canNavigateTo(answered, 0)).toBe(true)
    expect(canNavigateTo(secondQuestion, 1)).toBe(true)
    expect(quizSessionReducer(secondQuestion, { type: 'GO_TO', index: 0 }).currentIndex).toBe(0)
    expect(quizSessionReducer(answered, { type: 'GO_TO', index: 1 })).toBe(answered)
  })

  it('moves backward only when a previous question exists', () => {
    const initial = createQuizState([questionOne, questionTwo])
    const secondQuestion = quizSessionReducer(
      quizSessionReducer(initial, { type: 'ANSWER', response: responseOne }),
      { type: 'NEXT' },
    )

    expect(quizSessionReducer(initial, { type: 'PREVIOUS' })).toBe(initial)
    expect(quizSessionReducer(secondQuestion, { type: 'PREVIOUS' }).currentIndex).toBe(0)
  })

  it('completes only after every question has a locked response', () => {
    const firstAnswered = quizSessionReducer(createQuizState([questionOne, questionTwo]), {
      type: 'ANSWER',
      response: responseOne,
    })
    const secondQuestion = quizSessionReducer(firstAnswered, { type: 'NEXT' })
    const completed = quizSessionReducer(secondQuestion, { type: 'ANSWER', response: responseTwo })

    expect(firstAnswered.status).toBe('active')
    expect(completed.status).toBe('completed')
    expect(isQuizComplete(completed)).toBe(true)
  })

  it('derives score from correct response records', () => {
    const state = {
      ...createQuizState([questionOne, questionTwo]),
      responses: { [questionOne.id]: responseOne, [questionTwo.id]: responseTwo },
    }

    expect(getQuizScore(state)).toBe(1)
  })

  it('restarts with the supplied replacement question set', () => {
    const state = {
      ...createQuizState([questionOne, questionTwo]),
      currentIndex: 1,
      responses: { [questionOne.id]: responseOne },
      status: 'completed',
    }
    const replacement = [{ id: 'replacement-question', type: 'recognition' }]

    expect(quizSessionReducer(state, { type: 'RESTART', questions: replacement })).toEqual({
      questions: replacement,
      currentIndex: 0,
      responses: {},
      status: 'active',
    })
    expect(replacement).toEqual([{ id: 'replacement-question', type: 'recognition' }])
  })
})
