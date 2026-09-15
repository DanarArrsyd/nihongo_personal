import { database as defaultDatabase } from './database.js'
import { normalizeTimestamp, validateBoolean, validateItemIdentifiers } from './validation.js'

export async function listFavorites(itemType, db = defaultDatabase) {
  return db.favorites.where('itemType').equals(itemType).toArray()
}

export async function setFavorite({ itemType, itemId, favorite, timestamp }, db = defaultDatabase) {
  validateItemIdentifiers(itemType, itemId)
  validateBoolean(favorite, 'favorite')

  if (favorite) {
    await db.favorites.put({ itemType, itemId, updatedAt: normalizeTimestamp(timestamp) })
  } else {
    await db.favorites.delete([itemType, itemId])
  }

  return favorite
}
