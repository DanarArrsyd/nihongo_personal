# Milestone 9 IndexedDB Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist current vocabulary state, favorites, quiz answers, flashcard ratings, and completed study sessions in IndexedDB without implementing SRS behavior.

**Architecture:** A versioned Dexie database and focused repositories own all storage. React keeps its current reducers and local interaction state; page-level persistence adapters observe accepted responses and write them asynchronously, while a small application provider reports storage degradation without blocking study.

**Tech Stack:** React 19, JavaScript, Dexie 4, Vitest, Testing Library, fake-indexeddb

**Spec:** `docs/superpowers/specs/2026-09-15-milestone-9-indexeddb-persistence-design.md`

## Global Constraints

- Implement Milestone 9 only; do not calculate review intervals or due dates.
- Store only user-specific state in IndexedDB; static learning data stays under `src/data`.
- Preserve existing component and reducer behavior.
- The application must remain usable when IndexedDB is empty or unavailable.
- Storage errors must be visible but non-blocking.
- Every behavior change follows red-green-refactor.
- Final gates are `npm test`, `npm run lint`, and `npm run build`.

---

### Task 1: Versioned Dexie database

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Delete: `src/db/.gitkeep`
- Create: `src/db/database.js`
- Create: `src/db/database.test.js`

**Interfaces:**
- Produces: `createDatabase(name, dependencies?) -> Dexie`
- Produces: `database`, the production singleton named `nihongo-personal`

- [ ] **Step 1: Install the IndexedDB test implementation**

Run: `npm install --save-dev fake-indexeddb`

- [ ] **Step 2: Write the failing schema test**

Create a real Dexie instance backed by `fake-indexeddb`, open it, and assert that these tables exist:

```js
const expectedTables = [
  'favorites',
  'progress',
  'quizHistory',
  'reviews',
  'settings',
  'studySessions',
]

expect(database.tables.map(({ name }) => name).sort()).toEqual(expectedTables)
```

Also put and read one minimal record in each table. The production mutation this test catches is a missing table or unusable primary key.

- [ ] **Step 3: Run the test and verify RED**

Run: `npm test -- src/db/database.test.js`

Expected: FAIL because `src/db/database.js` does not exist.

- [ ] **Step 4: Implement schema version 1**

Use the exact stores below:

```js
database.version(1).stores({
  progress: '[itemType+itemId], itemType, status, lastStudiedAt',
  reviews: '[itemType+itemId], itemType, dueAt',
  quizHistory: '++id, &operationId, sessionId, questionId, timestamp, [itemType+itemId]',
  studySessions: 'sessionId, module, startedAt, endedAt',
  favorites: '[itemType+itemId], itemType, updatedAt',
  settings: 'key',
})
```

Construct test databases with `new Dexie(name, dependencies)` so tests use `{ indexedDB, IDBKeyRange }` from `fake-indexeddb` without mutating global browser dependencies.

- [ ] **Step 5: Verify GREEN and commit**

Run: `npm test -- src/db/database.test.js`

Expected: PASS.

Commit: `feat: add indexeddb schema`

---

### Task 2: Progress, favorites, and settings repositories

**Files:**
- Create: `src/db/progressRepository.js`
- Create: `src/db/progressRepository.test.js`
- Create: `src/db/favoritesRepository.js`
- Create: `src/db/favoritesRepository.test.js`
- Create: `src/db/settingsRepository.js`
- Create: `src/db/settingsRepository.test.js`

**Interfaces:**
- Produces: `getProgress(itemType, itemId, db?) -> Promise<object|null>`
- Produces: `listProgress(itemType, db?) -> Promise<object[]>`
- Produces: `setProgressStatus({ itemType, itemId, status, timestamp }, db?) -> Promise<object>`
- Produces: `applyAnswerResult({ itemType, itemId, correct, timestamp }, db?) -> Promise<object>`
- Produces: `listFavorites(itemType, db?) -> Promise<object[]>`
- Produces: `setFavorite({ itemType, itemId, favorite, timestamp }, db?) -> Promise<boolean>`
- Produces: `getSetting(key, db?) -> Promise<unknown|null>`
- Produces: `setSetting(key, value, db?) -> Promise<unknown>`

- [ ] **Step 1: Write failing progress tests**

Cover empty reads, valid statuses, preservation of existing counters, answer counter increments, default `learning` status for first activity, and rejection of blank identifiers or unsupported statuses.

Use hand-derived records, for example:

```js
expect(await applyAnswerResult({
  itemType: 'vocabulary',
  itemId: 'n5-vocab-001',
  correct: true,
  timestamp: '2026-09-15T01:00:00.000Z',
}, testDatabase)).toMatchObject({
  status: 'learning',
  correctCount: 1,
  incorrectCount: 0,
  lastStudiedAt: '2026-09-15T01:00:00.000Z',
})
```

