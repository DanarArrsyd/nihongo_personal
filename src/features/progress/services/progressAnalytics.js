const MODULE_ORDER = ['kana', 'vocabulary', 'kanji', 'grammar']

const MODULE_META = {
  kana: { label: 'Kana', japanese: 'かな' },
  vocabulary: { label: 'Vocabulary', japanese: '言葉' },
  kanji: { label: 'Kanji', japanese: '漢字' },
  grammar: { label: 'Grammar', japanese: '文法' },
}

const SESSION_MODULE_LABELS = {
  grammar: 'Grammar',
  kanji: 'Kanji',
  mixed: 'Mixed Quiz',
  review: 'Review',
  vocabulary: 'Vocabulary',
}

function percentage(value, total) {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

function toDate(value) {
  const date = value instanceof Date ? new Date(value) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function getLocalDateKey(value) {
  const date = toDate(value)
  if (!date) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateFromKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addDays(date, amount) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function isStudied(record) {
  return record.status !== 'new'
    || Boolean(record.lastStudiedAt)
    || (record.correctCount ?? 0) > 0
    || (record.incorrectCount ?? 0) > 0
}

function createModules(progress, catalogTotals) {
  return MODULE_ORDER.map((id) => {
    const records = progress.filter((record) => record.itemType === id)
    const total = catalogTotals[id] ?? 0
    const studied = records.filter(isStudied).length
    const mastered = records.filter((record) => record.status === 'mastered').length

    return {
      id,
      ...MODULE_META[id],
      mastered,
      percentage: percentage(mastered, total),
      studied,
      total,
    }
  })
}

function createAccuracy(records, predicate) {
  const eligible = records.filter(predicate)
  const correct = eligible.filter((record) => record.result === true).length

  return {
    correct,
    percentage: percentage(correct, eligible.length),
    total: eligible.length,
  }
}

function createReviewAccuracy(reviews) {
  const rated = reviews.filter((review) => review.lastRating)
  const successful = rated.filter((review) => ['good', 'easy'].includes(review.lastRating)).length

  return {
    correct: successful,
    percentage: percentage(successful, rated.length),
    total: rated.length,
  }
}

function createWeeklyActivity(studySessions, now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return Array.from({ length: 7 }, (_, index) => addDays(today, index - 6)).map((date) => {
    const dateKey = getLocalDateKey(date)
    const sessions = studySessions.filter((session) => getLocalDateKey(session.endedAt) === dateKey)
    const duration = sessions.reduce((total, session) => total + (session.duration ?? 0), 0)

    return {
      date: dateKey,
      day: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date),
      minutes: Math.round(duration / 60000),
      sessions: sessions.length,
    }
  })
}

function createStreak(studySessions, dailyMissions, now) {
  const activityDates = new Set([
    ...studySessions
      .filter((session) => (session.itemCount ?? 0) > 0)
      .map((session) => getLocalDateKey(session.endedAt))
      .filter(Boolean),
    ...dailyMissions
      .filter((mission) => mission.status === 'completed')
      .map((mission) => mission.date),
  ])

  const todayKey = getLocalDateKey(now)
  const yesterday = addDays(dateFromKey(todayKey), -1)
  let cursor = activityDates.has(todayKey) ? dateFromKey(todayKey) : yesterday
  let current = 0

  while (activityDates.has(getLocalDateKey(cursor))) {
    current += 1
    cursor = addDays(cursor, -1)
  }

  const sortedDates = [...activityDates].sort()
  let best = 0
  let run = 0
  let previous = null

  sortedDates.forEach((dateKey) => {
    const currentDate = dateFromKey(dateKey)
    const consecutive = previous
      && getLocalDateKey(addDays(previous, 1)) === dateKey

    run = consecutive ? run + 1 : 1
    best = Math.max(best, run)
    previous = currentDate
  })

  return { best, current }
}

function createHistory(studySessions) {
  return [...studySessions]
    .filter((session) => toDate(session.endedAt))
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
    .slice(0, 10)
    .map((session) => {
      const module = typeof session.module === 'string' ? session.module : 'study'

      return {
        accuracy: Number.isFinite(session.score) ? session.score : null,
        date: session.endedAt,
        durationMinutes: Math.round((session.duration ?? 0) / 60000),
        id: session.sessionId,
        itemCount: session.itemCount ?? 0,
        kind: session.kind,
        label: module.startsWith('kana:')
          ? 'Kana Practice'
          : (SESSION_MODULE_LABELS[module] ?? module),
        module,
      }
    })
}

export function buildProgressAnalytics({
  catalogTotals,
  dailyMissions = [],
  dueReviews = [],
  now = new Date(),
  progress = [],
  quizHistory = [],
  reviews = [],
  studySessions = [],
}) {
  const currentDate = toDate(now) ?? new Date()
  const modules = createModules(progress, catalogTotals)
  const total = modules.reduce((sum, module) => sum + module.total, 0)
  const mastered = modules.reduce((sum, module) => sum + module.mastered, 0)
  const studied = modules.reduce((sum, module) => sum + module.studied, 0)
  const weeklyActivity = createWeeklyActivity(studySessions, currentDate)
  const todayKey = getLocalDateKey(currentDate)
  const todaySessions = studySessions.filter((session) => getLocalDateKey(session.endedAt) === todayKey)

  return {
    dueReviewCount: dueReviews.length,
    empty: progress.length === 0 && studySessions.length === 0 && quizHistory.length === 0,
    history: createHistory(studySessions),
    modules,
    overall: {
      mastered,
      percentage: percentage(mastered, total),
      studied,
      total,
    },
    quizAccuracy: createAccuracy(quizHistory, () => true),
    reviewAccuracy: createReviewAccuracy(reviews),
    streak: createStreak(studySessions, dailyMissions, currentDate),
    today: {
      minutes: Math.round(todaySessions.reduce((sum, session) => sum + (session.duration ?? 0), 0) / 60000),
      sessions: todaySessions.length,
    },
    totalSessions: studySessions.length,
    weeklyActivity,
  }
}
