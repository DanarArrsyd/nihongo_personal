import { IDBKeyRange, indexedDB } from 'fake-indexeddb'

import { createDatabase } from './database.js'
import { listFavorites, setFavorite } from './favoritesRepository.js'

describe('favorites repository', () => {
  let database

  beforeEach(async () => {
    database = createDatabase(`favorites-repository-test-${crypto.randomUUID()}`, {
      indexedDB,
      IDBKeyRange,
    })
    await database.open()
  })

  afterEach(async () => {
    database.close()
    await database.delete()
  })

  it('returns an empty list before an item is favorited', async () => {
    await expect(listFavorites('vocabulary', database)).resolves.toEqual([])
  })

  it('adds a favorite idempotently', async () => {
    const favorite = {
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      favorite: true,
      timestamp: '2026-09-15T01:00:00.000Z',
    }

    await expect(setFavorite(favorite, database)).resolves.toBe(true)
    await expect(setFavorite(favorite, database)).resolves.toBe(true)
    await expect(listFavorites('vocabulary', database)).resolves.toEqual([
      {
        itemType: 'vocabulary',
        itemId: 'n5-vocab-001',
        updatedAt: '2026-09-15T01:00:00.000Z',
      },
    ])
  })

  it('removes the matching favorite record', async () => {
    await setFavorite({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      favorite: true,
      timestamp: '2026-09-15T01:00:00.000Z',
    }, database)

    await expect(setFavorite({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      favorite: false,
      timestamp: '2026-09-15T02:00:00.000Z',
    }, database)).resolves.toBe(false)
    await expect(listFavorites('vocabulary', database)).resolves.toEqual([])
  })

  it('keeps favorites isolated by item type', async () => {
    await setFavorite({
      itemType: 'vocabulary',
      itemId: 'shared-id',
      favorite: true,
      timestamp: '2026-09-15T01:00:00.000Z',
    }, database)
    await setFavorite({
      itemType: 'kanji',
      itemId: 'shared-id',
      favorite: true,
      timestamp: '2026-09-15T01:00:00.000Z',
    }, database)

    await expect(listFavorites('vocabulary', database)).resolves.toEqual([
      { itemType: 'vocabulary', itemId: 'shared-id', updatedAt: '2026-09-15T01:00:00.000Z' },
    ])
  })
})
