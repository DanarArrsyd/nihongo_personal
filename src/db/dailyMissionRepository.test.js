import { IDBKeyRange, indexedDB } from 'fake-indexeddb'

import { generateDailyMission } from '../features/missions/services/dailyMission.js'
import { createDatabase } from './database.js'
import {
  completeDailyMissionTask,
  getDailyMission,
  getOrCreateDailyMission,
  listDailyMissions,
  startDailyMission,
} from './dailyMissionRepository.js'

const generatedAt = '2026-10-04T01:00:00.000Z'

function createMission(date = '2026-10-04') {
  return generateDailyMission({ date, generatedAt, dueReviews: [] })
}

describe('daily mission repository', () => {
  let database

  beforeEach(async () => {
    database = createDatabase(`daily-mission-test-${crypto.randomUUID()}`, {
      indexedDB,
      IDBKeyRange,
    })
    await database.open()
  })

  afterEach(async () => {
    database.close()
    await database.delete()
  })

  it('creates one mission per date and reuses it without regeneration', async () => {
    const first = createMission()
    const replacement = { ...createMission(), generatedAt: '2026-10-04T03:00:00.000Z' }

    await expect(getOrCreateDailyMission(first, database)).resolves.toEqual(first)
    await expect(getOrCreateDailyMission(replacement, database)).resolves.toEqual(first)
    await expect(database.dailyMissions.count()).resolves.toBe(1)
  })

  it('starts, resumes, and completes persisted mission progress', async () => {
    await getOrCreateDailyMission(createMission(), database)

    const started = await startDailyMission('2026-10-04', '2026-10-04T02:00:00.000Z', database)
    expect(started.status).toBe('in_progress')
    await expect(startDailyMission(
      '2026-10-04',
      '2026-10-04T03:00:00.000Z',
      database,
    )).resolves.toMatchObject({ startedAt: '2026-10-04T02:00:00.000Z' })

    const activeTasks = started.tasks.filter((task) => !task.completed)
    let updated = started
    for (const task of activeTasks) {
      updated = await completeDailyMissionTask({
        date: '2026-10-04',
        taskId: task.id,
        timestamp: '2026-10-04T04:00:00.000Z',
      }, database)
    }

    expect(updated.status).toBe('completed')
    expect(updated.completedAt).toBe('2026-10-04T04:00:00.000Z')
    await expect(getDailyMission('2026-10-04', database)).resolves.toEqual(updated)
  })

  it('creates a fresh mission for the next date', async () => {
    await getOrCreateDailyMission(createMission(), database)
    await getOrCreateDailyMission(createMission('2026-10-05'), database)

    await expect(database.dailyMissions.count()).resolves.toBe(2)
    await expect(listDailyMissions(database)).resolves.toMatchObject([
      { date: '2026-10-05' },
      { date: '2026-10-04' },
    ])
  })
})