- [ ] **Step 2: Verify progress tests RED, then implement minimally**

Run: `npm test -- src/db/progressRepository.test.js`

Expected RED: module missing. Implement defaults `{ status: 'learning', mastery: 0, correctCount: 0, incorrectCount: 0 }`, preserve any existing status/mastery, and write with `table.put()`.

- [ ] **Step 3: Write failing favorite and setting tests**

Prove an empty favorite list is `[]`, adding is idempotent, removing deletes the record, item types remain isolated, missing settings return `null`, and setting a value overwrites only that key.

- [ ] **Step 4: Verify RED, implement, and run all repository tests**

Run: `npm test -- src/db/progressRepository.test.js src/db/favoritesRepository.test.js src/db/settingsRepository.test.js`

Expected: PASS after minimal implementation.

- [ ] **Step 5: Commit**

Commit: `feat: add progress and preference repositories`

---

### Task 3: Activity and study-session repositories

**Files:**
- Create: `src/db/quizHistoryRepository.js`
- Create: `src/db/quizHistoryRepository.test.js`
- Create: `src/db/reviewRepository.js`
- Create: `src/db/reviewRepository.test.js`
- Create: `src/db/studySessionRepository.js`
- Create: `src/db/studySessionRepository.test.js`
- Create: `src/services/studySession.js`
- Create: `src/services/studySession.test.js`

**Interfaces:**
- Produces: `recordQuizResponse({ sessionId, response }, db?) -> Promise<object>`
- Produces: `recordFlashcardRating({ sessionId, response }, db?) -> Promise<object>`
- Produces: `getReview(itemType, itemId, db?) -> Promise<object|null>`
- Produces: `saveStudySession(summary, db?) -> Promise<object>`
- Produces: `createStudySession({ kind, module, now?, createId? }) -> object`
- Produces: `completeStudySession({ session, itemCount, correctCount?, score?, now? }) -> object`

- [ ] **Step 1: Write the failing quiz-history transaction tests**

Use a real database. Prove that one response writes an immutable history row and updates progress atomically. Repeat the same `{ sessionId, questionId }` and prove there is still one history row and one counter increment.

The persisted history shape is:

```js
{
  operationId: `${sessionId}:${response.questionId}`,
  sessionId,
  questionId: response.questionId,
  questionType: response.questionType,
  userAnswer: response.userAnswer,
  correctAnswer: response.correctAnswer,
  result: response.result,
  timestamp: response.timestamp,
  itemType: response.associatedItem.module,
  itemId: response.associatedItem.itemId,
}
```

- [ ] **Step 2: Verify RED, then implement the quiz transaction**

Run: `npm test -- src/db/quizHistoryRepository.test.js`

Expected RED: module missing. Use `db.transaction('rw', db.quizHistory, db.progress, ...)`; check `operationId` before adding so duplicate delivery is a no-op.

- [ ] **Step 3: Write the failing flashcard-rating tests**

Prove a rating stores the latest per-item review record, leaves `dueAt`, `interval`, and `difficulty` as `null`, updates only `lastStudiedAt` in progress, and a later rating replaces `lastRating` without adding SRS behavior.

- [ ] **Step 4: Verify RED, then implement the review transaction**

Run: `npm test -- src/db/reviewRepository.test.js`

Expected RED: module missing. Key reviews by `{ itemType, itemId }` and copy `cardId`, `lastRating`, `lastReviewedAt`, and `sessionId` as scalar fields.

- [ ] **Step 5: Write failing study-session tests**

Prove deterministic injected clocks and IDs, non-negative duration, an idempotent `sessionId` write, and exact quiz/flashcard summary fields.

```js
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
})).toMatchObject({ sessionId: 'session-1', duration: 300000 })
```

- [ ] **Step 6: Verify GREEN for all activity storage and commit**

Run: `npm test -- src/db/quizHistoryRepository.test.js src/db/reviewRepository.test.js src/db/studySessionRepository.test.js src/services/studySession.test.js`

Expected: PASS.

Commit: `feat: persist study activity`

---

### Task 4: Non-blocking persistence failure notice

**Files:**
- Create: `src/features/persistence/PersistenceContext.js`
- Create: `src/features/persistence/PersistenceProvider.jsx`
- Create: `src/features/persistence/PersistenceNotice.jsx`
- Create: `src/features/persistence/PersistenceProvider.test.jsx`
- Modify: `src/main.jsx`
- Modify: `src/components/layout/AppShell.jsx`

**Interfaces:**
- Produces: `usePersistenceStatus() -> { message, reportFailure, dismissFailure }`
- Produces: `PersistenceProvider({ children })`
- Produces: `PersistenceNotice()`

