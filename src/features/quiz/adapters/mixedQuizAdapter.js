import { getGrammar } from '../../grammar/services/grammarData.js'
import { getAllKana } from '../../kana/services/kanaData.js'
import { getKanji } from '../../kanji/services/kanjiData.js'
import { selectPracticeQuestions } from '../../practice/services/practiceSelection.js'
import { getVocabulary } from '../../vocabulary/services/vocabularyData.js'
import { sampleUnique, shuffle } from '../services/quizGeneration.js'
import { validateQuiz } from '../services/questionValidation.js'
import { createGrammarQuestion } from './grammarQuizAdapter.js'
import { createKanaQuiz } from './kanaQuizAdapter.js'
import { createKanjiQuestion } from './kanjiQuizAdapter.js'
import { createVocabularyQuestion } from './vocabularyQuizAdapter.js'

export const MIXED_QUIZ_MODULES = ['kana', 'vocabulary', 'kanji', 'grammar']
export const MIXED_QUIZ_TYPES = [
  'multiple_choice',
  'reverse_multiple_choice',
  'typing',
  'recognition',
  'sentence_completion',
]
export const MIXED_QUIZ_COUNTS = [10, 20, 30]

const unavailableResult = () => ({ questions: [], error: 'Quiz belum tersedia untuk pilihan ini.' })

// Avoid interchangeable location/direction particles and topic/object alternatives.
const particleDistractors = {
  '～は': ['を', 'の', 'に'],
  '～も': ['を', 'の', 'に'],
  '～の': ['を', 'へ', 'が'],
  '～を': ['の', 'へ', 'に'],
  '～に': ['の', 'を', 'と'],
  '～で': ['の', 'を', 'へ'],
  '～へ': ['の', 'を', 'と'],
  '～と': ['の', 'を', 'が'],
}

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
  return sampleUnique(uniqueBy(
    items.filter((candidate) => candidate.id !== item.id && candidate[field] !== item[field]),
    (candidate) => candidate[field],
  ), 3, rng)
}

function selectFalseTruthItem(items, item, selectMeaning, rng) {
  return sampleUnique(items.filter((candidate) => (
    candidate.id !== item.id && selectMeaning(candidate) !== selectMeaning(item)
  )), 1, rng)[0]
}

function createKanaPool(kanaSources, rng) {
  if (!kanaSources || !Array.isArray(kanaSources.hiragana) || !Array.isArray(kanaSources.katakana)) return []

  return ['hiragana', 'katakana'].flatMap((script) => (
    ['recognition', 'reverse', 'typing'].flatMap((mode) => createKanaQuiz({
      script,
      mode,
      count: kanaSources[script].length,
      rng,
      items: kanaSources[script],
    }))
  ))
}

function createVocabularyPool(items, rng) {
  if (!Array.isArray(items)) return []
  const validItems = items.filter((item) => item?.id && item.word && item.reading && item.romaji && item.meaning)

  return validItems.flatMap((item) => {
    const falseTruthItem = selectFalseTruthItem(validItems, item, (candidate) => candidate.meaning, rng)
    const questions = [
      ['multiple_choice', selectDistractors(validItems, item, 'meaning', rng)],
      ['reverse_multiple_choice', selectDistractors(validItems, item, 'word', rng)],
      ['typing', []],
    ].map(([type, distractors]) => (
      type !== 'typing' && distractors.length !== 3
        ? null
        : createVocabularyQuestion({ item, type, distractors, rng })
    ))

    if (falseTruthItem) {
      questions.push(createVocabularyQuestion({ item, type: 'recognition', truthItem: falseTruthItem, rng }))
    }
    return questions.filter(Boolean)
  })
}

function createKanjiPool(items, rng) {
  if (!Array.isArray(items)) return []
  const validItems = items.filter((item) => (
    item?.id && item.kanji && item.meaning?.[0] && item.onyomi?.[0] && Array.isArray(item.kunyomi)
  ))

  return validItems.flatMap((item) => {
    const falseTruthItem = selectFalseTruthItem(validItems, item, (candidate) => candidate.meaning[0], rng)
    const questions = [createKanjiQuestion({ item, type: 'typing', rng })]
    if (falseTruthItem) {
      questions.push(createKanjiQuestion({ item, type: 'recognition', truthItem: falseTruthItem, rng }))
    }
    return questions.filter(Boolean)
  })
}

function createGrammarPool(items, rng) {
  if (!Array.isArray(items)) return []
  const validItems = items.filter((item) => item?.id && item.pattern && item.meaning)

  return validItems.flatMap((item) => {
    const falseTruthItem = selectFalseTruthItem(validItems, item, (candidate) => candidate.meaning, rng)
    const completionIndexes = Array.isArray(item.completionExercises)
      ? item.completionExercises.map((_, index) => index)
      : [0]
    const questions = completionIndexes.map((completionIndex) => createGrammarQuestion({
      item,
      completionIndex,
      type: 'sentence_completion',
      distractors: particleDistractors[item.pattern]?.map((token) => ({ pattern: `～${token}` })) ?? sampleUnique(
        validItems.filter((candidate) => candidate.id !== item.id),
        3,
        rng,
      ),
      rng,
    }))
    if (falseTruthItem) {
      questions.push(createGrammarQuestion({ item, type: 'recognition', truthItem: falseTruthItem, rng }))
    }
    return questions.filter(Boolean)
  })
}

function addMixedId(question) {
  return { ...question, id: `mixed-${question.id.replaceAll(':', '-')}` }
}

export function createMixedQuiz({
  count = 10,
  modules = MIXED_QUIZ_MODULES,
  questionTypes = MIXED_QUIZ_TYPES,
  progress = [],
  history = [],
  rng = Math.random,
  sources,
} = {}) {
  if (
    typeof rng !== 'function'
    || !MIXED_QUIZ_COUNTS.includes(count)
    || !Array.isArray(modules)
    || !Array.isArray(questionTypes)
  ) return unavailableResult()

  const selectedModules = new Set(modules.filter((module) => MIXED_QUIZ_MODULES.includes(module)))
  const selectedTypes = new Set(questionTypes.filter((type) => MIXED_QUIZ_TYPES.includes(type)))
  if (selectedModules.size === 0 || selectedTypes.size === 0) return unavailableResult()

  const resolvedSources = sources === undefined ? getDefaultSources() : sources
  if (!resolvedSources || typeof resolvedSources !== 'object') return unavailableResult()

  const pool = [
    ...createKanaPool(resolvedSources.kana, rng),
    ...createVocabularyPool(resolvedSources.vocabulary, rng),
    ...createKanjiPool(resolvedSources.kanji, rng),
    ...createGrammarPool(resolvedSources.grammar, rng),
  ].filter((question) => (
    question
    && selectedModules.has(question.source.module)
    && selectedTypes.has(question.type)
  )).map(addMixedId)

  const selectedQuestions = selectPracticeQuestions({ questions: pool, count, progress, history, rng })
  if (selectedQuestions.length !== count) return unavailableResult()

  const questions = shuffle(selectedQuestions, rng)
  return validateQuiz(questions).valid ? { questions, error: null } : unavailableResult()
}
