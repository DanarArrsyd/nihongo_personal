import { database as defaultDatabase } from './database.js'

export async function listFavorites(itemType, db = defaultDatabase) {
  return db.favorites.where('itemType').equals(itemType).toArray()
}

export async function setFavorite({ itemType, itemId, favorite, timestamp }, db = defaultDatabase) {
  if (favorite) {
    await db.favorites.put({ itemType, itemId, updatedAt: timestamp })
  } else {
    await db.favorites.delete([itemType, itemId])
  }

  return favorite
}
