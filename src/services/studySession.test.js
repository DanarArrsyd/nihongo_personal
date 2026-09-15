import { completeStudySession, createStudySession } from './studySession.js'

describe('study session service', () => {
  it('creates deterministic session metadata with injected dependencies', () => {
    expect(createStudySession({
      kind: 'quiz',
      module: 'mixed',
      now: () => new Date('2026-09-15T01:00:00.000Z'),
      createId: () => 'session-1',
    })).toEqual({
      sessionId: 'session-1',
      kind: 'quiz',
      module: 'mixed',
      startedAt: '2026-09-15T01:00:00.000Z',
    })
  })

  it('completes a quiz with the exact quiz summary fields', () => {
    const session = createStudySession({
      kind: 'quiz',
      module: 'mixed',
      now: () => new Date('2026-09-15T01:00:00.000Z'),
      createId: () => 'session-1',
    })

    expect(completeStudySession({
      session,
      itemCount: 10,
      correctCount: 8,
      score: 80,
      now: () => new Date('2026-09-15T01:05:00.000Z'),
    })).toEqual({
      sessionId: 'session-1',
      kind: 'quiz',
      module: 'mixed',
      startedAt: '2026-09-15T01:00:00.000Z',
      endedAt: '2026-09-15T01:05:00.000Z',
      duration: 300000,
      itemCount: 10,
      correctCount: 8,
      score: 80,
    })
  })

  it('completes a flashcard session without quiz-only summary fields', () => {
    const session = createStudySession({
      kind: 'flashcard',
      module: 'vocabulary',
      now: () => new Date('2026-09-15T02:00:00.000Z'),
      createId: () => 'session-2',
    })

    expect(completeStudySession({
      session,
      itemCount: 12,
      now: () => new Date('2026-09-15T02:03:00.000Z'),
    })).toEqual({
      sessionId: 'session-2',
      kind: 'flashcard',
      module: 'vocabulary',
      startedAt: '2026-09-15T02:00:00.000Z',
      endedAt: '2026-09-15T02:03:00.000Z',
      duration: 180000,
      itemCount: 12,
    })
  })

  it('clamps duration to zero when the completion clock precedes the start', () => {
    const session = createStudySession({
      kind: 'flashcard',
      module: 'kanji',
      now: () => new Date('2026-09-15T03:00:00.000Z'),
      createId: () => 'session-3',
    })

    expect(completeStudySession({
      session,
      itemCount: 1,
      now: () => new Date('2026-09-15T02:59:00.000Z'),
    })).toMatchObject({
      duration: 0,
      endedAt: '2026-09-15T02:59:00.000Z',
    })
  })
})
