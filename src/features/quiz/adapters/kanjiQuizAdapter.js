import { buildOptions } from '../services/quizGeneration.js'

const supportedTypes = new Set(['typing', 'recognition'])
const recognitionOptions = [
  { value: true, label: 'Benar' },
  { value: false, label: 'Salah' },
]

function createRecognitionQuestion({ item, truthItem, rng }) {
  const isTrue = !truthItem || truthItem.id === item.id
  const secondary = (isTrue ? item : truthItem).meaning[0]

  return {
    id: `kanji:${item.id}:recognition`,
    type: 'recognition',
    source: { module: 'kanji', itemId: item.id },
    instruction: 'Apakah pasangan ini benar?',
    content: { kind: 'pair', primary: item.kanji, secondary },
    answer: { value: isTrue, acceptedValues: [isTrue] },
    options: buildOptions(recognitionOptions[0], [recognitionOptions[1]], rng),
  }
}

export function createKanjiQuestion({ item, type, truthItem, rng = Math.random } = {}) {
  if (!item || !supportedTypes.has(type)) return null

  if (type === 'recognition') return createRecognitionQuestion({ item, truthItem, rng })

  const acceptedValues = [
    ...item.onyomi,
    ...item.kunyomi.map((reading) => reading.replaceAll('.', '')),
  ]

  return {
    id: `kanji:${item.id}:typing`,
    type,
    source: { module: 'kanji', itemId: item.id },
    instruction: 'Ketik bacaan yang tepat.',
    content: { kind: 'text', text: item.kanji, lang: 'ja' },
    answer: { value: item.onyomi[0], acceptedValues },
  }
}
