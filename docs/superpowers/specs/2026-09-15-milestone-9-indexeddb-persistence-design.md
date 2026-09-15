# Milestone 9 IndexedDB Persistence Design

## Goal

Persist the user activity already produced by Nihongo Personal so vocabulary state, favorites, quiz answers, flashcard ratings, and completed study sessions survive refreshes and browser restarts.

Milestone 9 establishes storage contracts only. Review scheduling, daily missions, analytics, and replacing dashboard mock data remain later milestones.

## Scope

Milestone 9 will:

- Create a versioned Dexie database for user-specific data.
- Persist vocabulary learning status and favorites.
- Persist individual quiz answers from mixed and kana quizzes.
- Persist individual vocabulary, kanji, and grammar flashcard ratings.
- Persist a summary when a quiz or flashcard session completes.
- Expose repositories for review records and settings so later milestones can use the schema without replacing it.
- Keep the application usable with an empty database.
- Fall back to current in-memory behavior when IndexedDB is unavailable and show a concise, non-blocking warning.

## Non-goals

- No SRS interval or due-date calculation.
- No Review page implementation.
- No Daily Mission generation or persistence.
- No Progress analytics or dashboard data replacement.
- No cloud sync, authentication, export, or backup.
- No static curriculum content stored in IndexedDB.

## Database

Create `src/db/database.js` with one injectable Dexie instance and schema version 1.

| Table | Primary key and indexes | Purpose |
| --- | --- | --- |
| `progress` | `[itemType+itemId], itemType, status, lastStudiedAt` | Current per-item learning state and answer counts |
| `reviews` | `[itemType+itemId], itemType, dueAt` | Storage boundary for future SRS state; Milestone 9 does not calculate schedules |
| `quizHistory` | `++id, &operationId, sessionId, questionId, timestamp, [itemType+itemId]` | Immutable quiz-answer history |
| `studySessions` | `sessionId, module, startedAt, endedAt` | Completed quiz and flashcard session summaries |
| `favorites` | `[itemType+itemId], itemType, updatedAt` | Current favorite membership |
| `settings` | `key` | Key/value application preferences for later use |

Static Kana, vocabulary, kanji, and grammar datasets remain in `src/data` and are referenced by `itemType` plus `itemId`.

## Record contracts

`progress` records contain:

- `itemType`
- `itemId`
- `status`: `new`, `learning`, `familiar`, or `mastered`
- `mastery`: integer from 0 to 100
- `correctCount`
- `incorrectCount`
- `lastStudiedAt`: ISO timestamp or `null`

Quiz answers update counts and `lastStudiedAt`. Milestone 9 uses a deliberately simple status derivation: untouched items default to `new`; a manually chosen vocabulary status is preserved; quiz activity without a manual status produces `learning`. Mastery analytics are not inferred beyond storing a valid current value.

History records copy scalar answer data and source identifiers. They never retain references to static curriculum objects.

Session records contain a generated `sessionId`, session kind (`quiz` or `flashcard`), module, start/end timestamps, duration in milliseconds, item count, correct count where applicable, and score where applicable.

## Repository boundaries

Focused modules under `src/db` own database access:

- `progressRepository.js`: read a progress record, list progress, change status, and increment correct/incorrect counts.
- `favoritesRepository.js`: list, query, add, remove, and toggle favorites.
- `quizHistoryRepository.js`: append quiz responses and update progress in one transaction.
- `studySessionRepository.js`: write completed session summaries.
- `reviewRepository.js`: store the latest flashcard rating per item and update progress in one transaction, without calculating a schedule.
- `settingsRepository.js`: read/write a setting by key.

Repositories accept a database instance where testing needs isolation; production defaults to the shared instance. They validate identifiers and normalize timestamps before writes. Expected empty reads return empty collections or `null`, not errors.

## React integration

### Persistence status

A small provider at the application boundary exposes persistence health. Failed writes are reported to an accessible, dismissible warning in the existing application shell. A storage failure does not block navigation or erase the current in-memory session.

### Vocabulary

`VocabularySessionProvider` hydrates persisted vocabulary progress and favorites on mount. Until hydration completes, vocabulary routes use the existing loading state. Existing `getStatus`, `setStatus`, `isFavorite`, and `toggleFavorite` consumer contracts remain stable.

Status and favorite changes update the UI immediately, then write through to IndexedDB. A failed write leaves the current in-memory interaction usable and reports persistence degradation.

### Quiz

`QuizSession` receives an optional activity recorder. Each accepted answer sends the already-normalized `createQuizResponse` payload to storage. Completion writes one session summary. Existing quiz rendering and reducer logic remain independent from Dexie.

Mixed quiz and kana practice pages supply stable session metadata. Restarting creates a new session identifier.

### Flashcards

`FlashcardSession` follows the same optional-recorder boundary. Each accepted rating persists the existing `createFlashcardResponse` payload. Completion writes a summary. No interval, due date, or SRS stage is calculated.

## Failure behavior

- Empty database: all modules render with their current defaults.
- IndexedDB unavailable or open/write failure: the active interaction continues in memory and a warning explains that progress may not survive refresh.
- Invalid repository input: reject with a useful development error; the React boundary converts storage failures into the user-facing warning.
- Duplicate callback caused by React Strict Mode: quiz history and session writes use stable operation identifiers, while review records use their per-item compound key, so repeated delivery is idempotent.

## Testing

Add `fake-indexeddb` as a development dependency for real Dexie behavior in Vitest.

Tests will prove:

- Every table can be used from an empty database.
- Vocabulary status and favorites survive provider unmount/remount.
- Quiz responses create history and update progress exactly once.
- Flashcard ratings update the stored per-item review record without SRS scheduling.
- Completed sessions are stored exactly once and restarts receive new identifiers.
- A failed database write preserves the active UI interaction and exposes the persistence warning.
- Existing feature tests remain green.

Final validation is `npm test`, `npm run lint`, and `npm run build`.

## Acceptance mapping

- **Refresh does not delete learning progress:** vocabulary state and favorite integration tests remount against the same IndexedDB; repository integration tests reopen the database and read written activity.
- **Application continues working if IndexedDB contains no data:** empty database tests cover repository defaults and vocabulary hydration.
- **Only Milestone 9 is implemented:** review scheduling, mission logic, analytics, PWA polish, and placeholder pages are unchanged.
