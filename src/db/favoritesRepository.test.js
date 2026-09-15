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

  it('stores valid timestamp strings in canonical ISO format', async () => {
    await setFavorite({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-002',
      favorite: true,
      timestamp: '2026-09-15T08:00:00+07:00',
    }, database)

    await expect(listFavorites('vocabulary', database)).resolves.toEqual([
      {
        itemType: 'vocabulary',
        itemId: 'n5-vocab-002',
        updatedAt: '2026-09-15T01:00:00.000Z',
      },
    ])
  })

  it.each([undefined, null])('stores a null timestamp for missing input', async (timestamp) => {
    await setFavorite({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-003',
      favorite: true,
      timestamp,
    }, database)

    await expect(listFavorites('vocabulary', database)).resolves.toEqual([
      { itemType: 'vocabulary', itemId: 'n5-vocab-003', updatedAt: null },
    ])
  })

  it('rejects invalid favorite timestamps', async () => {
    await expect(setFavorite({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-004',
      favorite: true,
      timestamp: 'not-a-date',
    }, database)).rejects.toThrow('Invalid timestamp')
  })

  it.each([
    { itemType: '', itemId: 'n5-vocab-001' },
    { itemType: 'vocabulary', itemId: ' ' },
    { itemType: 1, itemId: 'n5-vocab-001' },
    { itemType: 'vocabulary', itemId: 1 },
  ])('rejects blank or non-string favorite identifiers', async ({ itemType, itemId }) => {
    await expect(setFavorite({
      itemType,
      itemId,
      favorite: true,
      timestamp: null,
    }, database)).rejects.toThrow('itemType and itemId are required')
  })

  it('rejects non-boolean favorite values', async () => {
    await expect(setFavorite({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      favorite: 'true',
      timestamp: null,
    }, database)).rejects.toThrow('favorite must be a boolean')
  })
})
