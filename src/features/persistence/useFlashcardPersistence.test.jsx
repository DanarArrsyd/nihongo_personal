import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { IDBKeyRange, indexedDB } from 'fake-indexeddb'
import { useState } from 'react'

import { createDatabase } from '../../db/database.js'
import { recordFlashcardRating } from '../../db/reviewRepository.js'
import { saveStudySession } from '../../db/studySessionRepository.js'
import { createFlashcardResponse } from '../flashcards/services/flashcardResponse.js'
import { createStudySession } from '../../services/studySession.js'
import PersistenceNotice from './PersistenceNotice.jsx'
import PersistenceProvider from './PersistenceProvider.jsx'
import useFlashcardPersistence from './useFlashcardPersistence.js'

const card = {
  id: 'flashcard-vocabulary-n5-vocab-001',
  source: { module: 'vocabulary', itemId: 'n5-vocab-001' },
}

const response = createFlashcardResponse({
  card,
  rating: 'good',
  now: () => new Date('2026-09-15T02:01:00.000Z'),
})

const completion = {
  itemCount: 1,
  ratingCounts: { again: 0, hard: 0, good: 1, easy: 0 },
}

function FlashcardPersistenceProbe({ repositories, session }) {
  const { onComplete, onResponse } = useFlashcardPersistence(session, repositories)
  const [interactionCount, setInteractionCount] = useState(0)

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onResponse(response)
          setInteractionCount((current) => current + 1)
        }}
      >
        Record rating
      </button>
      <button
        type="button"
        onClick={() => {
          onComplete(completion)
          setInteractionCount((current) => current + 1)
        }}
      >
        Complete session
      </button>
      <p>Interactions: {interactionCount}</p>
    </>
  )
}

function renderProbe({ repositories, session }) {
  return render(
    <PersistenceProvider>
      <PersistenceNotice />
      <FlashcardPersistenceProbe repositories={repositories} session={session} />
    </PersistenceProvider>,
  )
}

describe('useFlashcardPersistence', () => {
  let database
  let session
  let consoleError

  beforeEach(async () => {
    database = createDatabase(`flashcard-persistence-test-${crypto.randomUUID()}`, {
      indexedDB,
      IDBKeyRange,
    })
    await database.open()
    session = createStudySession({
      kind: 'flashcard',
      module: 'vocabulary',
      now: () => new Date('2026-09-15T02:00:00.000Z'),
      createId: () => 'flashcard-session-1',
    })
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(async () => {
    consoleError.mockRestore()
    database.close()
    await database.delete()
  })

  it('persists the latest item review and one completed flashcard session', async () => {
    renderProbe({
      session,
      repositories: {
        recordFlashcardRating: (payload) => recordFlashcardRating(payload, database),
        saveStudySession: (summary) => saveStudySession(summary, database),
      },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Record rating' }))
    fireEvent.click(screen.getByRole('button', { name: 'Complete session' }))

    await waitFor(async () => {
      await expect(database.reviews.count()).resolves.toBe(1)
      await expect(database.studySessions.count()).resolves.toBe(1)
    })
    await expect(database.reviews.get(['vocabulary', 'n5-vocab-001'])).resolves.toEqual({
      itemType: 'vocabulary',
      itemId: 'n5-vocab-001',
      cardId: 'flashcard-vocabulary-n5-vocab-001',
      lastRating: 'good',
      lastReviewedAt: '2026-09-15T02:01:00.000Z',
      sessionId: 'flashcard-session-1',
      dueAt: null,
      interval: null,
      difficulty: null,
    })
    await expect(database.studySessions.get('flashcard-session-1')).resolves.toMatchObject({
      sessionId: 'flashcard-session-1',
      kind: 'flashcard',
      module: 'vocabulary',
      itemCount: 1,
    })
    await expect(database.studySessions.get('flashcard-session-1')).resolves.not.toHaveProperty(
      'ratingCounts',
    )
  })

  it('reports a rejected rating write without throwing into the flashcard UI', async () => {
    const writeError = new Error('flashcard review write failed')
    renderProbe({
      session,
      repositories: {
        recordFlashcardRating: () => Promise.reject(writeError),
        saveStudySession: (summary) => saveStudySession(summary, database),
      },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Record rating' }))

    expect(screen.getByText('Interactions: 1')).toBeVisible()
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Penyimpanan lokal sedang bermasalah',
    )
    expect(consoleError).toHaveBeenCalledWith(writeError)
    await expect(database.reviews.count()).resolves.toBe(0)
  })

  it('reports a rejected session write without throwing into the flashcard UI', async () => {
    const writeError = new Error('flashcard session write failed')
    renderProbe({
      session,
      repositories: {
        recordFlashcardRating: (payload) => recordFlashcardRating(payload, database),
        saveStudySession: () => Promise.reject(writeError),
      },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Complete session' }))

    expect(screen.getByText('Interactions: 1')).toBeVisible()
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Penyimpanan lokal sedang bermasalah',
    )
    expect(consoleError).toHaveBeenCalledWith(writeError)
    await expect(database.studySessions.count()).resolves.toBe(0)
  })
})
