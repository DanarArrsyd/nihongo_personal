import { Check, Play, Sparkles } from 'lucide-react'
import { useState } from 'react'
import Button from '../../../components/ui/Button.jsx'
import {
  MIXED_QUIZ_COUNTS,
  MIXED_QUIZ_MODULES,
  MIXED_QUIZ_TYPES,
} from '../../quiz/adapters/mixedQuizAdapter.js'

const moduleLabels = {
  kana: ['Kana', 'ひらがな・カタカナ'],
  vocabulary: ['Vocabulary', '単語'],
  kanji: ['Kanji', '漢字'],
  grammar: ['Grammar', '文法'],
}

const typeLabels = {
  multiple_choice: 'Pilih arti / bacaan',
  reverse_multiple_choice: 'Pilih bentuk Jepang',
  typing: 'Ketik jawaban',
  recognition: 'Benar atau salah',
  sentence_completion: 'Lengkapi kalimat',
}

function toggleSelection(current, value) {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]
}

export default function PracticeSessionSetup({ isPreparing, onStart, error }) {
  const [count, setCount] = useState(10)
  const [modules, setModules] = useState(MIXED_QUIZ_MODULES)
  const [questionTypes, setQuestionTypes] = useState(MIXED_QUIZ_TYPES)
  const canStart = modules.length > 0 && questionTypes.length > 0 && !isPreparing

  function handleSubmit(event) {
    event.preventDefault()
    if (canStart) onStart({ count, modules, questionTypes })
  }

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_18px_55px_rgba(64,54,41,0.07)]">
      <div className="border-b border-border bg-paper-deep px-5 py-6 sm:px-7 lg:px-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-accent uppercase">
              <Sparkles size={16} aria-hidden="true" /> Smart practice
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Racik sesi belajarmu</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted sm:text-base">
              Pilih durasi, materi, dan cara menjawab. Soal lemah diprioritaskan, soal yang baru muncul dikurangi.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-matcha/30 bg-matcha-soft px-3 py-1.5 text-xs font-semibold text-matcha">
            Tanpa soal duplikat
          </span>
        </div>
      </div>

      <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[0.8fr_1.2fr] lg:p-9">
        <div className="space-y-8">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Jumlah soal</legend>
            <p className="mt-1 text-xs leading-5 text-ink-muted">Pilih sesi ringkas atau sesi fokus.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {MIXED_QUIZ_COUNTS.map((option) => (
                <label key={option} className={`cursor-pointer rounded-xl border px-3 py-3 text-center transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
                  count === option ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-white text-ink hover:border-accent/50'
                }`}>
                  <input
                    type="radio"
                    name="question-count"
                    value={option}
                    aria-label={`${option} soal`}
                    checked={count === option}
                    onChange={() => setCount(option)}
                    className="sr-only"
                  />
                  <span className="block text-lg font-semibold">{option}</span>
                  <span className="text-[0.7rem] font-medium">soal</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-ink">Materi</legend>
            <p className="mt-1 text-xs leading-5 text-ink-muted">Minimal pilih satu materi.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {MIXED_QUIZ_MODULES.map((module) => {
                const selected = modules.includes(module)
                return (
                  <label key={module} className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
                    selected ? 'border-ink bg-ink text-white' : 'border-border bg-white text-ink hover:border-ink/40'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => setModules((current) => toggleSelection(current, module))}
                      className="sr-only"
                    />
                    <span className={`grid size-6 shrink-0 place-items-center rounded-md border ${selected ? 'border-white/30 bg-white/10' : 'border-border'}`}>
                      {selected ? <Check size={15} aria-hidden="true" /> : null}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{moduleLabels[module][0]}</span>
                      <span lang="ja" className={`font-japanese text-xs ${selected ? 'text-white/65' : 'text-ink-muted'}`}>
                        {moduleLabels[module][1]}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-ink">Tipe pertanyaan</legend>
          <p className="mt-1 text-xs leading-5 text-ink-muted">Campurkan beberapa arah recall supaya latihan tidak mudah ditebak.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {MIXED_QUIZ_TYPES.map((type, index) => {
              const selected = questionTypes.includes(type)
              return (
                <label key={type} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
                  selected ? 'border-accent/50 bg-accent-soft/70' : 'border-border bg-white hover:border-accent/40'
                } ${index === MIXED_QUIZ_TYPES.length - 1 ? 'sm:col-span-2' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => setQuestionTypes((current) => toggleSelection(current, type))}
                    className="sr-only"
                  />
                  <span className={`grid size-6 shrink-0 place-items-center rounded-md border ${selected ? 'border-accent bg-accent text-white' : 'border-border'}`}>
                    {selected ? <Check size={15} aria-hidden="true" /> : null}
                  </span>
                  <span className="text-sm font-medium text-ink">{typeLabels[type]}</span>
                </label>
              )
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-paper-deep p-4">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted">
              <span><strong className="text-ink">{count}</strong> soal</span>
              <span><strong className="text-ink">{modules.length}</strong> materi</span>
              <span><strong className="text-ink">{questionTypes.length}</strong> tipe</span>
            </div>
            {error ? <p role="alert" className="mt-3 text-sm font-medium text-accent">{error}</p> : null}
            {!modules.length || !questionTypes.length ? (
              <p role="alert" className="mt-3 text-sm font-medium text-accent">Pilih minimal satu materi dan satu tipe pertanyaan.</p>
            ) : null}
            <Button type="submit" disabled={!canStart} className="mt-4 w-full sm:w-auto">
              <Play size={17} fill="currentColor" aria-hidden="true" />
              {isPreparing ? 'Menyiapkan data...' : 'Mulai sesi'}
            </Button>
          </div>
        </fieldset>
      </div>
    </form>
  )
}
