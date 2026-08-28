import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Card from '../../components/ui/Card'
import PracticeModePicker from './components/PracticeModePicker'
import { getAllKana, isSupportedScript } from './services/kanaData'
import { checkKanaAnswer, createKanaQuestion, isSupportedPracticeMode } from './services/kanaQuiz'

const scriptNames = { hiragana: 'Hiragana', katakana: 'Katakana' }
const modeGuidance = {
  recognition: 'Choose the romaji that matches this kana.',
  reverse: 'Choose the kana that matches this romaji.',
  typing: 'Type the romaji reading for this kana.',
}

function PracticeSession({ mode, script }) {
  const items = getAllKana(script)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)
  const item = items[questionIndex % items.length]
  const distractors = [1, 2, 3].map((offset) => items[(questionIndex + offset) % items.length])
  const question = createKanaQuestion({ item, mode, distractors })

  function submit(answer) {
    if (result) return
    const isCorrect = checkKanaAnswer(question, answer)
    setResult({ answer, isCorrect })
    if (isCorrect) setScore((current) => current + 1)
  }

  function nextQuestion() {
    setQuestionIndex((current) => current + 1)
    setTypedAnswer('')
    setResult(null)
  }

  return (
    <div className="page-frame max-w-6xl">
      <Link to="/practice" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent">
        <ArrowLeft size={16} aria-hidden="true" /> Practice overview
      </Link>

      <header className="mt-6 flex flex-col justify-between gap-6 border-b border-border pb-7 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold capitalize text-accent">{modeGuidance[mode]}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{scriptNames[script]} {mode}</h1>
        </div>
        <PracticeModePicker script={script} />
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <Card className="overflow-hidden p-0 sm:p-0">
          <div className="genko-grid grid min-h-72 place-items-center border-b border-border p-8">
            <p
              lang={mode === 'reverse' ? undefined : 'ja'}
              className={`font-semibold text-ink ${mode === 'reverse' ? 'text-6xl tracking-tight' : 'font-japanese text-8xl sm:text-9xl'}`}
            >
              {question.prompt}
            </p>
          </div>

          <div className="p-5 sm:p-7">
            {question.type === 'multiple_choice' ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => submit(option)}
                    disabled={Boolean(result)}
                    className={`min-h-14 rounded-xl border px-4 py-3 font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default ${
                      result && option === question.answer
                        ? 'border-matcha bg-matcha-soft text-[#52654A]'
                        : result?.answer === option
                          ? 'border-accent bg-accent-soft text-accent'
                          : 'border-border bg-surface hover:border-gold hover:bg-paper'
                    } ${mode === 'reverse' ? 'font-japanese text-2xl' : ''}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  submit(typedAnswer)
                }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <label className="flex-1">
                  <span className="sr-only">Your romaji answer</span>
                  <input
                    value={typedAnswer}
                    onChange={(event) => setTypedAnswer(event.target.value)}
                    disabled={Boolean(result)}
                    autoComplete="off"
                    placeholder="Type romaji…"
                    className="min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-ink outline-none transition placeholder:text-ink-muted/70 focus:border-accent focus:ring-2 focus:ring-accent-soft"
                  />
                </label>
                <button type="submit" disabled={!typedAnswer.trim() || Boolean(result)} className="min-h-12 rounded-xl bg-ink px-5 text-sm font-semibold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45">
                  Check answer
                </button>
              </form>
            )}

            {result && (
              <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl bg-paper-deep p-4 sm:flex-row sm:items-center">
                <p role="status" className={`flex items-center gap-2 font-semibold ${result.isCorrect ? 'text-[#52654A]' : 'text-accent'}`}>
                  {result.isCorrect ? <CheckCircle2 size={20} aria-hidden="true" /> : <XCircle size={20} aria-hidden="true" />}
                  {result.isCorrect ? 'Correct' : `Not quite. Correct answer: ${question.answer}`}
                </p>
                <button type="button" onClick={nextQuestion} className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent">
                  Next question <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </Card>

        <aside className="space-y-3">
          <Card quiet>
            <p className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">Session score</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{score} <span className="text-base text-ink-muted">correct</span></p>
          </Card>
          <Card quiet>
            <p className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">Question</p>
            <p className="mt-2 text-lg font-semibold tabular-nums">{questionIndex + 1} of {items.length}</p>
          </Card>
        </aside>
      </div>
    </div>
  )
}

export default function KanaPracticePage() {
  const { mode, script } = useParams()

  if (!isSupportedScript(script) || !isSupportedPracticeMode(mode)) {
    return (
      <div className="page-frame">
        <p className="text-sm font-semibold tracking-[0.14em] text-accent uppercase">404 / Practice</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Practice path not found</h1>
        <p className="mt-4 text-ink-muted">This script or practice mode is not available.</p>
        <Link to="/practice" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white">
          <ArrowLeft size={17} aria-hidden="true" /> Back to Practice
        </Link>
      </div>
    )
  }

  return <PracticeSession key={`${script}:${mode}`} script={script} mode={mode} />
}
