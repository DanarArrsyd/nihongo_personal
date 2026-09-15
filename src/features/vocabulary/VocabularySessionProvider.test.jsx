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
      <button type="button" onClick={() => toggleFavorite(vocabularyId)}>
        Toggle favorite
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
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
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
