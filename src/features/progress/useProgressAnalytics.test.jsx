import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import PersistenceProvider from '../persistence/PersistenceProvider.jsx'
import useProgressAnalytics from './useProgressAnalytics.js'

const now = () => new Date(2026, 9, 7, 12)

function createRepositories() {
  return {
    listDailyMissions: vi.fn().mockResolvedValue([]),
    listDueReviews: vi.fn().mockResolvedValue([{ itemId: 'due-1' }]),
    listProgress: vi.fn().mockResolvedValue([
      { itemType: 'vocabulary', itemId: 'vocab-1', status: 'mastered' },
    ]),
    listQuizHistory: vi.fn().mockResolvedValue([{ result: true }]),
    listReviews: vi.fn().mockResolvedValue([{ lastRating: 'good' }]),
    listStudySessions: vi.fn().mockResolvedValue([]),
  }
}

describe('useProgressAnalytics', () => {
  it('loads one analytics snapshot from persisted repositories', async () => {
    const repositories = createRepositories()
    const wrapper = ({ children }) => <PersistenceProvider>{children}</PersistenceProvider>
    const { result } = renderHook(() => useProgressAnalytics({
      now,
      repositories,
      totals: { kana: 2, vocabulary: 2, kanji: 1, grammar: 1 },
    }), { wrapper })

    await waitFor(() => expect(result.current.status).toBe('ready'))

    expect(result.current.analytics.overall).toMatchObject({ mastered: 1, total: 6 })
    expect(result.current.analytics.dueReviewCount).toBe(1)
    expect(repositories.listDueReviews).toHaveBeenCalledWith(now())
  })
})
