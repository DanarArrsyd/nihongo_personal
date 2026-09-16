import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { IDBKeyRange, indexedDB } from 'fake-indexeddb'
import PersistenceNotice from '../persistence/PersistenceNotice'
import PersistenceProvider from '../persistence/PersistenceProvider'
import { createDatabase } from '../../db/database'
import { listFavorites, setFavorite } from '../../db/favoritesRepository'
import { listProgress, setProgressStatus } from '../../db/progressRepository'
import { useVocabularySession } from './VocabularySessionContext'
import VocabularySessionProvider from './VocabularySessionProvider'

const vocabularyId = 'n5-vocab-001'

function VocabularyProbe() {
  const { getStatus, isFavorite, setStatus, toggleFavorite } = useVocabularySession()

  return (
    <>
      <p>Status: {getStatus(vocabularyId)}</p>
      <p>Favorite: {isFavorite(vocabularyId) ? 'yes' : 'no'}</p>
      <button type="button" onClick={() => setStatus(vocabularyId, 'familiar')}>
        Mark familiar
      </button>
      <button
        type="button"
        onClick={() => {
          setStatus(vocabularyId, 'learning')
          setStatus(vocabularyId, 'mastered')
        }}
      >
        Mark learning then mastered
      </button>
      <button type="button" onClick={() => toggleFavorite(vocabularyId)}>
        Toggle favorite
      </button>
      <button
        type="button"
        onClick={() => {
          toggleFavorite(vocabularyId)
          toggleFavorite(vocabularyId)
        }}
      >
        Toggle favorite twice
      </button>
    </>
  )
}

function renderProvider({ favoritesStore, progressStore }) {
  return render(
    <PersistenceProvider>
      <PersistenceNotice />
      <VocabularySessionProvider
        favoritesStore={favoritesStore}
        progressStore={progressStore}
      >
        <VocabularyProbe />
      </VocabularySessionProvider>
    </PersistenceProvider>,
  )
}

function createDatabaseStores(database) {
  const pendingWrites = []

  return {
    favoritesStore: {
      listFavorites: (itemType) => listFavorites(itemType, database),
      setFavorite: (payload) => {
        const write = setFavorite(payload, database)
        pendingWrites.push(write)
        return write
      },
    },
    pendingWrites,
    progressStore: {
      listProgress: (itemType) => listProgress(itemType, database),
      setProgressStatus: (payload) => {
        const write = setProgressStatus(payload, database)
        pendingWrites.push(write)
        return write
      },
    },
  }
}

function createDeferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, reject, resolve }
}

function createDeferredDatabaseStores(database) {
  const favoriteWrites = []
  const progressWrites = []

  return {
    favoriteWrites,
    favoritesStore: {
      listFavorites: (itemType) => listFavorites(itemType, database),
      setFavorite: (payload) => {
        const deferred = createDeferred()
        const write = {
          deferred,
          payload,
          promise: deferred.promise.then(() => setFavorite(payload, database)),
        }
        favoriteWrites.push(write)
        return write.promise
      },
    },
    progressWrites,
    progressStore: {
      listProgress: (itemType) => listProgress(itemType, database),
      setProgressStatus: (payload) => {
        const deferred = createDeferred()
        const write = {
          deferred,
          payload,
          promise: deferred.promise.then(() => setProgressStatus(payload, database)),
        }
        progressWrites.push(write)
        return write.promise
      },
    },
  }
}

