import { IDBKeyRange, indexedDB } from 'fake-indexeddb'

import { createDatabase } from './database.js'
import { getSetting, setSetting } from './settingsRepository.js'

describe('settings repository', () => {
  let database

  beforeEach(async () => {
    database = createDatabase(`settings-repository-test-${crypto.randomUUID()}`, {
      indexedDB,
      IDBKeyRange,
    })
    await database.open()
  })

  afterEach(async () => {
    database.close()
    await database.delete()
  })

  it('returns null for a missing setting', async () => {
    await expect(getSetting('theme', database)).resolves.toBeNull()
  })

  it('stores and returns a setting value', async () => {
    await expect(setSetting('theme', 'dark', database)).resolves.toBe('dark')
    await expect(getSetting('theme', database)).resolves.toBe('dark')
  })

  it('overwrites only the setting with the matching key', async () => {
    await setSetting('theme', 'light', database)
    await setSetting('showRomaji', true, database)

    await expect(setSetting('theme', 'dark', database)).resolves.toBe('dark')
    await expect(getSetting('theme', database)).resolves.toBe('dark')
    await expect(getSetting('showRomaji', database)).resolves.toBe(true)
  })
})
