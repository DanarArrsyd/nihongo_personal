const RECENT_HISTORY_LIMIT = 40

function itemKey(itemType, itemId) {
  return `${itemType}:${itemId}`
}

function getAdaptiveScore(question, progressByItem, recentItems, rng) {
  const key = itemKey(question.source.module, question.source.itemId)
  const progress = progressByItem.get(key)
  const attempts = (progress?.correctCount ?? 0) + (progress?.incorrectCount ?? 0)
  const errorRate = attempts > 0 ? (progress?.incorrectCount ?? 0) / attempts : 0.5
  const recentIndex = recentItems.indexOf(key)
  const recentPenalty = recentIndex < 0
    ? 0
    : 3 * (1 - (recentIndex / Math.max(1, recentItems.length)))
  const masteryPenalty = progress?.status === 'mastered' ? 0.35 : 0

  return rng() + (errorRate * 2) - recentPenalty - masteryPenalty
}

export function selectPracticeQuestions({
  questions,
  count,
  progress = [],
  history = [],
  rng = Math.random,
} = {}) {
  if (!Array.isArray(questions) || !Number.isInteger(count) || count < 1 || typeof rng !== 'function') {
    return []
  }

  const uniqueQuestions = [...new Map(
    questions.filter((question) => question?.id).map((question) => [question.id, question]),
  ).values()]
  if (uniqueQuestions.length < count) return []

  const progressByItem = new Map(progress.map((record) => [
    itemKey(record.itemType, record.itemId),
    record,
  ]))
  const recentItems = [...new Set(history
    .slice(0, RECENT_HISTORY_LIMIT)
    .map((record) => itemKey(record.itemType, record.itemId)))]
  const ranked = uniqueQuestions.map((question) => ({
    question,
    score: getAdaptiveScore(question, progressByItem, recentItems, rng),
  }))
  const selected = []
  const moduleCounts = new Map()
  const typeCounts = new Map()

  while (selected.length < count) {
    ranked.sort((left, right) => {
      const moduleDifference = (moduleCounts.get(left.question.source.module) ?? 0)
        - (moduleCounts.get(right.question.source.module) ?? 0)
      if (moduleDifference !== 0) return moduleDifference

      const typeDifference = (typeCounts.get(left.question.type) ?? 0)
        - (typeCounts.get(right.question.type) ?? 0)
      if (typeDifference !== 0) return typeDifference

      return right.score - left.score
    })

    const next = ranked.shift()
    if (!next) return []

    selected.push(next.question)
    moduleCounts.set(
      next.question.source.module,
      (moduleCounts.get(next.question.source.module) ?? 0) + 1,
    )
    typeCounts.set(next.question.type, (typeCounts.get(next.question.type) ?? 0) + 1)
  }

  return selected
}
