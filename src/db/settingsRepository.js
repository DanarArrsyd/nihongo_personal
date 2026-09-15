import { database as defaultDatabase } from './database.js'

export async function getSetting(key, db = defaultDatabase) {
  const setting = await db.settings.get(key)
  return setting?.value ?? null
}

export async function setSetting(key, value, db = defaultDatabase) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('key must be a non-blank string')
  }

  await db.settings.put({ key, value })
  return value
}
