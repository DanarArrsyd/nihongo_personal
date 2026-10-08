import { database as defaultDatabase, DATABASE_VERSION } from '../db/database.js'

export const BACKUP_FORMAT = 'nihongo-personal-backup'
export const BACKUP_VERSION = 1
export const MAX_BACKUP_FILE_BYTES = 5 * 1024 * 1024
export const BACKUP_TABLES = [
  'progress',
  'reviews',
  'quizHistory',
  'studySessions',
  'favorites',
  'settings',
  'dailyMissions',
]

const REQUIRED_FIELDS = {
  progress: ['itemType', 'itemId'],
  reviews: ['itemType', 'itemId'],
  quizHistory: ['operationId', 'sessionId', 'questionId', 'itemType', 'itemId'],
  studySessions: ['sessionId'],
  favorites: ['itemType', 'itemId'],
  settings: ['key'],
  dailyMissions: ['date'],
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isNonBlankString(value) {
  return typeof value === 'string' && Boolean(value.trim())
}

function getRecordKey(tableName, record) {
  if (tableName === 'progress' || tableName === 'reviews' || tableName === 'favorites') {
    return `${record.itemType}:${record.itemId}`
  }

  if (tableName === 'quizHistory') return record.operationId
  if (tableName === 'studySessions') return record.sessionId
  if (tableName === 'settings') return record.key
  return record.date
}

function validateTableRecords(tableName, records) {
  if (!Array.isArray(records)) {
    throw new Error(`Data ${tableName} harus berupa daftar.`)
  }

  const keys = new Set()

  records.forEach((record, index) => {
    if (!isRecord(record)) {
      throw new Error(`Data ${tableName} nomor ${index + 1} tidak valid.`)
    }

    for (const field of REQUIRED_FIELDS[tableName]) {
      if (!isNonBlankString(record[field])) {
        throw new Error(`Data ${tableName} nomor ${index + 1} tidak memiliki ${field} yang valid.`)
      }
    }

    const key = getRecordKey(tableName, record)
    if (keys.has(key)) {
      throw new Error(`Data ${tableName} memiliki ID duplikat.`)
    }
    keys.add(key)
  })
}

function validateExportedAt(value) {
  const date = new Date(value)
  if (typeof value !== 'string' || Number.isNaN(date.getTime())) {
    throw new Error('Waktu pembuatan backup tidak valid.')
  }
}

export function validateDataBackup(backup, supportedDatabaseVersion = DATABASE_VERSION) {
  if (!isRecord(backup) || backup.format !== BACKUP_FORMAT) {
    throw new Error('File ini bukan backup Nihongo Personal.')
  }

  if (backup.backupVersion !== BACKUP_VERSION) {
    throw new Error('Versi file backup belum didukung.')
  }

  if (!Number.isInteger(backup.databaseVersion) || backup.databaseVersion < 1) {
    throw new Error('Versi database backup tidak valid.')
  }

  if (backup.databaseVersion > supportedDatabaseVersion) {
    throw new Error('Backup dibuat oleh versi aplikasi yang lebih baru.')
  }

  validateExportedAt(backup.exportedAt)

  if (!isRecord(backup.tables)) {
    throw new Error('Isi file backup tidak lengkap.')
  }

  const unknownTables = Object.keys(backup.tables).filter((tableName) => !BACKUP_TABLES.includes(tableName))
  if (unknownTables.length) {
    throw new Error('File backup memiliki tabel yang tidak dikenal.')
  }

  for (const tableName of BACKUP_TABLES) {
    validateTableRecords(tableName, backup.tables[tableName])
  }

  return backup
}

export function parseDataBackup(rawBackup) {
  if (typeof rawBackup !== 'string') {
    throw new Error('File backup tidak dapat dibaca.')
  }

  if (new TextEncoder().encode(rawBackup).byteLength > MAX_BACKUP_FILE_BYTES) {
    throw new Error('File backup melebihi batas 5 MB.')
  }

  try {
    return validateDataBackup(JSON.parse(rawBackup))
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('File backup bukan JSON yang valid.', { cause: error })
    }
    throw error
  }
}

export function getBackupSummary(backup) {
  const tableCounts = Object.fromEntries(
    BACKUP_TABLES.map((tableName) => [tableName, backup.tables[tableName].length]),
  )

  return {
    exportedAt: backup.exportedAt,
    tableCounts,
    totalRecords: Object.values(tableCounts).reduce((total, count) => total + count, 0),
  }
}

export async function createDataBackup(db = defaultDatabase, now = new Date()) {
  await db.open()

  const tableEntries = await Promise.all(
    BACKUP_TABLES.map(async (tableName) => [tableName, await db.table(tableName).toArray()]),
  )

  return {
    format: BACKUP_FORMAT,
    backupVersion: BACKUP_VERSION,
    databaseVersion: db.verno,
    exportedAt: now.toISOString(),
    tables: Object.fromEntries(tableEntries),
  }
}

export async function restoreDataBackup(backup, db = defaultDatabase) {
  await db.open()
  const validBackup = validateDataBackup(backup, db.verno)
  const tables = BACKUP_TABLES.map((tableName) => db.table(tableName))

  await db.transaction('rw', ...tables, async () => {
    for (const table of tables) await table.clear()

    for (const tableName of BACKUP_TABLES) {
      const records = validBackup.tables[tableName]
      if (records.length) await db.table(tableName).bulkPut(records)
    }
  })

  return getBackupSummary(validBackup)
}