describe('VocabularySessionProvider', () => {
  let database
  let consoleError

  beforeEach(async () => {
    database = createDatabase(`vocabulary-session-test-${crypto.randomUUID()}`, {
      indexedDB,
      IDBKeyRange,
    })
    await database.open()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(async () => {
    consoleError.mockRestore()
    database.close()
    await database.delete()
  })

  it('restores vocabulary status and favorites after a genuine provider remount', async () => {
    const stores = createDatabaseStores(database)
    const firstRender = renderProvider(stores)

    await screen.findByText('Status: new')
    expect(screen.getByText('Favorite: no')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Mark familiar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Toggle favorite' }))

    expect(screen.getByText('Status: familiar')).toBeVisible()
    expect(screen.getByText('Favorite: yes')).toBeVisible()
    await waitFor(() => expect(stores.pendingWrites).toHaveLength(2))
    await Promise.all(stores.pendingWrites)

    firstRender.unmount()
    renderProvider(stores)

    await waitFor(() => {
      expect(screen.getByText('Status: familiar')).toBeVisible()
      expect(screen.getByText('Favorite: yes')).toBeVisible()
    })
  })

  it('hides consumer defaults until both persistence reads settle', async () => {
    const progressRead = createDeferred()
    const favoritesRead = createDeferred()
    const stores = {
      progressStore: {
        listProgress: () => progressRead.promise,
        setProgressStatus: () => Promise.resolve(),
      },
      favoritesStore: {
        listFavorites: () => favoritesRead.promise,
        setFavorite: () => Promise.resolve(),
      },
    }

    renderProvider(stores)

    expect(screen.getByRole('status')).toHaveTextContent('Loading vocabulary')
    expect(screen.queryByText('Status: new')).not.toBeInTheDocument()

    progressRead.resolve([{ itemId: vocabularyId, status: 'familiar' }])
    await progressRead.promise
    expect(screen.getByRole('status')).toHaveTextContent('Loading vocabulary')

    favoritesRead.resolve([{ itemId: vocabularyId }])
    expect(await screen.findByText('Status: familiar')).toBeVisible()
    expect(screen.getByText('Favorite: yes')).toBeVisible()
  })

  it('serializes rapid status writes and continues after an earlier rejection', async () => {
    const stores = createDeferredDatabaseStores(database)
    const firstRender = renderProvider(stores)

    await screen.findByText('Status: new')
    fireEvent.click(screen.getByRole('button', { name: 'Mark learning then mastered' }))

    expect(screen.getByText('Status: mastered')).toBeVisible()
    await waitFor(() => expect(stores.progressWrites).toHaveLength(1))
    expect(stores.progressWrites[0].payload.status).toBe('learning')

    const writeError = new Error('first progress write failed')
    stores.progressWrites[0].deferred.reject(writeError)
    await expect(stores.progressWrites[0].promise).rejects.toBe(writeError)
    expect(await screen.findByText(/Penyimpanan lokal sedang bermasalah/)).toBeVisible()

    await waitFor(() => expect(stores.progressWrites).toHaveLength(2))
    expect(stores.progressWrites[1].payload.status).toBe('mastered')
    stores.progressWrites[1].deferred.resolve()
    await stores.progressWrites[1].promise

    firstRender.unmount()
    renderProvider(stores)
    expect(await screen.findByText('Status: mastered')).toBeVisible()
  })

  it('uses the latest intent and serializes two batched favorite toggles', async () => {
    const stores = createDeferredDatabaseStores(database)
    const firstRender = renderProvider(stores)

    await screen.findByText('Favorite: no')
    fireEvent.click(screen.getByRole('button', { name: 'Toggle favorite twice' }))

    expect(screen.getByText('Favorite: no')).toBeVisible()
    await waitFor(() => expect(stores.favoriteWrites).toHaveLength(1))
    expect(stores.favoriteWrites[0].payload.favorite).toBe(true)

    stores.favoriteWrites[0].deferred.resolve()
    await stores.favoriteWrites[0].promise
    await waitFor(() => expect(stores.favoriteWrites).toHaveLength(2))
    expect(stores.favoriteWrites[1].payload.favorite).toBe(false)
    await expect(listFavorites('vocabulary', database)).resolves.toHaveLength(1)

    stores.favoriteWrites[1].deferred.resolve()
    await stores.favoriteWrites[1].promise

    firstRender.unmount()
    renderProvider(stores)
    expect(await screen.findByText('Favorite: no')).toBeVisible()
  })

  it('keeps an optimistic status change when its storage write fails', async () => {
    const writeError = new Error('progress write failed')
    const stores = {
      progressStore: {
        listProgress: () => Promise.resolve([]),
        setProgressStatus: () => Promise.reject(writeError),
      },
      favoritesStore: {
        listFavorites: () => Promise.resolve([]),
        setFavorite: () => Promise.resolve(),
      },
    }

    renderProvider(stores)
    await screen.findByText('Status: new')
    fireEvent.click(screen.getByRole('button', { name: 'Mark familiar' }))

    expect(screen.getByText('Status: familiar')).toBeVisible()
    expect(await screen.findByText(/Penyimpanan lokal sedang bermasalah/)).toBeVisible()
  })

  it('keeps an optimistic favorite change when its storage write fails', async () => {
    const writeError = new Error('favorite write failed')
    const stores = {
      progressStore: {
        listProgress: () => Promise.resolve([]),
        setProgressStatus: () => Promise.resolve(),
      },
      favoritesStore: {
        listFavorites: () => Promise.resolve([]),
        setFavorite: () => Promise.reject(writeError),
      },
    }

    renderProvider(stores)
    await screen.findByText('Favorite: no')
    fireEvent.click(screen.getByRole('button', { name: 'Toggle favorite' }))

    expect(screen.getByText('Favorite: yes')).toBeVisible()
    expect(await screen.findByText(/Penyimpanan lokal sedang bermasalah/)).toBeVisible()
  })
})
