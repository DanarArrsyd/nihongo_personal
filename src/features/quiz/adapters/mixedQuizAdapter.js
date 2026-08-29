import { getGrammar } from '../../grammar/services/grammarData.js'
import { getAllKana } from '../../kana/services/kanaData.js'
import { getKanji } from '../../kanji/services/kanjiData.js'
import { getVocabulary } from '../../vocabulary/services/vocabularyData.js'
import { sampleUnique, shuffle } from '../services/quizGeneration.js'
import { validateQuiz } from '../services/questionValidation.js'
import { createGrammarQuestion } from './grammarQuizAdapter.js'
import { createKanaQuiz } from './kanaQuizAdapter.js'
import { createKanjiQuestion } from './kanjiQuizAdapter.js'
import { createVocabularyQuestion } from './vocabularyQuizAdapter.js'

const unavailableResult = () => ({ questions: [], error: 'Quiz belum tersedia.' })
const zeroRng = () => 0

function getDefaultSources() {
  return {
    kana: {
      hiragana: getAllKana('hiragana'),
      katakana: getAllKana('katakana'),
    },
    vocabulary: getVocabulary(),
    kanji: getKanji(),
    grammar: getGrammar(),
  }
}

function uniqueBy(items, selectValue) {
  const values = new Set()

  return items.filter((item) => {
    const value = selectValue(item)
    if (value === undefined || value === null || value === '' || values.has(value)) return false

    values.add(value)
    return true
  })
}

function selectDistractors(items, item, field, rng) {
  const pool = uniqueBy(
    items.filter((candidate) => candidate.id !== item.id && candidate[field] !== item[field]),
    (candidate) => candidate[field],
  )

  return sampleUnique(pool, 3, rng)
}

function createVocabularySlots(items, rng) {
  if (!Array.isArray(items)) return []

  const validItems = items.filter((item) => (
    item?.id && item.word && item.reading && item.romaji && item.meaning
  ))
  const selectedItems = sampleUnique(validItems, 3, rng)
  if (selectedItems.length !== 3) return []

  const types = ['multiple_choice', 'reverse_multiple_choice', 'typing']
  return selectedItems.map((item, index) => {
    const field = types[index] === 'reverse_multiple_choice' ? 'word' : 'meaning'
    const distractors = types[index] === 'typing'
      ? []
      : selectDistractors(validItems, item, field, rng)

    if (types[index] !== 'typing' && distractors.length !== 3) return null

    return createVocabularyQuestion({ item, type: types[index], distractors, rng })
  })
}

function createKanjiSlots(items, rng) {
  if (!Array.isArray(items)) return []

  const validItems = items.filter((item) => (
    item?.id
    && item.kanji
    && Array.isArray(item.meaning)
    && item.meaning[0]
    && Array.isArray(item.onyomi)
    && item.onyomi[0]
    && Array.isArray(item.kunyomi)
  ))
  const selectedItems = sampleUnique(validItems, 2, rng)
  if (selectedItems.length !== 2) return []

  return [
    createKanjiQuestion({ item: selectedItems[0], type: 'typing', rng }),
    createKanjiQuestion({
      item: selectedItems[1],
      type: 'recognition',
      truthItem: selectedItems[0],
      rng,
    }),
  ]
}

function getCompletionCandidates(items) {
  return uniqueBy(
    items.map((item) => ({
      item,
      question: createGrammarQuestion({
        item,
        type: 'sentence_completion',
        distractors: items,
        rng: zeroRng,
      }),
    })).filter(({ question }) => question),
    ({ question }) => question.answer.value,
  )
}

function createGrammarSlots(items, rng) {
  if (!Array.isArray(items)) return []

  const recognitionItems = items.filter((item) => item?.id && item.pattern && item.meaning)
  const completionCandidates = getCompletionCandidates(recognitionItems)
  const selectedCompletions = sampleUnique(completionCandidates, 2, rng)
  if (selectedCompletions.length !== 2) return []

  const usedIds = new Set(selectedCompletions.map(({ item }) => item.id))
  const recognitionPool = recognitionItems.filter((item) => !usedIds.has(item.id))
  const [recognitionItem, truthItem] = sampleUnique(recognitionPool, 2, rng)
  if (!recognitionItem || !truthItem) return []

  const completionQuestions = selectedCompletions.map(({ item }) => {
    const distractors = sampleUnique(
      completionCandidates
        .filter((candidate) => candidate.item.id !== item.id)
        .map((candidate) => candidate.item),
      3,
      rng,
    )

    if (distractors.length !== 3) return null
    return createGrammarQuestion({ item, type: 'sentence_completion', distractors, rng })
  })

  return [
    createGrammarQuestion({
      item: recognitionItem,
      type: 'recognition',
      truthItem,
      rng,
    }),
    ...completionQuestions,
  ]
}

function createKanaSlots(kanaSources, rng) {
  if (!kanaSources || !Array.isArray(kanaSources.hiragana) || !Array.isArray(kanaSources.katakana)) {
    return []
  }

  return [
    createKanaQuiz({
      script: 'hiragana',
      mode: 'recognition',
      count: 1,
      rng,
      items: kanaSources.hiragana,
    })[0],
    createKanaQuiz({
      script: 'katakana',
      mode: 'reverse',
      count: 1,
      rng,
      items: kanaSources.katakana,
    })[0],
  ]
}

function addMixedId(question, index) {
  return {
    ...question,
    id: `mixed-${question.source.module}-${question.source.itemId}-${question.type}-${index + 1}`,
  }
}

export function createMixedQuiz({ rng = Math.random, sources } = {}) {
  if (typeof rng !== 'function') return unavailableResult()

  const resolvedSources = sources === undefined ? getDefaultSources() : sources
  if (!resolvedSources || typeof resolvedSources !== 'object') return unavailableResult()

  const questions = [
    ...createKanaSlots(resolvedSources.kana, rng),
    ...createVocabularySlots(resolvedSources.vocabulary, rng),
    ...createKanjiSlots(resolvedSources.kanji, rng),
    ...createGrammarSlots(resolvedSources.grammar, rng),
  ]

  if (questions.length !== 10 || questions.some((question) => !question)) return unavailableResult()

  const mixedQuestions = shuffle(questions.map(addMixedId), rng)
  return validateQuiz(mixedQuestions).valid
    ? { questions: mixedQuestions, error: null }
    : unavailableResult()
}