- [ ] **Step 1: Write the failing provider behavior test**

Render a probe inside the provider. Call `reportFailure(new Error('blocked'))`, assert the Indonesian warning is visible with `role="status"`, dismiss it with a button, and assert children remain interactive throughout.

Use this exact user-facing copy:

```text
Penyimpanan lokal sedang bermasalah. Perubahan sesi ini mungkin tidak tersimpan setelah aplikasi ditutup.
```

- [ ] **Step 2: Verify RED and implement provider plus notice**

Run: `npm test -- src/features/persistence/PersistenceProvider.test.jsx`

Expected RED: provider module missing. Store only the public message in state; log the original development error with `console.error`; make dismissal keyboard accessible.

- [ ] **Step 3: Wire the provider at the application root**

Wrap `<App />` inside `<PersistenceProvider>` in `src/main.jsx`. Render `<PersistenceNotice />` before the main outlet in `AppShell` so it is available on every route without changing navigation.

- [ ] **Step 4: Run focused shell/provider tests and commit**

Run: `npm test -- src/features/persistence/PersistenceProvider.test.jsx src/App.test.jsx`

Expected: PASS.

Commit: `feat: report local storage failures`

---

### Task 5: Persist vocabulary status and favorites

**Files:**
- Create: `src/features/vocabulary/VocabularySessionProvider.test.jsx`
- Modify: `src/features/vocabulary/VocabularySessionProvider.jsx`
- Modify: `src/features/vocabulary/VocabularyDetailPage.jsx`
- Modify: `src/features/vocabulary/VocabularyPage.test.jsx`

**Interfaces:**
- Consumes: `listProgress`, `setProgressStatus`, `listFavorites`, `setFavorite`
- Preserves: `{ getStatus, isFavorite, setStatus, toggleFavorite }` from `useVocabularySession()`
- Adds test injection: `VocabularySessionProvider({ children, progressStore?, favoritesStore? })`

- [ ] **Step 1: Write the failing hydration/remount test**

With repositories backed by one fake IndexedDB instance:

1. Render the provider and a probe.
2. Wait for empty hydration.
3. Set `n5-vocab-001` to `familiar` and favorite it.
4. Unmount and render a new provider using the same database.
5. Assert `getStatus()` returns `familiar` and `isFavorite()` returns `true`.

This catches reverting the provider to component-only state.

- [ ] **Step 2: Verify RED and implement hydration**

Run: `npm test -- src/features/vocabulary/VocabularySessionProvider.test.jsx`

Expected RED: remount returns `new` and `false`. Hydrate both repositories in one effect, render the existing `LoadingState` until both reads settle, and ignore late completion after unmount.

- [ ] **Step 3: Add failing degraded-storage behavior**

Inject stores whose writes reject. Assert status/favorite UI changes immediately and the global warning appears. Do not roll the local state back.

- [ ] **Step 4: Implement write-through behavior and update copy**

Keep setters synchronous from the consumer's perspective, then fire the repository promise and pass failures to `reportFailure`. Replace the outdated detail-page sentence saying favorites reset on refresh with:

```text
Favorite dan status tersimpan otomatis di perangkat ini.
```

- [ ] **Step 5: Run vocabulary tests and commit**

Run: `npm test -- src/features/vocabulary/VocabularySessionProvider.test.jsx src/features/vocabulary/VocabularyPage.test.jsx src/features/vocabulary/VocabularyDetailPage.test.jsx`

Expected: PASS.

Commit: `feat: persist vocabulary state`

---

### Task 6: Persist quiz responses and quiz sessions

**Files:**
- Create: `src/features/persistence/useQuizPersistence.js`
- Create: `src/features/persistence/useQuizPersistence.test.jsx`
- Modify: `src/features/quiz/QuizSession.jsx`
- Modify: `src/features/quiz/QuizSession.test.jsx`
- Modify: `src/features/quiz/MixedQuizPage.jsx`
- Modify: `src/features/quiz/MixedQuizPage.test.jsx`
- Modify: `src/features/kana/KanaPracticePage.jsx`
- Modify: `src/features/kana/KanaPracticePage.test.jsx`

**Interfaces:**
- Produces: `useQuizPersistence(session) -> { onResponse, onComplete }`
- Adds to `QuizSession`: optional `onResponse(response)` and `onComplete({ itemCount, correctCount, score })`
- Consumes: `recordQuizResponse`, `saveStudySession`, `completeStudySession`, `reportFailure`

- [ ] **Step 1: Write failing `QuizSession` callback tests**

Prove each accepted answer calls `onResponse` once with the real `createQuizResponse` payload. Prove answering the final question calls `onComplete` once with literal totals; navigation and rerendering must not repeat either callback.

- [ ] **Step 2: Verify RED and add optional callbacks**

