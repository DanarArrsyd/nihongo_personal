import { describe, expect, it } from 'vitest'

import {
  QUESTION_TYPES,
  SOURCE_MODULES,
  validateQuestion,
  validateQuiz,
} from './questionValidation.js'

const validChoice = {
  id: 'vocab-001-meaning',
  type: 'multiple_choice',
  source: { module: 'vocabulary', itemId: 'n5-vocab-001' },
  instruction: 'Pilih arti yang tepat.',
  content: { kind: 'text', text: '食べる', lang: 'ja' },
  answer: { value: 'makan', acceptedValues: ['makan'] },
  options: [
    { value: 'makan', label: 'makan', lang: 'id' },
    { value: 'minum', label: 'minum', lang: 'id' },
  ],
}

const validQuestions = {
  multiple_choice: validChoice,
  reverse_multiple_choice: { ...validChoice, id: 'reverse', type: 'reverse_multiple_choice' },
  typing: {
    ...validChoice,
    id: 'typing',
    type: 'typing',
    options: undefined,
  },
  recognition: {
    ...validChoice,
    id: 'recognition',
    type: 'recognition',
    content: { kind: 'pair', primary: '食', secondary: 'makan', lang: 'id' },
    answer: { value: true, acceptedValues: [true] },
    options: [
      { value: true, label: 'Benar' },
      { value: false, label: 'Salah' },
    ],
  },
  sentence_completion: {
    ...validChoice,
    id: 'sentence',
    type: 'sentence_completion',
    content: { kind: 'sentence', before: '私は', after: '食べます。', lang: 'ja' },
  },
}

describe('question validation', () => {
  it('exports the supported question and source contracts', () => {
    expect(QUESTION_TYPES).toEqual([
      'multiple_choice',
      'reverse_multiple_choice',
      'typing',
      'recognition',
      'sentence_completion',
    ])
    expect(SOURCE_MODULES).toEqual(['kana', 'vocabulary', 'kanji', 'grammar'])
  })

  it.each(Object.entries(validQuestions))('accepts valid %s questions', (_, question) => {
    expect(validateQuestion(question)).toEqual({ valid: true, errors: [] })
  })

  it('rejects an empty id and unsupported type', () => {
    expect(validateQuestion({ ...validChoice, id: '' }).valid).toBe(false)
    expect(validateQuestion({ ...validChoice, type: 'matching' }).errors).toContain(
      'Unsupported question type: matching',
    )
  })

  it('rejects unsupported source modules and missing item ids', () => {
    expect(validateQuestion({ ...validChoice, source: { module: 'flashcards', itemId: 'x' } }).errors)
      .toContain('Unsupported source module: flashcards')
    expect(validateQuestion({ ...validChoice, source: { module: 'kana', itemId: '' } }).errors)
      .toContain('Source item ID is required')
  })

  it('requires options for selectable questions and excludes them from typing', () => {
    expect(validateQuestion({ ...validChoice, options: [] }).errors)
      .toContain('At least two options are required')
    expect(validateQuestion({ ...validQuestions.typing, options: [{ value: 'x', label: 'x' }] }).errors)
      .toContain('Typing questions must not have options')
  })

  it('requires unique options containing the correct answer', () => {
    expect(validateQuestion({ ...validChoice, options: [
      { value: 'makan', label: 'makan' },
      { value: 'makan', label: 'again' },
    ] }).errors).toContain('Option values must be unique')
    expect(validateQuestion({ ...validChoice, options: [
      { value: 'minum', label: 'minum' },
      { value: 'air', label: 'air' },
    ] }).errors).toContain('Options must contain the correct answer')
  })

  it('requires boolean Benar/Salah options for recognition', () => {
    const bad = { ...validQuestions.recognition, answer: { value: 'true' }, options: [
      { value: 'true', label: 'Benar' },
      { value: 'false', label: 'Salah' },
    ] }
    expect(validateQuestion(bad).errors).toContain('Recognition answer must be boolean')
    expect(validateQuestion({ ...validQuestions.recognition, options: [
      { value: true, label: 'True' },
      { value: false, label: 'False' },
    ] }).errors).toContain('Recognition options must be labeled Benar and Salah')
  })

  it('requires sentence content boundaries', () => {
    expect(validateQuestion({ ...validQuestions.sentence_completion, content: {
      kind: 'sentence', before: '', after: '食べます。', lang: 'ja',
      } }).errors).toContain('Sentence content requires non-empty before and after')
    expect(validateQuestion({ ...validQuestions.sentence_completion, options: undefined }).errors)
      .toContain('At least two options are required')
  })

  it('rejects empty quizzes, duplicate ids, and indexed question errors', () => {
    expect(validateQuiz([]).valid).toBe(false)
    expect(validateQuiz([validChoice, validChoice]).errors).toContain(
      'Duplicate question ID: vocab-001-meaning',
    )
    expect(validateQuiz([{ ...validChoice, id: '' }]).errors).toContain('Question 1: Question ID is required')
  })
})
