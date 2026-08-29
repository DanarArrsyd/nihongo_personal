import { useEffect, useReducer, useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Button from '../../components/ui/Button'
import AnswerFeedback from './components/AnswerFeedback'
import AnswerTrail from './components/AnswerTrail'
import QuestionRenderer from './components/QuestionRenderer'
import QuizResults from './components/QuizResults'
import QuizUnavailable from './components/QuizUnavailable'
import { validateQuiz } from './services/questionValidation'
import { createQuizResponse } from './services/quizResponse'
import { createQuizState, quizSessionReducer } from './services/quizSession'

export default function QuizSession({ questions, onRestart, now }) {
  const validation = validateQuiz(questions)
  const [state, dispatch] = useReducer(
    quizSessionReducer,
    validation.valid ? questions : [],
    createQuizState,
  )
  const questionHeadingRef = useRef(null)
  const focusAfterNavigation = useRef(false)

  useEffect(() => {
    if (!focusAfterNavigation.current) return
    focusAfterNavigation.current = false
    questionHeadingRef.current?.focus()
  }, [state.currentIndex])

  if (!validation.valid) return <QuizUnavailable />
  if (state.status === 'completed') return <QuizResults state={state} onRestart={onRestart} />

  const question = state.questions[state.currentIndex]
  const response = state.responses[question.id]
  const hasPrevious = state.currentIndex > 0
  const hasNext = state.currentIndex < state.questions.length - 1

  function answerQuestion(userAnswer) {
    dispatch({
      type: 'ANSWER',
      response: createQuizResponse({ question, userAnswer, now }),
    })
  }

  function navigate(action) {
    focusAfterNavigation.current = true
    dispatch(action)
  }

  return (
    <section aria-label="Sesi quiz" className="mx-auto w-full max-w-5xl">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start">
        <article className="min-w-0 rounded-2xl border border-border bg-surface p-5 shadow-[0_12px_40px_rgba(64,54,41,0.05)] sm:p-7 lg:p-8">
          <header className="mb-7 border-b border-border pb-5">
            <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">Quiz</p>
            <h1
              ref={questionHeadingRef}
              tabIndex={-1}
              className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-ink outline-none sm:text-3xl focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
            >
              Soal {state.currentIndex + 1} dari {state.questions.length}
            </h1>
          </header>

          <QuestionRenderer
            question={question}
            disabled={Boolean(response)}
            onAnswer={answerQuestion}
          />
          <AnswerFeedback response={response} />

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              disabled={!hasPrevious}
              onClick={() => navigate({ type: 'PREVIOUS' })}
            >
              <ArrowLeft aria-hidden="true" size={17} />
              Soal sebelumnya
            </Button>
            {hasNext ? (
              <Button
                type="button"
                disabled={!response}
                onClick={() => navigate({ type: 'NEXT' })}
              >
                Soal berikutnya
                <ArrowRight aria-hidden="true" size={17} />
              </Button>
            ) : null}
          </div>
        </article>

        <aside className="min-w-0 rounded-2xl border border-border bg-paper-deep p-3 sm:p-4 lg:sticky lg:top-6">
          <p className="mb-3 text-xs font-semibold tracking-[0.1em] text-ink-muted uppercase">
            Jejak jawaban
          </p>
          <AnswerTrail
            questions={state.questions}
            currentIndex={state.currentIndex}
            responses={state.responses}
            onNavigate={(index) => {
              if (index !== state.currentIndex && state.responses[state.questions[index].id]) {
                navigate({ type: 'GO_TO', index })
              }
            }}
          />
        </aside>
      </div>
    </section>
  )
}
