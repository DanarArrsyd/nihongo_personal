import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { IDBKeyRange, indexedDB } from 'fake-indexeddb'
import { useState } from 'react'
import { createDatabase } from '../../db/database.js'
import { recordQuizResponse } from '../../db/quizHistoryRepository.js'
import { saveStudySession } from '../../db/studySessionRepository.js'
import { createStudySession } from '../../services/studySession.js'
import PersistenceNotice from './PersistenceNotice.jsx'
import PersistenceProvider from './PersistenceProvider.jsx'
import useQuizPersistence from './useQuizPersistence.js'

const response = {
  questionId: 'vocabulary-meaning',
  questionType: 'multiple_choice',
  userAnswer: 'makan',
  correctAnswer: 'makan',
  result: true,
  timestamp: '2026-09-15T01:01:00.000Z',
  associatedItem: { module: 'vocabulary', itemId: 'n5-vocab-001' },
}

const completion = {
  itemCount: 1,
  correctCount: 1,
  score: 100,
}

function QuizPersistenceProbe({ repositories, session }) {
  const { onComplete, onResponse } = useQuizPersistence(session, repositories)
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
        Record response
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
      <QuizPersistenceProbe repositories={repositories} session={session} />
    </PersistenceProvider>,
  )
}

describe('useQuizPersistence', () => {
  let database
  let session
  let consoleError

  beforeEach(async () => {
    database = createDatabase(`quiz-persistence-test-${crypto.randomUUID()}`, {
      indexedDB,
      IDBKeyRange,
    })
    await database.open()
    session = createStudySession({
      kind: 'quiz',
      module: 'mixed',
      now: () => new Date('2026-09-15T01:00:00.000Z'),
      createId: () => 'quiz-session-1',
    })
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(async () => {
    consoleError.mockRestore()
    database.close()
    await database.delete()
  })

  it('persists one accepted response and one completed quiz session', async () => {
    renderProbe({
      session,
      repositories: {
        recordQuizResponse: (payload) => recordQuizResponse(payload, database),
        saveStudySession: (summary) => saveStudySession(summary, database),
      },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Record response' }))
    fireEvent.click(screen.getByRole('button', { name: 'Complete session' }))

    await waitFor(async () => {
      await expect(database.quizHistory.count()).resolves.toBe(1)
      await expect(database.studySessions.count()).resolves.toBe(1)
    })
    await expect(database.quizHistory.toArray()).resolves.toEqual([
      expect.objectContaining({
        sessionId: 'quiz-session-1',
        questionId: 'vocabulary-meaning',
      }),
    ])
    await expect(database.studySessions.get('quiz-session-1')).resolves.toMatchObject({
      sessionId: 'quiz-session-1',
      kind: 'quiz',
      module: 'mixed',
      itemCount: 1,
      correctCount: 1,
      score: 100,
    })
  })

  it('reports a rejected write without throwing into the quiz UI', async () => {
    const writeError = new Error('quiz history write failed')
    renderProbe({
      session,
      repositories: {
        recordQuizResponse: () => Promise.reject(writeError),
        saveStudySession: (summary) => saveStudySession(summary, database),
      },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Record response' }))

    expect(screen.getByText('Interactions: 1')).toBeVisible()
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Penyimpanan lokal sedang bermasalah',
    )
    expect(consoleError).toHaveBeenCalledWith(writeError)
    await expect(database.quizHistory.count()).resolves.toBe(0)
  })
})
