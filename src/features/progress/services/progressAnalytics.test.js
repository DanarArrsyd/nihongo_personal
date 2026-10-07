import { buildProgressAnalytics, getLocalDateKey } from './progressAnalytics.js'

const catalogTotals = { kana: 4, vocabulary: 3, kanji: 2, grammar: 1 }
const now = new Date(2026, 9, 7, 12, 0, 0)

describe('progress analytics', () => {
  it('builds mastery, accuracy, and weekly activity from persisted records', () => {
    const analytics = buildProgressAnalytics({
      catalogTotals,
      now,
      progress: [
        { itemType: 'kana', itemId: 'hiragana:a', status: 'mastered' },
        { itemType: 'vocabulary', itemId: 'vocab-1', status: 'familiar' },
        { itemType: 'kanji', itemId: 'kanji-1', status: 'learning', correctCount: 1 },
      ],
      quizHistory: [
        { result: true },
        { result: true },
        { result: false },
      ],
      reviews: [
        { lastRating: 'good' },
        { lastRating: 'again' },
      ],
      studySessions: [
        {
          sessionId: 'session-1',
          kind: 'quiz',
          module: 'mixed',
          endedAt: new Date(2026, 9, 7, 9).toISOString(),
          duration: 12 * 60000,
          itemCount: 10,
          score: 80,
        },
      ],
    })

    expect(analytics.overall).toEqual({ mastered: 1, percentage: 10, studied: 3, total: 10 })
    expect(analytics.quizAccuracy).toEqual({ correct: 2, percentage: 67, total: 3 })
    expect(analytics.reviewAccuracy).toEqual({ correct: 1, percentage: 50, total: 2 })
    expect(analytics.today).toEqual({ minutes: 12, sessions: 1 })
    expect(analytics.totalSessions).toBe(1)
    expect(analytics.weeklyActivity.at(-1)).toMatchObject({ minutes: 12, sessions: 1 })
    expect(analytics.history[0]).toMatchObject({ label: 'Mixed Quiz', accuracy: 80 })
  })

  it('calculates current and best streak from meaningful sessions and completed missions', () => {
    const analytics = buildProgressAnalytics({
      catalogTotals,
      now,
      dailyMissions: [
        { date: '2026-10-05', status: 'completed' },
        { date: '2026-10-06', status: 'completed' },
      ],
      studySessions: [
        { sessionId: 'old', endedAt: new Date(2026, 8, 20).toISOString(), itemCount: 2 },
        { sessionId: 'today', endedAt: new Date(2026, 9, 7, 10).toISOString(), itemCount: 1 },
        { sessionId: 'ignored', endedAt: new Date(2026, 9, 4, 10).toISOString(), itemCount: 0 },
      ],
    })

    expect(analytics.streak).toEqual({ current: 3, best: 3 })
  })

  it('returns honest zero states without persisted activity', () => {
    const analytics = buildProgressAnalytics({ catalogTotals, now })

    expect(analytics.empty).toBe(true)
    expect(analytics.overall).toEqual({ mastered: 0, percentage: 0, studied: 0, total: 10 })
    expect(analytics.streak).toEqual({ current: 0, best: 0 })
    expect(analytics.weeklyActivity).toHaveLength(7)
    expect(analytics.weeklyActivity.every((day) => day.minutes === 0)).toBe(true)
  })

  it('uses local calendar dates instead of UTC slicing', () => {
    expect(getLocalDateKey(new Date(2026, 9, 7, 23, 30))).toBe('2026-10-07')
  })
})
