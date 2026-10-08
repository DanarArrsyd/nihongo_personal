import { IDBKeyRange, indexedDB } from 'fake-indexeddb'
import { createDatabase } from '../db/database.js'
import {
  BACKUP_FORMAT,
  BACKUP_TABLES,
  BACKUP_VERSION,
  createDataBackup,
  getBackupSummary,
  parseDataBackup,
  restoreDataBackup,
  validateDataBackup,
} from './dataBackup.js'

function backupWith(tableRecords = {}) {
  return {
    format: BACKUP_FORMAT,
    backupVersion: BACKUP_VERSION,
    databaseVersion: 2,
    exportedAt: '2026-10-08T02:00:00.000Z',
    tables: Object.fromEntries(
      BACKUP_TABLES.map((tableName) => [tableName, tableRecords[tableName] ?? []]),
    ),
  }
}

describe('dataBackup', () => {
  let database

  beforeEach(async () => {
    database = createDatabase(`nihongo-personal-backup-test-${crypto.randomUUID()}`, {
      indexedDB,
      IDBKeyRange,
    })
    await database.open()
  })

  afterEach(async () => {
    database.close()
    await database.delete()
  })

  it('exports every user-data table with portable metadata', async () => {
    await database.progress.put({ itemType: 'vocabulary', itemId: 'n5-vocab-001', status: 'learning' })
    await database.favorites.put({ itemType: 'vocabulary', itemId: 'n5-vocab-001', updatedAt: null })
    await database.settings.put({ key: 'dailyGoal', value: 20 })

    const backup = await createDataBackup(database, new Date('2026-10-08T02:00:00.000Z'))

    expect(backup).toMatchObject({
      format: BACKUP_FORMAT,
      backupVersion: BACKUP_VERSION,
      databaseVersion: 2,
      exportedAt: '2026-10-08T02:00:00.000Z',
    })
    expect(Object.keys(backup.tables)).toEqual(BACKUP_TABLES)
    expect(backup.tables.progress).toHaveLength(1)
    expect(backup.tables.favorites).toHaveLength(1)
    expect(backup.tables.settings).toHaveLength(1)
    expect(getBackupSummary(backup).totalRecords).toBe(3)
  })

  it('validates JSON, compatibility, required IDs, and duplicate records', () => {
    expect(() => parseDataBackup('{broken')).toThrow('File backup bukan JSON yang valid.')
    expect(() => validateDataBackup({ ...backupWith(), databaseVersion: 99 })).toThrow(
      'Backup dibuat oleh versi aplikasi yang lebih baru.',
    )
    expect(() => validateDataBackup(backupWith({ progress: [{}] }))).toThrow(
      'Data progress nomor 1 tidak memiliki itemType yang valid.',
    )

    const duplicate = { itemType: 'vocabulary', itemId: 'n5-vocab-001' }
    expect(() => validateDataBackup(backupWith({ progress: [duplicate, duplicate] }))).toThrow(
      'Data progress memiliki ID duplikat.',
    )
  })

  it('replaces current data only after the whole backup is valid', async () => {
    await database.progress.put({ itemType: 'vocabulary', itemId: 'old-item', status: 'mastered' })

    const backup = backupWith({
      progress: [{ itemType: 'kanji', itemId: 'n5-kanji-001', status: 'learning' }],
      favorites: [{ itemType: 'kanji', itemId: 'n5-kanji-001', updatedAt: null }],
      settings: [{ key: 'dailyGoal', value: 25 }],
    })

    const summary = await restoreDataBackup(backup, database)

    await expect(database.progress.get(['vocabulary', 'old-item'])).resolves.toBeUndefined()
    await expect(database.progress.get(['kanji', 'n5-kanji-001'])).resolves.toMatchObject({ status: 'learning' })
    await expect(database.favorites.get(['kanji', 'n5-kanji-001'])).resolves.toBeTruthy()
    await expect(database.settings.get('dailyGoal')).resolves.toMatchObject({ value: 25 })
    expect(summary.totalRecords).toBe(3)
  })

  it('rolls back cleared tables when an unexpected write fails', async () => {
    const original = { itemType: 'vocabulary', itemId: 'old-item', status: 'mastered' }
    await database.progress.put(original)

    const backup = backupWith({
      progress: [{ itemType: 'kanji', itemId: 'n5-kanji-001', status: 'learning' }],
      quizHistory: [{
        operationId: 'session-1:question-1',
        sessionId: 'session-1',
        questionId: 'question-1',
        itemType: 'kanji',
        itemId: 'n5-kanji-001',
      }],
    })
    const failWrite = () => {
      throw new Error('simulated write failure')
    }
    database.quizHistory.hook('creating', failWrite)

    await expect(restoreDataBackup(backup, database)).rejects.toThrow('simulated write failure')
    await expect(database.progress.get(['vocabulary', 'old-item'])).resolves.toMatchObject(original)
    await expect(database.progress.get(['kanji', 'n5-kanji-001'])).resolves.toBeUndefined()

    database.quizHistory.hook('creating').unsubscribe(failWrite)
  })
})
