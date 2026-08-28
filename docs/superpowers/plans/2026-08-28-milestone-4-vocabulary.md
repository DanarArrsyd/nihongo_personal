# Milestone 4 Vocabulary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive JLPT N5 vocabulary workspace with static data, search/filter, detail, pronunciation, favorites, and session-only learning status.

**Architecture:** A 30-entry JSON seed dataset feeds a pure `vocabularyData` service. Vocabulary routes share a React context so favorites and learning statuses survive navigation without introducing persistence. Focused list/detail components reuse existing UI primitives and Japanese speech service.

**Tech Stack:** React 19, Vite 8, JavaScript, React Router, Tailwind CSS, Lucide React, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-08-28-milestone-4-vocabulary-design.md`

## Global Constraints

- Implement Milestone 4 only; do not add quiz, flashcard, IndexedDB, SRS, Kanji, Grammar, or later milestone behavior.
- Use no new dependencies.
- Static vocabulary content stays separate from session state.
- UI must remain usable at 390px, 768px, and 1440px with visible focus and 44px touch targets.
- Use Geist for UI, Noto Sans JP for Japanese text, and existing warm palette only.
- The destination GitHub repository is public; commit no secrets or personal learning data.

---

### Task 1: Vocabulary Dataset and Query Service

**Files:**
- Create: `src/data/vocabulary/n5.json`
- Create: `src/features/vocabulary/services/vocabularyData.js`
- Test: `src/features/vocabulary/services/vocabularyData.test.js`

**Interfaces:**
- Consumes: local JSON entries with `id`, `word`, `reading`, `romaji`, `meaning`, `type`, `jlpt`, and `examples`
- Produces: `getVocabulary()`, `getVocabularyById(id)`, `filterVocabulary(items, filters, getStatus)`, `getVocabularyTypes(items)`

- [ ] **Step 1: Write failing service tests**

```js
import { filterVocabulary, getVocabulary, getVocabularyById, getVocabularyTypes } from './vocabularyData'

it('provides 30 structured N5 entries', () => {
  const items = getVocabulary()
  expect(items).toHaveLength(30)
  expect(items[0]).toMatchObject({ id: 'n5-vocab-001', word: '食べる', reading: 'たべる', romaji: 'taberu', meaning: 'makan', type: 'verb', jlpt: 'N5' })
})

it.each(['食べ', 'たべ', 'TABERU', 'makan'])('searches multilingual text with %s', (query) => {
  expect(filterVocabulary(getVocabulary(), { query, type: 'all', status: 'all' }, () => 'new')[0].id).toBe('n5-vocab-001')
})

it('combines type and session status filters', () => {
  const result = filterVocabulary(getVocabulary(), { query: '', type: 'verb', status: 'learning' }, (id) => id === 'n5-vocab-001' ? 'learning' : 'new')
  expect(result.map((item) => item.id)).toContain('n5-vocab-001')
  expect(result.every((item) => item.type === 'verb')).toBe(true)
})
```

- [ ] **Step 2: Run service tests and verify RED**

Run: `npm test -- --run src/features/vocabulary/services/vocabularyData.test.js`

Expected: FAIL because `vocabularyData.js` does not exist.

- [ ] **Step 3: Add dataset and minimal service**

Dataset contains these 30 IDs and words in order: `食べる`, `飲む`, `見る`, `聞く`, `読む`, `書く`, `話す`, `行く`, `来る`, `帰る`, `学校`, `先生`, `学生`, `友達`, `家`, `本`, `水`, `ご飯`, `今日`, `明日`, `昨日`, `朝`, `昼`, `夜`, `大きい`, `小さい`, `新しい`, `古い`, `好き`, `元気`. Each item includes one accurate Indonesian example sentence.

```js
import vocabulary from '../../../data/vocabulary/n5.json'

