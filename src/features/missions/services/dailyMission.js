import { getGrammar } from '../../grammar/services/grammarData.js'
import { getKanji } from '../../kanji/services/kanjiData.js'
import { getVocabulary } from '../../vocabulary/services/vocabularyData.js'

const missionTargets = {
  review: 15,
  vocabulary: 5,
  kanji: 2,
  grammar: 1,
  practice: 10,
}

function padDatePart(value) {
  return String(value).padStart(2, '0')
}

export function getMissionDate(date = new Date()) {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join('-')
}

function isStudied(record) {
  return record
    && (record.status !== 'new'
      || Boolean(record.lastStudiedAt)
      || record.correctCount > 0
      || record.incorrectCount > 0)
}

function selectNewItems(items, progress, count) {
  const progressById = new Map(progress.map((record) => [record.itemId, record]))
  return items
    .filter((item) => !isStudied(progressById.get(item.id)))
    .slice(0, count)
    .map((item) => item.id)
}

function createTask({ id, itemIds = [], route, target, title, type, unit }) {
  return {
    id,
    type,
    title,
    route,
    target,
    unit,
    itemIds,
    completed: target === 0,
    completedAt: null,
  }
}

export function generateDailyMission({
  date,
  dueReviews = [],
  generatedAt,
  progress = {},
} = {}) {
  const vocabularyIds = selectNewItems(
    getVocabulary(),
    progress.vocabulary ?? [],
    missionTargets.vocabulary,
  )
  const kanjiIds = selectNewItems(getKanji(), progress.kanji ?? [], missionTargets.kanji)
  const grammarIds = selectNewItems(getGrammar(), progress.grammar ?? [], missionTargets.grammar)

  const tasks = [
    createTask({
      id: 'review',
      type: 'review',
      title: 'Review jatuh tempo',
      route: '/review',
      target: Math.min(dueReviews.length, missionTargets.review),
      unit: 'item',
    }),
    createTask({
      id: 'vocabulary',
      type: 'learn',
      title: 'Vocabulary baru',
      route: '/learn/vocabulary',
      target: vocabularyIds.length,
      unit: 'kata',
      itemIds: vocabularyIds,
    }),
    createTask({
      id: 'kanji',
      type: 'learn',
      title: 'Kanji baru',
      route: '/learn/kanji',
      target: kanjiIds.length,
      unit: 'kanji',
      itemIds: kanjiIds,
    }),
    createTask({
      id: 'grammar',
      type: 'learn',
      title: 'Grammar baru',
      route: '/learn/grammar',
      target: grammarIds.length,
      unit: 'pola',
      itemIds: grammarIds,
    }),
    createTask({
      id: 'practice',
      type: 'practice',
      title: 'Mixed Quiz',
      route: '/practice/mixed',
      target: missionTargets.practice,
      unit: 'soal',
    }),
  ]
  const completed = tasks.every((task) => task.completed)

  return {
    date,
    generatedAt,
    updatedAt: generatedAt,
    startedAt: null,
    completedAt: completed ? generatedAt : null,
    status: completed ? 'completed' : 'not_started',
    tasks,
  }
}

export function getMissionProgress(mission) {
  const tasks = mission?.tasks ?? []
  const completed = tasks.filter((task) => task.completed).length

  return {
    completed,
    total: tasks.length,
    percentage: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100),
  }
}

export function getMissionGroups(mission) {
  const tasks = mission?.tasks ?? []
  const getTask = (id) => tasks.find((task) => task.id === id)
  const learnTasks = ['vocabulary', 'kanji', 'grammar'].map(getTask).filter(Boolean)

  return [
    {
      id: 'review',
      label: 'Review',
      description: 'Perkuat materi yang sudah waktunya diulang.',
      completed: Boolean(getTask('review')?.completed),
      items: [getTask('review')].filter(Boolean),
    },
    {
      id: 'learn',
      label: 'Learn',
      description: 'Tambah materi baru dalam porsi kecil.',
      completed: learnTasks.every((task) => task.completed),
      items: learnTasks,
    },
    {
      id: 'practice',
      label: 'Practice',
      description: 'Tutup sesi dengan active recall.',
      completed: Boolean(getTask('practice')?.completed),
      items: [getTask('practice')].filter(Boolean),
    },
  ]
}

