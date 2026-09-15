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

  it.each([
    [
      'unsupported kind',
      { kind: 'practice', module: 'mixed', createId: () => 'session-4' },
      'Unsupported study session kind',
    ],
    [
      'blank module',
      { kind: 'quiz', module: ' ', createId: () => 'session-4' },
      'module must be a non-blank string',
    ],
    [
      'blank generated id',
      { kind: 'quiz', module: 'mixed', createId: () => '' },
      'sessionId must be a non-blank string',
    ],
    [
      'invalid clock value',
      { kind: 'quiz', module: 'mixed', createId: () => 'session-4', now: () => new Date('invalid') },
      'Invalid timestamp',
    ],
  ])('rejects a %s when creating a session', (_label, input, errorMessage) => {
    expect(() => createStudySession(input)).toThrow(errorMessage)
  })

  it.each([
    ['blank session id', { sessionId: '' }, 'sessionId must be a non-blank string'],
    ['unsupported kind', { kind: 'practice' }, 'Unsupported study session kind'],
    ['blank module', { module: ' ' }, 'module must be a non-blank string'],
    ['invalid start timestamp', { startedAt: 'not-a-date' }, 'Invalid timestamp'],
  ])('rejects a malformed session with a %s', (_label, changes, errorMessage) => {
    const session = {
      sessionId: 'session-5',
      kind: 'quiz',
      module: 'mixed',
      startedAt: '2026-09-15T04:00:00.000Z',
      ...changes,
    }

    expect(() => completeStudySession({
      session,
      itemCount: 10,
      correctCount: 8,
      score: 80,
      now: () => new Date('2026-09-15T04:05:00.000Z'),
    })).toThrow(errorMessage)
  })

  it.each([
    ['negative item count', { itemCount: -1 }, 'itemCount must be a non-negative integer'],
    ['fractional item count', { itemCount: 1.5 }, 'itemCount must be a non-negative integer'],
    ['negative correct count', { correctCount: -1 }, 'correctCount must be a non-negative integer'],
    ['score above 100', { score: 101 }, 'score must be between 0 and 100'],
  ])('rejects a %s when completing a quiz', (_label, changes, errorMessage) => {
    const session = {
      sessionId: 'session-6',
      kind: 'quiz',
      module: 'mixed',
      startedAt: '2026-09-15T05:00:00.000Z',
    }

    expect(() => completeStudySession({
      session,
      itemCount: 10,
      correctCount: 8,
      score: 80,
      now: () => new Date('2026-09-15T05:05:00.000Z'),
      ...changes,
    })).toThrow(errorMessage)
  })

  it('rejects quiz-only counts when completing a flashcard session', () => {
    const session = {
      sessionId: 'session-7',
      kind: 'flashcard',
      module: 'vocabulary',
      startedAt: '2026-09-15T06:00:00.000Z',
    }

    expect(() => completeStudySession({
      session,
      itemCount: 4,
      correctCount: 3,
      now: () => new Date('2026-09-15T06:01:00.000Z'),
    })).toThrow('correctCount is only supported for quiz sessions')
  })
})
