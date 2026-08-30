# Milestone 8 Flashcards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reusable, finite Vocabulary, Kanji, and Grammar flashcard sessions with reveal, temporary ratings, keyboard controls, results, and responsive routes.

**Architecture:** Pure flashcard services own selection, response creation, and reducer state. Module adapters normalize existing static records into one card contract. Shared session components render all three modules, while thin route pages own module validation and deck restart lifecycle.

**Tech Stack:** React 19, React Router, JavaScript, Tailwind CSS, Lucide React, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-08-30-milestone-8-flashcards-design.md`

## Global Constraints

- Implement Milestone 8 only: Vocabulary, Kanji, and Grammar decks.
- Each session contains up to 10 unique cards.
- Ratings are temporary in-memory records; `again` advances and never requeues.
- Do not add IndexedDB writes, SRS intervals, due dates, persistence, Kana, or mixed decks.
- Do not add dependencies or modify static learning datasets.
- Reuse `getVocabulary()`, `getKanji()`, and `getGrammar()`.
- Preserve Mixed Quiz and Kana practice behavior.
- Use existing palette, Geist, Noto Sans JP, and project components.
- Keep all controls keyboard accessible, at least 44px, and usable at 1440px, 768px, and 390px.
- Write tests before production code and verify each test fails for the intended missing behavior.

---

### Task 1: Flashcard generation, response, and session services

**Files:**

- Create: `src/features/flashcards/services/flashcardGeneration.js`
- Create: `src/features/flashcards/services/flashcardGeneration.test.js`
- Create: `src/features/flashcards/services/flashcardResponse.js`
- Create: `src/features/flashcards/services/flashcardResponse.test.js`
- Create: `src/features/flashcards/services/flashcardSession.js`
- Create: `src/features/flashcards/services/flashcardSession.test.js`

**Interfaces:**

- Produces: `sampleFlashcards(items, { count = 10, rng = Math.random } = {})`
- Produces: `createFlashcardResponse({ card, rating, now = () => new Date() })`
- Produces: `FLASHCARD_RATINGS`, `createFlashcardState(cards)`, `flashcardSessionReducer(state, action)`, `getCurrentCard(state)`, `getFlashcardProgress(state)`, and `getRatingCounts(state)`
- Response shape: `{ cardId, rating, timestamp, associatedItem: { module, itemId } }`

- [ ] **Step 1: Write failing generation tests**

```js
import { describe, expect, it } from 'vitest'
import { sampleFlashcards } from './flashcardGeneration'

