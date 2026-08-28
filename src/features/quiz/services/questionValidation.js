import { QUESTION_TYPES, SOURCE_MODULES } from './questionTypes.js'

export { QUESTION_TYPES, SOURCE_MODULES }

const selectableTypes = new Set([
  'multiple_choice',
  'reverse_multiple_choice',
  'recognition',
  'sentence_completion',
])
const contentKinds = {
  multiple_choice: 'text',
  reverse_multiple_choice: 'text',
  typing: 'text',
  recognition: 'pair',
  sentence_completion: 'sentence',
}

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isAnswerValue = (value) => typeof value === 'string' || typeof value === 'boolean'

function validateCommonFields(question, errors) {
  if (!isRecord(question)) {
    errors.push('Question must be an object')
    return
  }
  if (typeof question.id !== 'string' || question.id.trim() === '') errors.push('Question ID is required')
  if (!QUESTION_TYPES.includes(question.type)) errors.push(`Unsupported question type: ${question.type}`)

  if (!isRecord(question.source) || !SOURCE_MODULES.includes(question.source.module)) {
    errors.push(`Unsupported source module: ${question.source?.module}`)
  }
  if (!isRecord(question.source) || typeof question.source.itemId !== 'string' || question.source.itemId.trim() === '') {
    errors.push('Source item ID is required')
  }
  if (typeof question.instruction !== 'string' || question.instruction.trim() === '') {
    errors.push('Instruction is required')
  }
  if (!isRecord(question.answer) || !isAnswerValue(question.answer.value)) {
    errors.push('Answer value is required')
  }
}

function validateContent(question, errors) {
  const expectedKind = contentKinds[question.type]
  if (!expectedKind) return
  if (!isRecord(question.content) || question.content.kind !== expectedKind) {
    errors.push(`Content kind must be ${expectedKind}`)
    return
  }
  if (expectedKind === 'text' && (typeof question.content.text !== 'string' || question.content.text.trim() === '')) {
    errors.push('Text content requires non-empty text')
  }
  if (expectedKind === 'pair' && (typeof question.content.primary !== 'string' || question.content.primary.trim() === ''
    || typeof question.content.secondary !== 'string' || question.content.secondary.trim() === '')) {
    errors.push('Pair content requires non-empty primary and secondary')
  }
  if (expectedKind === 'sentence' && (typeof question.content.before !== 'string' || question.content.before.trim() === ''
    || typeof question.content.after !== 'string' || question.content.after.trim() === '')) {
    errors.push('Sentence content requires non-empty before and after')
  }
}

function validateOptions(question, errors) {
  const hasOptions = question.options !== undefined && question.options !== null
  if (question.type === 'typing') {
    if (hasOptions) errors.push('Typing questions must not have options')
    return
  }
  if (!selectableTypes.has(question.type)) return
  if (!Array.isArray(question.options) || question.options.length < 2) {
    errors.push('At least two options are required')
    return
  }
  const values = question.options.map((option) => option?.value)
  if (question.options.some((option) => !isRecord(option) || !isAnswerValue(option.value)
    || typeof option.label !== 'string' || option.label.trim() === '')) {
    errors.push('Options require primitive values and non-empty labels')
  }
  if (new Set(values).size !== values.length) errors.push('Option values must be unique')
  if (isRecord(question.answer) && isAnswerValue(question.answer.value) && !values.some((value) => value === question.answer.value)) {
    errors.push('Options must contain the correct answer')
  }
}

function validateRecognition(question, errors) {
  if (question.type !== 'recognition') return
  if (!isRecord(question.answer) || typeof question.answer.value !== 'boolean') {
    errors.push('Recognition answer must be boolean')
  }
  if (!Array.isArray(question.options) || question.options.length !== 2
    || !question.options.some((option) => option?.value === true)
    || !question.options.some((option) => option?.value === false)) {
    errors.push('Recognition options must contain exactly true and false')
    return
  }
  const labels = new Map(question.options.map((option) => [option.value, option.label]))
  if (labels.get(true) !== 'Benar' || labels.get(false) !== 'Salah') {
    errors.push('Recognition options must be labeled Benar and Salah')
  }
}

export function validateQuestion(question) {
  const errors = []
  if (!isRecord(question)) return { valid: false, errors: ['Question must be an object'] }
  validateCommonFields(question, errors)
  validateContent(question, errors)
  validateOptions(question, errors)
  validateRecognition(question, errors)
  return { valid: errors.length === 0, errors }
}

export function validateQuiz(questions) {
  if (!Array.isArray(questions)) return { valid: false, errors: ['Quiz questions must be an array'] }
  if (questions.length === 0) return { valid: false, errors: ['Quiz must contain at least one question'] }
  const errors = []
  const ids = new Set()
  questions.forEach((question, index) => {
    const result = validateQuestion(question)
    result.errors.forEach((error) => errors.push(`Question ${index + 1}: ${error}`))
    if (isRecord(question) && typeof question.id === 'string' && question.id.trim() !== '') {
      if (ids.has(question.id)) errors.push(`Duplicate question ID: ${question.id}`)
      ids.add(question.id)
    }
  })
  return { valid: errors.length === 0, errors }
}