export function getVocabulary() { return vocabulary }
export function getVocabularyById(id) { return vocabulary.find((item) => item.id === id) ?? null }
export function getVocabularyTypes(items = vocabulary) { return [...new Set(items.map((item) => item.type))].sort() }
export function filterVocabulary(items, { query = '', type = 'all', status = 'all' }, getStatus = () => 'new') {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  return items.filter((item) => {
    const searchable = [item.word, item.reading, item.romaji, item.meaning].join(' ').toLocaleLowerCase()
    return (!normalizedQuery || searchable.includes(normalizedQuery)) &&
      (type === 'all' || item.type === type) &&
      (status === 'all' || getStatus(item.id) === status)
  })
}
```

- [ ] **Step 4: Run service tests and verify GREEN**

Run: `npm test -- --run src/features/vocabulary/services/vocabularyData.test.js`

Expected: all service tests pass.

---

### Task 2: Session State and Vocabulary Routes

**Files:**
- Create: `src/features/vocabulary/VocabularySessionContext.jsx`
- Create: `src/features/vocabulary/VocabularyLayout.jsx`
- Modify: `src/App.jsx`
- Test: `src/features/vocabulary/VocabularyPage.test.jsx`

**Interfaces:**
- Consumes: `VocabularySessionProvider`, React Router `Outlet`
- Produces: `useVocabularySession()` returning `{ getStatus, setStatus, isFavorite, toggleFavorite }`

- [ ] **Step 1: Write failing route and session tests**

```jsx
it('opens vocabulary from Learn and renders its route', () => {
  renderRoute('/learn')
  expect(screen.getByRole('link', { name: 'Study Vocabulary' })).toHaveAttribute('href', '/learn/vocabulary')
})

