# Milestone 5 Kanji Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive Kanji workspace with 20 curated N5 seed characters, dedicated detail pages, and links to existing vocabulary records.

**Architecture:** A static JSON seed dataset feeds a pure Kanji data service. The service owns lookup and relationship resolution through the existing vocabulary service, while focused grid and detail components render immutable learning content without session state or persistence.

**Tech Stack:** React 19, Vite 8, JavaScript, React Router, Tailwind CSS, Lucide React, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-08-28-milestone-5-kanji-design.md`

## Global Constraints

- Implement Milestone 5 only; do not add Kanji practice, flashcards, handwriting, stroke order, status, persistence, SRS, Grammar, or later milestone behavior.
- Use exactly 20 curated seed characters and do not call the set a complete or official JLPT N5 list.
- Use no new dependencies.
- Static Kanji content stays in JSON; UI components contain no learning records.
- Related vocabulary must resolve existing IDs through the vocabulary service; do not copy vocabulary fields into Kanji data.
- UI must remain usable at 390px, 768px, and 1440px with visible focus and 44px touch targets.
- Use Geist for UI, Noto Sans JP for Japanese text, and the existing warm palette only.

---

### Task 1: Kanji Dataset and Relationship Service

**Files:**
- Create: `src/data/kanji/n5.json`
- Create: `src/features/kanji/services/kanjiData.js`
- Test: `src/features/kanji/services/kanjiData.test.js`

**Interfaces:**
- Consumes: local Kanji JSON and `getVocabularyById(id)` from `src/features/vocabulary/services/vocabularyData.js`
- Produces: `getKanji()`, `getKanjiById(id)`, `getRelatedVocabulary(kanji)`

- [ ] **Step 1: Write failing service tests**

```js
import { describe, expect, it } from 'vitest'
import { getKanji, getKanjiById, getRelatedVocabulary } from './kanjiData'

describe('kanji data service', () => {
  it('provides 20 structured beginner Kanji', () => {
    const items = getKanji()
    expect(items).toHaveLength(20)
    expect(items[0]).toEqual({
      id: 'n5-kanji-001',
      kanji: '食',
      meaning: ['makan', 'makanan'],
      onyomi: ['ショク'],
      kunyomi: ['た.べる'],
      jlpt: 'N5',
      strokes: 9,
      relatedVocabularyIds: ['n5-vocab-001', 'n5-vocab-018'],
    })
  })

  it('returns a Kanji by ID and null for an unknown ID', () => {
    expect(getKanjiById('n5-kanji-012')?.kanji).toBe('校')
    expect(getKanjiById('not-real')).toBeNull()
  })

  it('resolves related vocabulary in declared order', () => {
    expect(getRelatedVocabulary(getKanjiById('n5-kanji-001')).map((item) => item.word))
      .toEqual(['食べる', 'ご飯'])
  })

  it('ignores stale vocabulary IDs and empty Kanji input', () => {
    expect(getRelatedVocabulary({ relatedVocabularyIds: ['not-real', 'n5-vocab-017'] }).map((item) => item.word))
      .toEqual(['水'])
    expect(getRelatedVocabulary(null)).toEqual([])
  })
})
```

- [ ] **Step 2: Run service tests and verify RED**

Run: `npm test -- --run src/features/kanji/services/kanjiData.test.js`

Expected: FAIL because `kanjiData.js` does not exist.

- [ ] **Step 3: Add the 20-entry dataset**

Create records in this order: `食`, `飲`, `見`, `聞`, `読`, `書`, `話`, `行`, `来`, `帰`, `学`, `校`, `先`, `生`, `友`, `家`, `本`, `水`, `今`, `日`. Every record uses the schema from the spec. Readings and stroke counts are checked against KANJIDIC2. Relationships reference only existing `n5-vocab-*` IDs.

- [ ] **Step 4: Add minimal service implementation**

```js
import kanji from '../../../data/kanji/n5.json'
import { getVocabularyById } from '../../vocabulary/services/vocabularyData'

export function getKanji() {
  return kanji
}

export function getKanjiById(id) {
  return kanji.find((item) => item.id === id) ?? null
}

export function getRelatedVocabulary(item) {
  if (!item?.relatedVocabularyIds) return []
  return item.relatedVocabularyIds.map(getVocabularyById).filter(Boolean)
}
```

- [ ] **Step 5: Run service tests and verify GREEN**

Run: `npm test -- --run src/features/kanji/services/kanjiData.test.js`

Expected: all Kanji service tests pass without warnings.

### Task 2: Kanji Grid and Learn Entry

**Files:**
- Create: `src/features/kanji/components/KanjiGrid.jsx`
- Create: `src/features/kanji/KanjiPage.jsx`
- Create: `src/features/kanji/KanjiPage.test.jsx`
- Modify: `src/features/learn/LearnPage.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `getKanji()` and Kanji objects from Task 1
- Produces: `/learn/kanji`, linked tiles for `/learn/kanji/:kanjiId`, and Learn entry link named `Study Kanji`

- [ ] **Step 1: Write failing page tests for entry and grid**

```jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'

function renderRoute(path) {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

it('opens Kanji from Learn', () => {
  renderRoute('/learn')
  expect(screen.getByRole('link', { name: 'Study Kanji' })).toHaveAttribute('href', '/learn/kanji')
})

it('shows the 20-character Kanji index', () => {
  renderRoute('/learn/kanji')
  expect(screen.getByRole('heading', { name: 'Kanji', level: 1 })).toBeVisible()
  expect(screen.getByText('20 characters')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Study 食 — makan' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Study 日 — hari' })).toBeVisible()
})
```

- [ ] **Step 2: Run page tests and verify RED**