describe('sampleFlashcards', () => {
  it('selects at most ten unique items without mutating source order', () => {
    const items = Array.from({ length: 12 }, (_, index) => ({ id: `card-${index}` }))
    const original = [...items]

    const selected = sampleFlashcards(items, { rng: () => 0 })

    expect(selected).toHaveLength(10)
    expect(new Set(selected.map(({ id }) => id))).toHaveSize(10)
    expect(items).toEqual(original)
  })

  it('returns every item when source contains fewer than requested', () => {
    expect(sampleFlashcards([{ id: 'one' }, { id: 'two' }], { count: 10, rng: () => 0 }))
      .toHaveLength(2)
  })

  it.each([null, {}, []])('returns an empty selection for unusable input %#', (items) => {
    expect(sampleFlashcards(items)).toEqual([])
  })
})
```

- [ ] **Step 2: Run generation tests and verify RED**

Run: `npm test -- src/features/flashcards/services/flashcardGeneration.test.js`

Expected: FAIL because `flashcardGeneration.js` does not exist.

- [ ] **Step 3: Implement deterministic unique sampling**

Implement a Fisher-Yates copy shuffle. Clamp `count` to a non-negative integer and never mutate `items`.

```js
export function sampleFlashcards(items, { count = 10, rng = Math.random } = {}) {
  if (!Array.isArray(items) || items.length === 0 || !Number.isInteger(count) || count <= 0) return []

  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
```

- [ ] **Step 4: Write failing response and reducer tests**

Cover these separate behaviors with literal fixtures:

```js
const cards = [
  { id: 'card-one', source: { module: 'vocabulary', itemId: 'vocab-one' } },
  { id: 'card-two', source: { module: 'vocabulary', itemId: 'vocab-two' } },
]

it('creates an immutable deterministic rating record', () => {
  const response = createFlashcardResponse({
    card: cards[0],
    rating: 'good',
    now: () => new Date('2026-08-30T12:00:00.000Z'),
  })

  expect(response).toEqual({
    cardId: 'card-one',
    rating: 'good',
    timestamp: '2026-08-30T12:00:00.000Z',
    associatedItem: { module: 'vocabulary', itemId: 'vocab-one' },
  })
  expect(Object.isFrozen(response)).toBe(true)
})

it('ignores rating until the current card is revealed', () => {
  const state = createFlashcardState(cards)
  expect(flashcardSessionReducer(state, { type: 'RATE', response: { rating: 'good' } })).toBe(state)
})

it('records one revealed rating and advances hidden to the next card', () => {
  const revealed = flashcardSessionReducer(createFlashcardState(cards), { type: 'REVEAL' })
  const response = createFlashcardResponse({ card: cards[0], rating: 'hard' })
  const next = flashcardSessionReducer(revealed, { type: 'RATE', response })

  expect(next.currentIndex).toBe(1)
  expect(next.revealed).toBe(false)
  expect(next.responses).toEqual([response])
})

it('completes after the final rating and derives exact counts', () => {
  // Rate both fixtures through real reducer actions.
  expect(state.status).toBe('completed')
  expect(getRatingCounts(state)).toEqual({ again: 0, hard: 1, good: 1, easy: 0 })
})
```

Also test idempotent reveal, invalid ratings, duplicate rating actions, progress values, empty state, and restart with replacement cards.

- [ ] **Step 5: Run response/session tests and verify RED**

Run: `npm test -- src/features/flashcards/services/flashcardResponse.test.js src/features/flashcards/services/flashcardSession.test.js`

Expected: FAIL because service modules do not exist.

- [ ] **Step 6: Implement minimal response and reducer services**

Use exact ratings:

```js
export const FLASHCARD_RATINGS = ['again', 'hard', 'good', 'easy']
```

Reducer action contracts:

```js
{ type: 'REVEAL' }
{ type: 'RATE', response }
{ type: 'RESTART', cards }
```

`RATE` must verify revealed state, current card ID, a supported rating, and no existing response for the current card. The final valid rating sets `status: 'completed'`; earlier ratings increment `currentIndex` and hide the next answer.

- [ ] **Step 7: Run Task 1 tests and full regression suite**

Run: `npm test -- src/features/flashcards/services`

Run: `npm test`

Expected: all tests PASS with no warnings.

- [ ] **Step 8: Commit Task 1**

```bash
git add src/features/flashcards/services
git commit -m "feat: add flashcard session services"
```

---

### Task 2: Module adapters and deck factory

**Files:**

- Create: `src/features/flashcards/adapters/vocabularyFlashcardAdapter.js`
- Create: `src/features/flashcards/adapters/vocabularyFlashcardAdapter.test.js`
- Create: `src/features/flashcards/adapters/kanjiFlashcardAdapter.js`
- Create: `src/features/flashcards/adapters/kanjiFlashcardAdapter.test.js`
- Create: `src/features/flashcards/adapters/grammarFlashcardAdapter.js`
- Create: `src/features/flashcards/adapters/grammarFlashcardAdapter.test.js`
- Create: `src/features/flashcards/adapters/flashcardDeckAdapter.js`
- Create: `src/features/flashcards/adapters/flashcardDeckAdapter.test.js`

**Interfaces:**

- Consumes: `sampleFlashcards`
- Consumes: `getVocabulary()`, `getKanji()`, and `getGrammar()`
- Produces: `createVocabularyFlashcard(item)`, `createKanjiFlashcard(item)`, and `createGrammarFlashcard(item)`
- Produces: `FLASHCARD_MODULES` and `createFlashcardDeck({ module, count = 10, rng = Math.random, sources } = {})`
- Deck result: `{ cards, error }`, where error is `null`, `'unknown-module'`, or `'unavailable'`

- [ ] **Step 1: Write failing adapter mapping tests**

Use complete fixtures matching current JSON shapes. Assert literal normalized output rather than adapter helpers.

```js
it('maps vocabulary front, answer details, and real example', () => {
  expect(createVocabularyFlashcard(vocabularyFixture)).toEqual({
    id: 'flashcard-vocabulary-n5-vocab-001',
    source: { module: 'vocabulary', itemId: 'n5-vocab-001' },
    front: {
      eyebrow: 'Vocabulary',
      primary: { text: '食べる', lang: 'ja' },
      hint: 'Ingat bacaan dan artinya.',
    },
    back: {
      title: { text: 'たべる', lang: 'ja' },
      meaning: 'makan',
      details: [
        { label: 'Romaji', value: { text: 'taberu' } },
        { label: 'Jenis', value: { text: 'verb' } },
      ],
      example: {
        japanese: '私はパンを食べます。',
        reading: 'わたしはパンをたべます。',
        meaning: 'Saya makan roti.',
      },
    },
  })
})
```

Kanji expected output must include meanings as the title, on'yomi, kun'yomi, stroke count, and JLPT. Grammar expected output must include meaning as title, structure, explanation, and first real example. Add malformed-record tests returning `null`. Add optional-example tests proving blank example UI data is omitted.

- [ ] **Step 2: Run mapping tests and verify RED**

Run: `npm test -- src/features/flashcards/adapters/vocabularyFlashcardAdapter.test.js src/features/flashcards/adapters/kanjiFlashcardAdapter.test.js src/features/flashcards/adapters/grammarFlashcardAdapter.test.js`

Expected: FAIL because adapter files do not exist.

- [ ] **Step 3: Implement module mappers**

Keep mappers pure. Use text objects for values that can contain Japanese:

```js
{ label: "On'yomi", value: { text: item.onyomi.join('、'), lang: 'ja' } }
```

Return `null` when required identity or primary content is missing. Filter empty details and optional examples.

- [ ] **Step 4: Write failing deck-factory tests**

```js
it.each(['vocabulary', 'kanji', 'grammar'])('builds a valid unique %s deck', (module) => {
  const result = createFlashcardDeck({
    module,
    rng: () => 0,
    sources: completeSources,
  })

  expect(result.error).toBeNull()
  expect(result.cards).toHaveLength(10)
  expect(new Set(result.cards.map(({ id }) => id))).toHaveSize(10)
  expect(result.cards.every((card) => card.source.module === module)).toBe(true)
})

it('rejects an unknown module', () => {
  expect(createFlashcardDeck({ module: 'kana', sources: completeSources }))
    .toEqual({ cards: [], error: 'unknown-module' })
})

it('rejects an empty or fully malformed source', () => {
  expect(createFlashcardDeck({ module: 'grammar', sources: { grammar: [] } }))
    .toEqual({ cards: [], error: 'unavailable' })
})
```

- [ ] **Step 5: Run deck tests and verify RED**

Run: `npm test -- src/features/flashcards/adapters/flashcardDeckAdapter.test.js`

Expected: FAIL because deck adapter does not exist.

- [ ] **Step 6: Implement deck factory**

`sources` is an optional test seam. Defaults must call existing data services. Map, remove `null`, sample once, then validate every normalized card has a unique non-empty ID, known source module/item ID, front primary text, back title text, and valid detail/value shapes.

- [ ] **Step 7: Run adapters and full suite**

Run: `npm test -- src/features/flashcards/adapters`

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 8: Commit Task 2**

```bash
git add src/features/flashcards/adapters
git commit -m "feat: adapt learning data to flashcards"
```

---

### Task 3: Shared flashcard session UI

**Files:**

- Create: `src/features/flashcards/FlashcardSession.jsx`
- Create: `src/features/flashcards/FlashcardSession.test.jsx`
- Create: `src/features/flashcards/components/StudyCard.jsx`
- Create: `src/features/flashcards/components/RatingControls.jsx`
- Create: `src/features/flashcards/components/FlashcardProgress.jsx`
- Create: `src/features/flashcards/components/FlashcardResults.jsx`
- Create: `src/features/flashcards/components/FlashcardUnavailable.jsx`

**Interfaces:**

- Consumes Task 1 services and response factory
- Produces: `<FlashcardSession cards onRestart now />`
- Produces: `<FlashcardUnavailable title description primaryAction secondaryAction />`
- `onRestart` returns replacement cards; parent session key remains the hard reset boundary

- [ ] **Step 1: Write failing front/reveal tests**

Render `FlashcardSession` with two complete normalized fixtures and a deterministic clock.

```jsx
it('hides answer details until reveal', () => {
  render(<FlashcardSession cards={cards} onRestart={() => cards} />)

  expect(screen.getByRole('heading', { name: '食べる' })).toBeVisible()
  expect(screen.queryByText('makan')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Tampilkan jawaban' })).toBeVisible()
  expect(screen.getByRole('button', { name: /Again/ })).toBeDisabled()
})

it('reveals Japanese answer content and moves focus to it', () => {
  render(<FlashcardSession cards={cards} onRestart={() => cards} />)
  fireEvent.click(screen.getByRole('button', { name: 'Tampilkan jawaban' }))

  const answer = screen.getByRole('heading', { name: 'たべる' })
  expect(answer).toHaveFocus()
  expect(answer).toHaveAttribute('lang', 'ja')
  expect(screen.getByText('makan')).toBeVisible()
})
```

- [ ] **Step 2: Run session test and verify RED**

Run: `npm test -- src/features/flashcards/FlashcardSession.test.jsx`

Expected: FAIL because session UI does not exist.

- [ ] **Step 3: Implement front, reveal, progress, and ratings**

Use semantic article/section structure. `StudyCard` renders text content through one helper that applies `lang` and `font-japanese`. Rating controls use native buttons and exact accessible labels such as `Again, tombol 1`.

Rating metadata:

```js
[
  { value: 'again', label: 'Again', shortcut: '1', description: 'Belum ingat' },
  { value: 'hard', label: 'Hard', shortcut: '2', description: 'Masih sulit' },
  { value: 'good', label: 'Good', shortcut: '3', description: 'Cukup ingat' },
  { value: 'easy', label: 'Easy', shortcut: '4', description: 'Langsung ingat' },
]
```

- [ ] **Step 4: Add failing advance, completion, restart, and keyboard tests**

Cover:

- Clicking each rating creates one response and advances hidden to the next card
- Double-click cannot record twice
- Final rating renders exact distribution and a list of completed items
- Restart calls `onRestart` once and resets to an unrevealed first card
- `Space` reveals only while hidden
- `1` through `4` rate only after reveal
- Shortcuts are ignored from input, textarea, select, and contenteditable targets
- Invalid/empty cards render unavailable recovery instead of crashing
- Results and rating labels retain `text-ink`; icons provide semantic color

- [ ] **Step 5: Run tests and verify RED for new behaviors**

Run: `npm test -- src/features/flashcards/FlashcardSession.test.jsx`

Expected: new tests FAIL on missing completion, restart, or shortcut behavior.

- [ ] **Step 6: Implement minimal completion, restart, and keyboard behavior**

Register one document `keydown` handler in `FlashcardSession`, clean it up on unmount, and read current reducer state without adding global state. Prevent the page from scrolling only when `Space` successfully reveals.

Results show counts for all four ratings, including zero values, plus one list item per response. Restart delegates deck replacement to the route host and dispatches `RESTART` only with returned valid cards.

- [ ] **Step 7: Run component and full tests**

Run: `npm test -- src/features/flashcards/FlashcardSession.test.jsx`

Run: `npm test`

Expected: all tests PASS with no `act` or accessibility warnings.

- [ ] **Step 8: Commit Task 3**

```bash
git add src/features/flashcards/FlashcardSession.jsx src/features/flashcards/FlashcardSession.test.jsx src/features/flashcards/components
git commit -m "feat: add reusable flashcard session UI"
```

---

### Task 4: Flashcard selector, module routes, and Practice entry

**Files:**

- Create: `src/features/flashcards/FlashcardsPage.jsx`
- Create: `src/features/flashcards/FlashcardsPage.test.jsx`
- Create: `src/features/flashcards/FlashcardSessionPage.jsx`
- Create: `src/features/flashcards/FlashcardSessionPage.test.jsx`
- Modify: `src/features/practice/PracticePage.jsx`
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

**Interfaces:**

- Consumes: `createFlashcardDeck`, `FLASHCARD_MODULES`, `FlashcardSession`, and `FlashcardUnavailable`
- Produces routes: `/practice/flashcards` and `/practice/flashcards/:module`
- Session host owns `{ cards, sessionVersion }`; restart replaces cards and increments the `FlashcardSession` key

- [ ] **Step 1: Write failing selector and routing tests**

```jsx
it('offers exactly three module decks', () => {
  renderRoute('/practice/flashcards')

  expect(screen.getByRole('heading', { name: 'Flashcards', level: 1 })).toBeVisible()
  expect(screen.getByRole('link', { name: /Vocabulary/ })).toHaveAttribute('href', '/practice/flashcards/vocabulary')
  expect(screen.getByRole('link', { name: /Kanji/ })).toHaveAttribute('href', '/practice/flashcards/kanji')
  expect(screen.getByRole('link', { name: /Grammar/ })).toHaveAttribute('href', '/practice/flashcards/grammar')
})

it('adds Flashcards to Practice while preserving Mixed Quiz and Kana', () => {
  renderRoute('/practice')

  expect(screen.getByRole('link', { name: 'Pilih deck Flashcards' }))
    .toHaveAttribute('href', '/practice/flashcards')
  expect(screen.getByRole('link', { name: 'Mulai Mixed Quiz' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Practice Hiragana' })).toBeVisible()
})
```

- [ ] **Step 2: Run selector tests and verify RED**

Run: `npm test -- src/features/flashcards/FlashcardsPage.test.jsx src/App.test.jsx`

Expected: FAIL because routes and pages are missing.

- [ ] **Step 3: Implement selector, routes, and Practice CTA**

Register the static selector route before the parameterized module route:

```jsx
<Route path="/practice/flashcards" element={<FlashcardsPage />} />
<Route path="/practice/flashcards/:module" element={<FlashcardSessionPage />} />
```

Selector cards use real module names and concise Indonesian descriptions. Practice keeps Mixed Quiz visually primary and places Flashcards as a distinct active-recall section before Kana cards.

- [ ] **Step 4: Write failing session-route tests**

Mock only `createFlashcardDeck` for deterministic route lifecycle tests; keep real session reducer and UI.

Cover:

- Vocabulary, Kanji, and Grammar routes call factory once with matching module
- Correct route heading and first front render
- Complete a small injected deck and see results
- Restart calls factory again and returns to hidden front
- Unknown module renders `Deck tidak ditemukan`
- Factory failure renders `Flashcard belum tersedia`
- Recovery links point to deck selector and Practice

- [ ] **Step 5: Run route tests and verify RED**

Run: `npm test -- src/features/flashcards/FlashcardSessionPage.test.jsx`

Expected: FAIL because session host does not exist.

- [ ] **Step 6: Implement thin session host and recovery**

Validate `module` against `FLASHCARD_MODULES` before generation. Use a lazy state initializer so generation occurs once per mount. Restart must call `createFlashcardDeck` again, replace cards, increment `sessionVersion`, and pass it as the `FlashcardSession` key.

- [ ] **Step 7: Run routes and full suite**

Run: `npm test -- src/features/flashcards/FlashcardsPage.test.jsx src/features/flashcards/FlashcardSessionPage.test.jsx src/App.test.jsx`

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 8: Commit Task 4**

```bash
git add src/App.jsx src/App.test.jsx src/features/practice/PracticePage.jsx src/features/flashcards/FlashcardsPage.jsx src/features/flashcards/FlashcardsPage.test.jsx src/features/flashcards/FlashcardSessionPage.jsx src/features/flashcards/FlashcardSessionPage.test.jsx
git commit -m "feat: launch module flashcard routes"
```

---

### Task 5: Study-fuda responsive styling and final validation

**Files:**

- Modify: `src/styles/index.css`
- Modify flashcard JSX/tests only when validation exposes a task-specific defect

**Interfaces:**

- Consumes stable `flashcard-*` class names from Task 3 and Task 4
- Produces responsive selector, study fuda, progress rail, rating grid, and results treatment

- [ ] **Step 1: Add approved design classes**

Inside `@layer components`, style these stable classes using existing variables only:

```css
.flashcard-study-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 1.5rem;
  background: var(--color-surface);
  box-shadow: 0 18px 50px rgb(38 37 34 / 0.07);
}

.flashcard-module-mark {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  border-inline-start: 1px solid var(--color-border);
  color: var(--color-accent);
}

.flashcard-progress-rail {
  height: 0.25rem;
  overflow: hidden;
  border-radius: 9999px;
  background: var(--color-paper-deep);
}

.flashcard-progress-rail > span {
  display: block;
  height: 100%;
  background: var(--color-accent);
  transition: width 180ms ease;
}

.flashcard-rating-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.flashcard-rating-button {
  min-height: 2.75rem;
  color: var(--color-ink);
}

@media (min-width: 48rem) {
  .flashcard-rating-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .flashcard-progress-rail > span {
    transition: none;
  }
}
```

Normal text remains `--color-ink`. Accent, gold, blue, and matcha appear on border/background/icon semantics only. Add visible `:focus-visible` behavior and reduced-motion override. Avoid hardcoded colors outside the approved palette.

- [ ] **Step 2: Run automated gates**

Run: `npm test`

Run: `npm run lint`

Run: `npm audit --audit-level=high`

Run: `npm run build`

Expected: 0 failures, 0 lint errors, no high-severity audit failure, and successful Vite build.

- [ ] **Step 3: Inspect required visual states**

Run: `npm run dev -- --host 127.0.0.1`

Inspect `/practice/flashcards`, plus all three module routes, at 1440px, 768px, and 390px. Exercise front, revealed, completed, invalid module, and unavailable states. Confirm:

- one stable page frame and no viewport horizontal overflow
- readable Japanese with correct language/font treatment
- reveal and rating targets at least 44px
- visible keyboard focus and working Space/1/2/3/4 shortcuts
- no shortcut activation from editable targets
- two-column mobile rating layout and clear desktop progress rail
- reduced-motion behavior
- no application console errors

- [ ] **Step 4: Verify scope**

Run: `git diff --check`

Run: `git diff $(git merge-base main HEAD)..HEAD -- package.json src`

Expected: no dependency change, IndexedDB write, SRS scheduling, Kana flashcard, mixed deck, or Milestone 9+ behavior.

- [ ] **Step 5: Commit Task 5**

```bash
git add src/styles/index.css src/features/flashcards src/features/practice/PracticePage.jsx src/App.jsx src/App.test.jsx
git commit -m "style: polish responsive flashcard workspace"
```
