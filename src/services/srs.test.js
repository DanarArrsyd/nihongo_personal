import { calculateNextReview } from './srs.js'

const reviewedAt = '2026-10-04T10:00:00.000Z'

describe('SRS review scheduling', () => {
  it.each([
    ['again', 0, 4, '2026-10-04T10:00:00.000Z'],
    ['hard', 1, 3, '2026-10-05T10:00:00.000Z'],
    ['good', 3, 2, '2026-10-07T10:00:00.000Z'],
    ['easy', 7, 1, '2026-10-11T10:00:00.000Z'],
  ])('schedules a first %s rating', (rating, interval, difficulty, dueAt) => {
    expect(calculateNextReview({ rating, reviewedAt })).toEqual({
      difficulty,
      dueAt,
      interval,
    })
  })

  it.each([
    ['again', 5, 0],
    ['hard', 5, 6],
    ['good', 5, 10],
    ['easy', 5, 15],
  ])('grows an existing interval after %s', (rating, previousInterval, interval) => {
    expect(calculateNextReview({ rating, reviewedAt, previousInterval }).interval).toBe(interval)
  })

  it('rejects unsupported ratings and invalid timestamps', () => {
    expect(() => calculateNextReview({ rating: 'unknown', reviewedAt })).toThrow('Unsupported review rating')
    expect(() => calculateNextReview({ rating: 'good', reviewedAt: 'invalid' })).toThrow('Invalid review timestamp')
  })
})

