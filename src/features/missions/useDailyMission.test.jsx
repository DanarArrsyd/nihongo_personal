import { act, renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import PersistenceProvider from '../persistence/PersistenceProvider.jsx'
import useDailyMission from './useDailyMission.js'

const now = () => new Date('2026-10-04T01:00:00.000Z')

function createRepositories() {
  let savedMission = null

  return {
    listDueReviews: vi.fn().mockResolvedValue([]),
    listProgress: vi.fn().mockResolvedValue([]),
    getOrCreateMission: vi.fn(async (mission) => {
      savedMission ??= mission
      return savedMission
    }),
    startMission: vi.fn(async (_date, timestamp) => {
      savedMission = { ...savedMission, status: 'in_progress', startedAt: timestamp }
      return savedMission
    }),
    completeTask: vi.fn(async ({ taskId, timestamp }) => {
      savedMission = {
        ...savedMission,
        tasks: savedMission.tasks.map((task) => (
          task.id === taskId ? { ...task, completed: true, completedAt: timestamp } : task
        )),
      }
      return savedMission
    }),
  }
}

describe('useDailyMission', () => {
  it('loads, starts, and updates mission progress', async () => {
    const repositories = createRepositories()
    const wrapper = ({ children }) => <PersistenceProvider>{children}</PersistenceProvider>
    const { result } = renderHook(() => useDailyMission({ now, repositories }), { wrapper })

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.mission.date).toBe('2026-10-04')

    await act(() => result.current.start())
    expect(result.current.mission.status).toBe('in_progress')

    await act(() => result.current.completeTask('vocabulary'))
    expect(result.current.mission.tasks.find(({ id }) => id === 'vocabulary').completed).toBe(true)
  })
})

