import { buildOptions } from '../services/quizGeneration.js'

const supportedTypes = new Set([
  'multiple_choice',
  'reverse_multiple_choice',
  'typing',
  'recognition',
])

const recognitionOptions = [
  { value: true, label: 'Benar' },
  { value: false, label: 'Salah' },
]

function createOption(item, field, lang) {
  const value = item[field]
  return lang ? { value, label: value, lang } : { value, label: value }
}

function createChoiceQuestion({ item, type, distractors, rng }) {
  const isReverse = type === 'reverse_multiple_choice'
  const answerField = isReverse ? 'word' : 'meaning'
  const promptField = isReverse ? 'meaning' : 'word'
  const optionLang = isReverse ? 'ja' : undefined
  const answerValue = item[answerField]

  return {
    id: `vocabulary:${item.id}:${type}`,
    type,
    source: { module: 'vocabulary', itemId: item.id },
    instruction: isReverse ? 'Pilih kata Jepang yang tepat.' : 'Pilih arti yang tepat.',
    content: optionLang
      ? { kind: 'text', text: item[promptField] }
      : { kind: 'text', text: item[promptField], lang: 'ja' },
    answer: { value: answerValue, acceptedValues: [answerValue] },
    options: buildOptions(
      createOption(item, answerField, optionLang),
      distractors.map((candidate) => createOption(candidate, answerField, optionLang)),
      rng,
    ),
  }
}

function createRecognitionQuestion({ item, truthItem, rng }) {
  const isTrue = !truthItem || truthItem.id === item.id
  const secondary = (isTrue ? item : truthItem).meaning

  return {
    id: `vocabulary:${item.id}:recognition`,
    type: 'recognition',
    source: { module: 'vocabulary', itemId: item.id },
    instruction: 'Apakah pasangan ini benar?',
    content: { kind: 'pair', primary: item.word, secondary },
    answer: { value: isTrue, acceptedValues: [isTrue] },
    options: buildOptions(recognitionOptions[0], [recognitionOptions[1]], rng),
  }
}

export function createVocabularyQuestion({ item, type, distractors = [], truthItem, rng = Math.random } = {}) {
  if (!item || !supportedTypes.has(type)) return null

  if (type === 'typing') {
    return {
      id: `vocabulary:${item.id}:typing`,
      type,
      source: { module: 'vocabulary', itemId: item.id },
      instruction: 'Ketik bacaan yang tepat.',
      content: { kind: 'text', text: item.word, lang: 'ja' },
      answer: { value: item.reading, acceptedValues: [item.reading, item.romaji] },
    }
  }

  if (type === 'recognition') return createRecognitionQuestion({ item, truthItem, rng })

  return createChoiceQuestion({ item, type, distractors, rng })
}