Run: `npm test -- --run src/features/kanji/KanjiPage.test.jsx`

Expected: FAIL because the route and Kanji UI do not exist.

- [ ] **Step 3: Implement semantic responsive grid**

`KanjiGrid` renders a `<ul>` with linked tiles. Each tile includes large Japanese glyph, primary Indonesian meaning, stroke count, and JLPT label. Use two columns by default, three at `sm`, four at `lg`, and five at `xl`. Links use `aria-label={`Study ${item.kanji} — ${item.meaning[0]}`}` and visible focus styles.

- [ ] **Step 4: Implement index page and Learn entry**

`KanjiPage` uses `getKanji()`, renders the approved specimen-sheet heading and count, then passes records to `KanjiGrid`. Add a quiet Kanji module entry below Vocabulary on `LearnPage`, keeping Kana and Vocabulary behavior unchanged. Register `/learn/kanji` before placeholder routes in `App.jsx`.

- [ ] **Step 5: Run page tests and verify GREEN**

Run: `npm test -- --run src/features/kanji/KanjiPage.test.jsx`

Expected: entry and grid tests pass without warnings.

### Task 3: Kanji Detail and Vocabulary Links

**Files:**
- Create: `src/features/kanji/components/RelatedVocabulary.jsx`
- Create: `src/features/kanji/KanjiDetailPage.jsx`
- Modify: `src/features/kanji/KanjiPage.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `getKanjiById(id)`, `getRelatedVocabulary(kanji)`, and existing vocabulary detail routes
- Produces: `/learn/kanji/:kanjiId`, metadata definition list, related vocabulary links, and invalid-ID recovery

- [ ] **Step 1: Add failing detail tests**

```jsx
it('shows Kanji details and related vocabulary links', () => {
  renderRoute('/learn/kanji/n5-kanji-001')
  expect(screen.getByRole('heading', { name: '食', level: 1 })).toBeVisible()
  expect(screen.getByText('makan, makanan')).toBeVisible()
  expect(screen.getByText('ショク')).toBeVisible()
  expect(screen.getByText('た.べる')).toBeVisible()
  expect(screen.getByText('9 strokes')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Open vocabulary 食べる' })).toHaveAttribute('href', '/learn/vocabulary/n5-vocab-001')
  expect(screen.getByRole('link', { name: 'Open vocabulary ご飯' })).toHaveAttribute('href', '/learn/vocabulary/n5-vocab-018')
})

it('renders an empty kunyomi without losing its label', () => {
  renderRoute('/learn/kanji/n5-kanji-012')
  expect(screen.getByText("Kun'yomi")).toBeVisible()
  expect(screen.getByText('—')).toBeVisible()
})

it('shows safe recovery for an invalid Kanji ID', () => {
  renderRoute('/learn/kanji/not-real')
  expect(screen.getByRole('heading', { name: 'Kanji not found' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Back to Kanji' })).toHaveAttribute('href', '/learn/kanji')
})
```

- [ ] **Step 2: Run detail tests and verify RED**

Run: `npm test -- --run src/features/kanji/KanjiPage.test.jsx`

Expected: new detail assertions fail because the detail route does not exist.

- [ ] **Step 3: Implement related vocabulary component**

Render resolved records as a semantic list of links to `/learn/vocabulary/:id`. Each link displays the existing word, reading, Indonesian meaning, and type; accessible name is `Open vocabulary ${item.word}`. If the list is empty, render `No related vocabulary in this seed set yet.`

- [ ] **Step 4: Implement detail page and route**

Read `kanjiId` with `useParams()`. Unknown IDs render recovery UI. Valid records render a large specimen cell plus a semantic definition list for meaning, on'yomi, kun'yomi, stroke count, and JLPT seed label. Empty reading arrays render `—`. Register `/learn/kanji/:kanjiId` after the index route and before placeholder routes.

- [ ] **Step 5: Run detail tests and verify GREEN**

Run: `npm test -- --run src/features/kanji/KanjiPage.test.jsx`

Expected: all Kanji page tests pass without warnings.

### Task 4: Visual Signature, Regression Proof, and Build

**Files:**
- Modify: `src/styles/index.css`
- Modify if validation exposes a defect: only files already listed in Tasks 1–3 or directly failing existing tests

**Interfaces:**
- Consumes: Kanji grid and detail markup from Tasks 2–3
- Produces: reusable `.kanji-specimen-grid` visual treatment and verified Milestone 5 build

- [ ] **Step 1: Add the approved specimen-cell style**

Add `.kanji-specimen-grid` under `@layer components`. Build its guidelines from the existing surface, border, and gold tokens using horizontal, vertical, and diagonal `linear-gradient` layers. Do not add colors, animations, images, or dependencies.

- [ ] **Step 2: Run focused Kanji tests**

Run: `npm test -- --run src/features/kanji`

Expected: all Kanji service and page tests pass.

- [ ] **Step 3: Run full validation**

```bash
npm run lint
npm test -- --run
npm audit --audit-level=high
npm run build
```

Expected: every command exits 0 with no test failures, ESLint errors, high-severity audit findings, or build errors.

- [ ] **Step 4: Inspect responsive layouts**

Run the Vite app and inspect `/learn/kanji` plus `/learn/kanji/n5-kanji-001` at 1440px, 768px, and 390px. Confirm no horizontal overflow, clipped glyphs, unreadable Japanese text, hidden focus, console errors, or touch targets below 44px.

- [ ] **Step 5: Stop at Milestone 5**

Confirm no Kanji quiz, handwriting, stroke order, mutable learning status, IndexedDB, SRS, Grammar, or later milestone code was added. Report changed files and validation results. Do not push unless the user separately requests it.
