import { buildOptions } from '../services/quizGeneration.js'

const supportedTypes = new Set(['recognition', 'sentence_completion'])
const recognitionOptions = [
  { value: true, label: 'Benar' },
  { value: false, label: 'Salah' },
]

function getParticleToken(item) {
  if (typeof item?.pattern !== 'string' || !item.pattern.startsWith('～')) return null

  const token = item.pattern.slice(1).trim()
  return [...token].length === 1 ? token : null
}

function createRecognitionQuestion({ item, truthItem, rng }) {
  const isTrue = !truthItem || truthItem.id === item.id
  const secondary = (isTrue ? item : truthItem).meaning

  return {
    id: `grammar:${item.id}:recognition`,
    type: 'recognition',
    source: { module: 'grammar', itemId: item.id },
    instruction: 'Apakah pasangan ini benar?',
    content: { kind: 'pair', primary: item.pattern, secondary },
    answer: { value: isTrue, acceptedValues: [isTrue] },
    options: buildOptions(recognitionOptions[0], [recognitionOptions[1]], rng),
  }
}

function createSentenceCompletionQuestion({ item, distractors, rng }) {
  const token = getParticleToken(item)
  if (!token) return null

  const example = item.examples?.find(({ japanese }) => japanese?.includes(token))
  const tokenIndex = example?.japanese.indexOf(token) ?? -1
  if (tokenIndex <= 0 || tokenIndex + token.length >= example.japanese.length) return null

  const distractorTokens = distractors
    .map(getParticleToken)
    .filter((candidate, index, allTokens) => (
      candidate && candidate !== token && allTokens.indexOf(candidate) === index
    ))

  if (distractorTokens.length === 0) return null

  return {
    id: `grammar:${item.id}:sentence_completion`,
    type: 'sentence_completion',
    source: { module: 'grammar', itemId: item.id },
    instruction: 'Pilih partikel yang tepat.',
    content: {
      kind: 'sentence',
      before: example.japanese.slice(0, tokenIndex),
      after: example.japanese.slice(tokenIndex + token.length),
      lang: 'ja',
    },
    answer: { value: token, acceptedValues: [token] },
    options: buildOptions(
      { value: token, label: token, lang: 'ja' },
      distractorTokens.map((value) => ({ value, label: value, lang: 'ja' })),
      rng,
    ),
  }
}

export function createGrammarQuestion({
  item,
  type,
  truthItem,
  distractors = [],
  rng = Math.random,
} = {}) {
  if (!item || !supportedTypes.has(type)) return null

  if (type === 'recognition') return createRecognitionQuestion({ item, truthItem, rng })
  return createSentenceCompletionQuestion({ item, distractors, rng })
}
