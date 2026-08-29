import { getAllKana, isSupportedScript } from '../../kana/services/kanaData.js'
import { buildOptions, sampleUnique } from '../services/quizGeneration.js'

const supportedModes = new Set(['recognition', 'reverse', 'typing'])

function valueForMode(item, mode) {
  return mode === 'reverse' ? item.character : item.romaji
}

function createOption(item, mode) {
  const value = valueForMode(item, mode)

  return mode === 'reverse'
    ? { value, label: value, lang: 'ja' }
    : { value, label: value }
}

function createUniqueDistractorPool(items, answerValue, mode) {
  const values = new Set([answerValue])

  return items.filter((candidate) => {
    const value = valueForMode(candidate, mode)

    if (values.has(value)) return false

    values.add(value)
    return true
  })
}

function createQuestion(item, script, mode, items, rng) {
  const answerValue = valueForMode(item, mode)
  const prompt = mode === 'reverse' ? item.romaji : item.character
  const content = { kind: 'text', text: prompt }

  if (mode !== 'reverse') content.lang = 'ja'

  const question = {
    id: `kana:${script}:${item.id}:${mode}`,
    type: mode === 'typing' ? 'typing' : mode === 'reverse' ? 'reverse_multiple_choice' : 'multiple_choice',
    source: { module: 'kana', itemId: `${script}:${item.id}` },
    instruction: mode === 'reverse' ? 'Pilih kana yang tepat.' : 'Pilih romaji yang tepat.',
    content,
    answer: { value: answerValue, acceptedValues: [answerValue] },
  }

  if (mode === 'typing') {
    question.instruction = 'Ketik romaji yang tepat.'
    return question
  }

  const distractorPool = createUniqueDistractorPool(items, answerValue, mode)
  const distractors = sampleUnique(distractorPool, 3, rng).map((candidate) => createOption(candidate, mode))

  question.options = buildOptions(createOption(item, mode), distractors, rng)
  return question
}

export function createKanaQuiz({ script, mode, count = 10, rng = Math.random }) {
  if (!isSupportedScript(script) || !supportedModes.has(mode) || !Number.isInteger(count) || count < 1) {
    return []
  }

  const items = getAllKana(script)
  const selectedItems = sampleUnique(items, count, rng)

  if (selectedItems.length !== count) return []

  const questions = selectedItems.map((item) => createQuestion(item, script, mode, items, rng))
  return mode === 'typing' || questions.every((question) => question.options.length === 4) ? questions : []
}