Run: `npm test -- src/features/quiz/QuizSession.test.jsx`

Expected RED: callbacks are never called. Invoke `onResponse` only after the reducer's existing duplicate-answer guard accepts a response. Report completion from an effect protected by a ref.

- [ ] **Step 3: Write the failing persistence-hook test**

Create session metadata with a deterministic ID. Feed one response and one completion summary through the hook, then assert one quiz-history row and one study-session row exist. Inject a rejecting repository and assert the persistence warning is reported while the hook does not throw into the UI.

- [ ] **Step 4: Verify RED and implement the quiz persistence adapter**

Run: `npm test -- src/features/persistence/useQuizPersistence.test.jsx`

Expected RED: hook missing. The hook must memoize callbacks from `session.sessionId`; it must not import quiz presentation components.

- [ ] **Step 5: Give mixed and kana sessions stable metadata**

Extend each page's `createSession()` result with `studySession: createStudySession(...)`:

- Mixed: `{ kind: 'quiz', module: 'mixed' }`
- Kana: `{ kind: 'quiz', module: `kana:${script}:${mode}` }`

Pass the adapter callbacks to `QuizSession`. Restarting must generate a new `sessionId` and continue using the existing `sessionVersion` key behavior.

- [ ] **Step 6: Run quiz and kana tests and commit**

Run: `npm test -- src/features/quiz src/features/kana src/features/persistence/useQuizPersistence.test.jsx`

Expected: PASS.

Commit: `feat: persist quiz sessions`

---

### Task 7: Persist flashcard ratings and sessions

**Files:**
- Create: `src/features/persistence/useFlashcardPersistence.js`
- Create: `src/features/persistence/useFlashcardPersistence.test.jsx`
- Modify: `src/features/flashcards/FlashcardSession.jsx`
- Modify: `src/features/flashcards/FlashcardSession.test.jsx`
- Modify: `src/features/flashcards/FlashcardSessionPage.jsx`
- Modify: `src/features/flashcards/FlashcardSessionPage.test.jsx`

**Interfaces:**
- Produces: `useFlashcardPersistence(session) -> { onResponse, onComplete }`
- Adds to `FlashcardSession`: optional `onResponse(response)` and `onComplete({ itemCount, ratingCounts })`
- Consumes: `recordFlashcardRating`, `saveStudySession`, `completeStudySession`, `reportFailure`

- [ ] **Step 1: Write failing `FlashcardSession` callback tests**

Prove each accepted rating calls `onResponse` once with the real `createFlashcardResponse` payload. Prove the final rating calls `onComplete` once with the total card count and literal `{ again, hard, good, easy }` counts. Repeated shortcut input and rerendering must not duplicate callbacks.

- [ ] **Step 2: Verify RED and add optional callbacks**

Run: `npm test -- src/features/flashcards/FlashcardSession.test.jsx`

Expected RED: callbacks are never called. Preserve the existing rating lock and reducer; call persistence only for an accepted rating and report completion from a ref-guarded effect.

- [ ] **Step 3: Write the failing persistence-hook test**

Feed one real flashcard response plus completion through deterministic session metadata. Assert the latest per-item review record and one flashcard study-session summary. A rejected write must report degradation without rejecting the click handler.

- [ ] **Step 4: Verify RED and implement the flashcard adapter**

Run: `npm test -- src/features/persistence/useFlashcardPersistence.test.jsx`

Expected RED: hook missing. Convert rating counts to the session summary without deriving intervals, difficulty, due dates, or SRS stages.

- [ ] **Step 5: Add metadata to flashcard session creation**

Extend `createSession(module)` with `studySession: createStudySession({ kind: 'flashcard', module })`. Pass persistence callbacks into `FlashcardSession`. Every successful restart gets a new `sessionId`; unavailable decks write nothing.

- [ ] **Step 6: Run flashcard tests and commit**

Run: `npm test -- src/features/flashcards src/features/persistence/useFlashcardPersistence.test.jsx`

Expected: PASS.

Commit: `feat: persist flashcard sessions`

---

### Task 8: Full Milestone 9 verification

**Files:**
- Modify only files required to fix failures caused by Milestone 9.

**Interfaces:**
- Consumes all Milestone 9 behavior.
- Produces no Milestone 10 behavior.

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: every test passes with no unhandled promise rejections or React warnings.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: zero ESLint errors.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: successful Vite production build.

- [ ] **Step 4: Verify scope and repository state**

Run: `git diff main...HEAD --check`

Inspect the diff and confirm `/review`, `/progress`, dashboard analytics, Daily Mission, and PWA configuration are unchanged.

- [ ] **Step 5: Commit final verification fixes if needed**

If verification required code fixes, commit them as `fix: complete milestone 9 verification`. If no files changed, do not create an empty commit.
