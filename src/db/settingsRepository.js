import { database as defaultDatabase } from './database.js'
import { validateNonBlankString } from './validation.js'

export async function getSetting(key, db = defaultDatabase) {
  const setting = await db.settings.get(key)
  return setting?.value ?? null
}

export async function setSetting(key, value, db = defaultDatabase) {
  validateNonBlankString(key, 'key')

  await db.settings.put({ key, value })
  return value
}
