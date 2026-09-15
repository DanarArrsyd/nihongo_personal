# Task 1 Report: Versioned Dexie database

## What changed

- Added `fake-indexeddb` as a development dependency for isolated IndexedDB tests.
- Added `src/db/database.js` with `createDatabase(name, dependencies)` and the production `database` singleton named `nihongo-personal`.
- Defined the exact version 1 Dexie schema for `progress`, `reviews`, `quizHistory`, `studySessions`, `favorites`, and `settings`.
- Added a real Dexie schema test backed by `fake-indexeddb` that checks all six tables and writes/reads one record from each.
- Removed the placeholder `src/db/.gitkeep`.

## TDD evidence

RED command:

```text
npm test -- src/db/database.test.js
```

Relevant RED output:

```text
❯ src/db/database.test.js (0 test)
Error: Failed to resolve import "./database.js" from "src/db/database.test.js".
```

GREEN command:

```text
npm test -- src/db/database.test.js
```

Relevant GREEN output:

```text
Test Files  1 passed (1)
Tests  1 passed (1)
```

## Full-suite result

```text
npm test
Test Files  38 passed (38)
Tests  234 passed (234)
```

Additional project checks:

```text
npm run lint  # passed with no errors
npm run build # passed; Vite production build completed
```

## Files changed

- `package.json`
- `package-lock.json`
- `src/db/.gitkeep` (deleted)
- `src/db/database.js`
- `src/db/database.test.js`
- `.superpowers/sdd/2026-09-15-milestone-9-indexeddb-persistence/task-1-report.md`

## Self-review

- Confirmed all six stores match the approved schema strings exactly.
- Confirmed test databases receive `{ indexedDB, IDBKeyRange }` through the Dexie constructor and do not mutate browser globals.
- Confirmed static curriculum data and SRS behavior were not added.
- Confirmed the production singleton is created without opening or mutating it during module import.

## Concerns

None for the requested scope. `quizHistory` intentionally uses its auto-incremented primary key when reading the inserted test record; `operationId` remains the required unique secondary key.
