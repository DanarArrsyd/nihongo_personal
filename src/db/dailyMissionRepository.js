import { database as defaultDatabase } from './database.js'
import { normalizeRequiredTimestamp, validateNonBlankString } from './validation.js'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function validateDate(date) {
  if (typeof date !== 'string' || !DATE_PATTERN.test(date)) {
    throw new Error('date must use YYYY-MM-DD')
  }
}

function validateMission(mission) {
  validateDate(mission?.date)
  normalizeRequiredTimestamp(mission.generatedAt, 'generatedAt')
  normalizeRequiredTimestamp(mission.updatedAt, 'updatedAt')

  if (!Array.isArray(mission.tasks) || mission.tasks.length === 0) {
    throw new Error('mission tasks are required')
  }
}

export async function getDailyMission(date, db = defaultDatabase) {
  validateDate(date)
  return (await db.dailyMissions.get(date)) ?? null
}

export async function listDailyMissions(db = defaultDatabase) {
  return db.dailyMissions.orderBy('date').reverse().toArray()
}

export async function getOrCreateDailyMission(mission, db = defaultDatabase) {
  validateMission(mission)

  return db.transaction('rw', db.dailyMissions, async () => {
    const existingMission = await db.dailyMissions.get(mission.date)
    if (existingMission) return existingMission

    await db.dailyMissions.add(mission)
    return mission
  })
}

export async function startDailyMission(date, timestamp, db = defaultDatabase) {
  validateDate(date)
  const startedAt = normalizeRequiredTimestamp(timestamp)

  return db.transaction('rw', db.dailyMissions, async () => {
    const mission = await db.dailyMissions.get(date)
    if (!mission) throw new Error('Daily mission not found')
    if (mission.status !== 'not_started') return mission

    const updated = {
      ...mission,
      status: 'in_progress',
      startedAt,
      updatedAt: startedAt,
    }
    await db.dailyMissions.put(updated)
    return updated
  })
}

export async function completeDailyMissionTask({ date, taskId, timestamp }, db = defaultDatabase) {
  validateDate(date)
  validateNonBlankString(taskId, 'taskId')
  const completedAt = normalizeRequiredTimestamp(timestamp)

  return db.transaction('rw', db.dailyMissions, async () => {
    const mission = await db.dailyMissions.get(date)
    if (!mission) throw new Error('Daily mission not found')
    if (mission.status === 'not_started') throw new Error('Daily mission has not started')

    let taskFound = false
    const tasks = mission.tasks.map((task) => {
      if (task.id !== taskId) return task
      taskFound = true
      return task.completed ? task : { ...task, completed: true, completedAt }
    })

    if (!taskFound) throw new Error('Daily mission task not found')

    const isCompleted = tasks.every((task) => task.completed)
    const updated = {
      ...mission,
      tasks,
      status: isCompleted ? 'completed' : 'in_progress',
      completedAt: isCompleted ? completedAt : null,
      updatedAt: completedAt,
    }
    await db.dailyMissions.put(updated)
    return updated
  })
}
