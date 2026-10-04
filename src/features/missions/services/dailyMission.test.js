import {
  generateDailyMission,
  getMissionDate,
  getMissionGroups,
  getMissionProgress,
} from './dailyMission.js'

describe('daily mission service', () => {
  it('uses the local calendar date', () => {
    expect(getMissionDate(new Date(2026, 9, 4, 23, 30))).toBe('2026-10-04')
  })

  it('generates bounded review, new-learning, and practice tasks', () => {
    const mission = generateDailyMission({
      date: '2026-10-04',
      generatedAt: '2026-10-04T01:00:00.000Z',
      dueReviews: Array.from({ length: 20 }, (_, index) => ({ itemId: String(index) })),
      progress: {
        vocabulary: [{ itemId: 'n5-vocab-001', status: 'learning' }],
        kanji: [],
        grammar: [],
      },
    })

    expect(mission.status).toBe('not_started')
    expect(mission.tasks.map(({ id, target }) => [id, target])).toEqual([
      ['review', 15],
      ['vocabulary', 5],
      ['kanji', 2],
      ['grammar', 1],
      ['practice', 10],
    ])
    expect(mission.tasks.find(({ id }) => id === 'vocabulary').itemIds)
      .not.toContain('n5-vocab-001')
  })

  it('completes unavailable zero-target work without hiding remaining tasks', () => {
    const mission = generateDailyMission({
      date: '2026-10-04',
      generatedAt: '2026-10-04T01:00:00.000Z',
      dueReviews: [],
    })

    expect(mission.tasks.find(({ id }) => id === 'review').completed).toBe(true)
    expect(getMissionProgress(mission)).toEqual({ completed: 1, total: 5, percentage: 20 })
    expect(getMissionGroups(mission).map(({ id }) => id)).toEqual(['review', 'learn', 'practice'])
  })
})