it('preserves favorite and status while navigating vocabulary routes', () => {
  renderRoute('/learn/vocabulary/n5-vocab-001')
  fireEvent.click(screen.getByRole('button', { name: 'Add 食べる to favorites' }))
  fireEvent.change(screen.getByRole('combobox', { name: 'Learning status' }), { target: { value: 'learning' } })
  expect(screen.getByRole('button', { name: 'Remove 食べる from favorites' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('combobox', { name: 'Learning status' })).toHaveValue('learning')
})
```

- [ ] **Step 2: Run page test and verify RED**

Run: `npm test -- --run src/features/vocabulary/VocabularyPage.test.jsx`

Expected: FAIL because vocabulary routes and UI do not exist.

- [ ] **Step 3: Implement context and nested routes**

```jsx
const VocabularySessionContext = createContext(null)

export function VocabularySessionProvider({ children }) {
  const [statuses, setStatuses] = useState({})
  const [favorites, setFavorites] = useState(() => new Set())
  // Expose immutable updates; default status is `new`.
  return <VocabularySessionContext.Provider value={value}>{children}</VocabularySessionContext.Provider>
}
```

Add nested routes under `<Route element={<VocabularyLayout />}>` for index and `:vocabularyId`. Add Vocabulary card to `LearnPage` without changing Kana behavior.

- [ ] **Step 4: Keep test RED only for missing page presentation**

Run: `npm test -- --run src/features/vocabulary/VocabularyPage.test.jsx`

Expected: route resolves; presentation assertions still fail until Task 3.

---

### Task 3: Responsive Vocabulary List and Detail UI

**Files:**
- Create: `src/features/vocabulary/VocabularyPage.jsx`
- Create: `src/features/vocabulary/VocabularyDetailPage.jsx`
- Create: `src/features/vocabulary/components/VocabularyFilters.jsx`
- Create: `src/features/vocabulary/components/VocabularyList.jsx`
- Create: `src/features/vocabulary/components/VocabularyStatusControl.jsx`
- Modify: `src/features/learn/LearnPage.jsx`
- Modify: `src/styles/index.css`
- Test: `src/features/vocabulary/VocabularyPage.test.jsx`

**Interfaces:**
- Consumes: vocabulary service, session context, existing `Card`, `Badge`, `EmptyState`, and `speakJapanese`
- Produces: accessible list/detail pages and search/filter interactions

- [ ] **Step 1: Complete failing user-behavior tests**

```jsx
it('searches Japanese, romaji, and Indonesian meaning', () => {
  renderRoute('/learn/vocabulary')
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search vocabulary' }), { target: { value: 'taberu' } })
  expect(screen.getByRole('link', { name: /食べる/ })).toBeVisible()
  expect(screen.queryByRole('link', { name: /飲む/ })).not.toBeInTheDocument()
})

it('filters by word type and learning status', () => {
  renderRoute('/learn/vocabulary')
  fireEvent.change(screen.getByRole('combobox', { name: 'Word type' }), { target: { value: 'noun' } })
  expect(screen.getByText(/noun results/i)).toBeVisible()
})

it('shows detail, example, pronunciation fallback, favorite, and status', () => {
  renderRoute('/learn/vocabulary/n5-vocab-001')
  expect(screen.getByRole('heading', { name: '食べる' })).toBeVisible()
  expect(screen.getByText('Saya makan sushi.')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Pronounce 食べる' }))
  expect(screen.getByRole('status')).toHaveTextContent('Japanese pronunciation is not available in this browser.')
})

it('recovers from empty results and invalid IDs', () => {
  renderRoute('/learn/vocabulary/not-real')
  expect(screen.getByRole('heading', { name: 'Vocabulary not found' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Back to Vocabulary' })).toHaveAttribute('href', '/learn/vocabulary')
})
```

- [ ] **Step 2: Run page tests and verify RED**

Run: `npm test -- --run src/features/vocabulary/VocabularyPage.test.jsx`

Expected: FAIL on missing filters, list rows, detail content, and recovery UI.

- [ ] **Step 3: Implement minimal responsive pages**

Use a desktop/tablet dictionary rail with filter panel and linked rows; use a stacked smartphone layout. Apply `genko-grid` only to detail word and example surfaces. Controls use existing palette and focus conventions. List route displays count, search, type/status filters, reset action, and accessible empty state. Detail route displays all required fields, one example, favorite button with `aria-pressed`, status select, and speech fallback.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- --run src/features/vocabulary/VocabularyPage.test.jsx src/features/vocabulary/services/vocabularyData.test.js`

Expected: all vocabulary tests pass.

- [ ] **Step 5: Run regression tests**

Run: `npm test -- --run`

Expected: all existing and vocabulary tests pass.

---

### Task 4: Visual Verification, Documentation, and GitHub Delivery

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Verify: all modified source, tests, specs, and plan files

**Interfaces:**
- Consumes: completed Milestone 0–4 project
- Produces: validated `main` commit pushed to `DanarArrsyd/nihongo_personal`

- [ ] **Step 1: Inspect responsive presentation**

Run Vite locally and capture `/learn/vocabulary` and `/learn/vocabulary/n5-vocab-001` at 1440x1100, 768x1024, and 390x844. Assert `scrollWidth === clientWidth`, capture console errors, and visually inspect hierarchy, touch targets, Japanese rendering, and detail navigation.

- [ ] **Step 2: Run final gates**

```bash
npm run lint
npm test -- --run
npm audit --audit-level=high
npm run build
```

Expected: exit code 0 for every command, zero test failures, zero high-severity vulnerabilities.

- [ ] **Step 3: Create repository hygiene files**

`.gitignore` excludes `node_modules/`, `dist/`, `.env*` except `.env.example`, `.DS_Store`, `.vscode/`, coverage, and debug logs. README documents project purpose, completed milestones, stack, local setup, scripts, current session-only limitation, and roadmap link.

- [ ] **Step 4: Initialize isolated project repository and inspect staged content**

```bash
git init
git branch -M main
git add .
git status --short
git diff --cached --stat
```

Confirm no secrets, `node_modules`, `dist`, editor files, or parent-repository files appear.

- [ ] **Step 5: Commit and push**

```bash
git commit -m "feat: build app through milestone 4"
git remote add origin https://github.com/DanarArrsyd/nihongo_personal.git
git push -u origin main
```

Expected: push succeeds and local `main` tracks `origin/main`.

- [ ] **Step 6: Verify remote commit**

```bash
git status --short
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Expected: clean status and matching local/remote commit SHA.
