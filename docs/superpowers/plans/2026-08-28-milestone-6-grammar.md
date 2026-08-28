# Milestone 6 Grammar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive Milestone 6 Grammar workspace containing exactly 12 curated N5 beginner patterns, list filtering, detail pages, examples, and related grammar.

**Architecture:** Static learning content lives in one JSON dataset and is exposed through a pure data service. Route-level React components use focused list, formula, and relationship components; no UI component imports raw JSON or owns business logic. The module follows existing Learn, Vocabulary, and Kanji routing and visual patterns without introducing mutable state or dependencies.

**Tech Stack:** React 19, React Router 7, JavaScript, Tailwind CSS 4, Lucide React, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-08-28-milestone-6-grammar-design.md`

## Global Constraints

- Implement Milestone 6 only; do not add quiz, flashcards, exercises, progress, persistence, SRS, search, categories, or relationship graphs.
- Store static grammar content in `src/data/grammar/n5.json`; never store it in IndexedDB or UI components.
- Provide exactly 12 curated beginner patterns and avoid claiming an official or complete JLPT N5 list.
- Use existing Geist, Noto Sans JP, and project color tokens; add no dependency, font, or random color.
- Desktop first, but tablet and smartphone must remain fully usable with no viewport overflow.
- Keep touch targets at least 44px, Japanese text tagged `lang="ja"`, focus visible, and meaning independent from color.
- All existing tests, ESLint, high-severity audit, and production build must pass.

## File Map

- Create `src/data/grammar/n5.json`: owns the 12 static curriculum records.
- Create `src/features/grammar/services/grammarData.js`: owns access, filtering, lookup, and related-record resolution.
- Create `src/features/grammar/services/grammarData.test.js`: verifies all service contracts and stale input behavior.
- Create `src/features/grammar/GrammarPage.jsx`: owns index-page composition and local JLPT filter selection.
- Create `src/features/grammar/GrammarDetailPage.jsx`: owns route lookup, recovery UI, and detail composition.
- Create `src/features/grammar/components/GrammarFilters.jsx`: accessible level selector.
- Create `src/features/grammar/components/GrammarList.jsx`: semantic linked pattern rows and empty state.
- Create `src/features/grammar/components/GrammarFormula.jsx`: readable, horizontally safe structure rail.
- Create `src/features/grammar/components/RelatedGrammar.jsx`: semantic related-pattern links.
- Create `src/features/grammar/GrammarPage.test.jsx`: verifies Learn entry, filtering, details, relationships, and recovery.
- Modify `src/features/learn/LearnPage.jsx`: add Grammar module entry.
- Modify `src/App.jsx`: register Grammar index and detail routes.
- Modify `src/styles/index.css`: add the construction-rail signature using existing tokens.

---

### Task 1: Grammar dataset and service

**Files:**
- Create: `src/data/grammar/n5.json`
- Create: `src/features/grammar/services/grammarData.js`
- Create: `src/features/grammar/services/grammarData.test.js`

**Interfaces:**
- Consumes: static JSON imports supported by Vite.
- Produces: `getGrammar()`, `getGrammarLevels()`, `filterGrammarByLevel(items, level)`, `getGrammarById(id)`, and `getRelatedGrammar(item)`.

- [ ] **Step 1: Write failing service tests**

Create `grammarData.test.js` with assertions for the exact 12-item contract, derived `['N5']` levels, `all` and `N5` filters, unknown filter, known and unknown IDs, declared relationship order, stale IDs, and empty input:

```js
import {
  filterGrammarByLevel,
  getGrammar,
  getGrammarById,
  getGrammarLevels,
  getRelatedGrammar,
} from './grammarData'

describe('grammarData', () => {
  it('returns the 12-pattern curriculum in order', () => {
    const grammar = getGrammar()
    expect(grammar).toHaveLength(12)
    expect(grammar[0].id).toBe('n5-grammar-001')
    expect(grammar[11].id).toBe('n5-grammar-012')
    expect(grammar.every((item) => item.examples.length >= 2)).toBe(true)
  })

  it('derives levels and filters records', () => {
    const grammar = getGrammar()
    expect(getGrammarLevels()).toEqual(['N5'])
    expect(filterGrammarByLevel(grammar, 'all')).toHaveLength(12)
    expect(filterGrammarByLevel(grammar, 'N5')).toHaveLength(12)
    expect(filterGrammarByLevel(grammar, 'N4')).toEqual([])
  })

  it('looks up known IDs and safely rejects unknown IDs', () => {
    expect(getGrammarById('n5-grammar-012')?.pattern).toBe('～たいです')
    expect(getGrammarById('not-real')).toBeNull()
  })

  it('resolves related grammar in declared order', () => {
    const related = getRelatedGrammar(getGrammarById('n5-grammar-001'))
    expect(related.map((item) => item.id)).toEqual([
      'n5-grammar-002',
      'n5-grammar-003',
    ])
  })

  it('ignores stale relationships and empty input', () => {
    expect(getRelatedGrammar({ relatedGrammarIds: ['missing', 'n5-grammar-012'] }))
      .toEqual([getGrammarById('n5-grammar-012')])
    expect(getRelatedGrammar()).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests and verify expected failure**

Run: `npm test -- src/features/grammar/services/grammarData.test.js`

Expected: FAIL because `grammarData.js` does not exist.

- [ ] **Step 3: Create exact curriculum data**

Create 12 records numbered `n5-grammar-001` through `n5-grammar-012`. Use these exact patterns, structures, example pairs, and relationship IDs:

```text
001 ～です | Noun + です
  meaning: adalah; menyatakan identitas atau keadaan dengan sopan
  explanation: Tambahkan です setelah nomina untuk menyatakan identitas atau keadaan dengan sopan.
  私は学生です。 / わたしはがくせいです。 / Saya seorang pelajar.
  今日は月曜日です。 / きょうはげつようびです。 / Hari ini hari Senin.
  related: 002, 003
002 ～ではありません | Noun + ではありません
  meaning: bukan; bentuk negatif sopan
  explanation: Tambahkan ではありません setelah nomina untuk menyangkal identitas atau keadaan dengan sopan.
  私は先生ではありません。 / わたしはせんせいではありません。 / Saya bukan guru.
  これは本ではありません。 / これはほんではありません。 / Ini bukan buku.
  related: 001, 003
003 ～は | Topic + は + Comment
  meaning: menandai topik kalimat
  explanation: は menandai hal yang sedang dibicarakan dan dibaca わ ketika berfungsi sebagai partikel.
  私はインドネシア人です。 / わたしはインドネシアじんです。 / Saya orang Indonesia.
  この本は面白いです。 / このほんはおもしろいです。 / Buku ini menarik.
  related: 001, 004
004 ～も | Noun + も
  meaning: juga; pun
  explanation: も menggantikan は untuk menunjukkan bahwa informasi yang sama berlaku pada nomina lain.
  私も学生です。 / わたしもがくせいです。 / Saya juga seorang pelajar.
  田中さんも日本人です。 / たなかさんもにほんじんです。 / Tanaka juga orang Jepang.
  related: 003
005 ～の | Noun + の + Noun
  meaning: menyatakan kepemilikan atau hubungan antar nomina
  explanation: の menghubungkan dua nomina; nomina pertama menerangkan kepemilikan atau jenis nomina kedua.
  これは私の本です。 / これはわたしのほんです。 / Ini buku saya.
  田中さんは日本語の先生です。 / たなかさんはにほんごのせんせいです。 / Tanaka adalah guru bahasa Jepang.
  related: 001, 003
006 ～を | Noun + を + Verb
  meaning: menandai objek langsung
  explanation: を menandai benda yang langsung dikenai tindakan dan dibaca お sebagai partikel.
  毎朝パンを食べます。 / まいあさぱんをたべます。 / Saya makan roti setiap pagi.
  日本語を勉強します。 / にほんごをべんきょうします。 / Saya belajar bahasa Jepang.
  related: 008, 012
007 ～に | Time + に + Verb
  meaning: menandai waktu terjadinya kegiatan
  explanation: に ditempatkan setelah waktu tertentu untuk menunjukkan kapan kegiatan berlangsung.
  七時に起きます。 / しちじにおきます。 / Saya bangun pukul tujuh.
  日曜日に勉強します。 / にちようびにべんきょうします。 / Saya belajar pada hari Minggu.
  related: 008, 009
008 ～で | Place + で + Action
  meaning: menandai tempat berlangsungnya kegiatan
  explanation: で menandai tempat suatu tindakan atau kegiatan dilakukan.
  図書館で勉強します。 / としょかんでべんきょうします。 / Saya belajar di perpustakaan.
  家でご飯を食べます。 / いえでごはんをたべます。 / Saya makan di rumah.
  related: 006, 007
009 ～へ | Place + へ + Movement verb
  meaning: menandai arah tujuan
  explanation: へ menandai arah gerakan dan dibaca え ketika berfungsi sebagai partikel.
  日本へ行きます。 / にほんへいきます。 / Saya pergi ke Jepang.
  学校へ来ます。 / がっこうへきます。 / Saya datang ke sekolah.
  related: 007, 012
010 ～と | Person + と + Action
  meaning: bersama; dengan seseorang
  explanation: と menandai orang yang melakukan suatu tindakan bersama subjek.
  友達と話します。 / ともだちとはなします。 / Saya berbicara dengan teman.
  家族と日本へ行きます。 / かぞくとにほんへいきます。 / Saya pergi ke Jepang bersama keluarga.
  related: 009
011 ～があります／います | Place + に + Noun + が + あります／います
  meaning: menyatakan keberadaan benda atau makhluk hidup
  explanation: Gunakan あります untuk benda mati dan います untuk manusia atau hewan.
  机の上に本があります。 / つくえのうえにほんがあります。 / Ada buku di atas meja.
  教室に先生がいます。 / きょうしつにせんせいがいます。 / Ada guru di ruang kelas.
  related: 005, 007
012 ～たいです | Verb stem + たいです
  meaning: ingin melakukan sesuatu
  explanation: Ganti ます pada bentuk sopan dengan たいです untuk menyatakan keinginan pembicara.
  寿司を食べたいです。 / すしをたべたいです。 / Saya ingin makan sushi.
  日本へ行きたいです。 / にほんへいきたいです。 / Saya ingin pergi ke Jepang.
  related: 006, 009
```

Every JSON record also contains `jlpt: "N5"`. Copy the exact meaning and explanation shown above into the matching record.

- [ ] **Step 4: Implement the service**

```js
import grammar from '../../../data/grammar/n5.json'

export function getGrammar() {
  return grammar
}

export function getGrammarLevels() {
  return [...new Set(grammar.map((item) => item.jlpt))]
}

export function filterGrammarByLevel(items, level) {
  if (level === 'all') return items
  return items.filter((item) => item.jlpt === level)
}

export function getGrammarById(id) {
  return grammar.find((item) => item.id === id) ?? null
}

export function getRelatedGrammar(item) {
  if (!item?.relatedGrammarIds) return []
  return item.relatedGrammarIds.map(getGrammarById).filter(Boolean)
}
```

- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/features/grammar/services/grammarData.test.js`

Expected: all service tests PASS.

- [ ] **Step 6: Commit dataset and service**

```bash
git add src/data/grammar/n5.json src/features/grammar/services/grammarData.js src/features/grammar/services/grammarData.test.js
git commit -m "feat: add N5 grammar curriculum service"
```

---

### Task 2: Grammar index, filter, and Learn entry

**Files:**
- Create: `src/features/grammar/GrammarPage.jsx`
- Create: `src/features/grammar/components/GrammarFilters.jsx`
- Create: `src/features/grammar/components/GrammarList.jsx`
- Create: `src/features/grammar/GrammarPage.test.jsx`
- Modify: `src/features/learn/LearnPage.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: Task 1 service functions and existing `Badge`, `Card`, `EmptyState`, React Router, and Lucide patterns.
- Produces: `/learn/grammar`, `GrammarPage`, `GrammarFilters({ levels, selectedLevel, onLevelChange })`, and `GrammarList({ items })`.

- [ ] **Step 1: Write failing index tests**

Add these cases to `GrammarPage.test.jsx`, using the existing `MemoryRouter` and `App` render helper pattern from `KanjiPage.test.jsx`:

```js
it('opens Grammar from Learn', () => {
  renderRoute('/learn')
  expect(screen.getByRole('link', { name: 'Study Grammar' })).toHaveAttribute(
    'href',
    '/learn/grammar',
  )
})

it('shows the 12-pattern Grammar index', () => {
  renderRoute('/learn/grammar')
  expect(screen.getByRole('heading', { name: 'Grammar', level: 1 })).toBeVisible()
  expect(screen.getByText('12 patterns')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Study ～です — adalah; menyatakan identitas atau keadaan dengan sopan' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Study ～たいです — ingin melakukan sesuatu' })).toBeVisible()
})

it('filters the curriculum by JLPT level', () => {
  renderRoute('/learn/grammar')
  fireEvent.change(screen.getByRole('combobox', { name: 'JLPT level' }), {
    target: { value: 'N5' },
  })
  expect(screen.getAllByRole('link', { name: /^Study / })).toHaveLength(12)
})
```

Import `fireEvent`, `render`, and `screen` from `@testing-library/react`; do not add `@testing-library/user-event`.

- [ ] **Step 2: Run index tests and verify failure**

Run: `npm test -- src/features/grammar/GrammarPage.test.jsx`

Expected: FAIL because Grammar routes and components do not exist.

- [ ] **Step 3: Add the Learn module and route**

Add a `Grammar` record to `learningModules` in `LearnPage.jsx` with `japanese: '文法'`, `to: '/learn/grammar'`, description `Study 12 beginner sentence patterns through clear structures and examples.`, an existing Lucide book-like icon, and existing accent/matcha tone classes. Import `GrammarPage` in `App.jsx` and register `/learn/grammar` before its future detail route.

- [ ] **Step 4: Implement accessible filters**

`GrammarFilters` renders a visible `<label htmlFor="grammar-level">JLPT level</label>` and a native `<select id="grammar-level">` containing `Semua` with value `all`, followed by every value from `levels`. Use existing border, surface, ink, focus, and 44px-height classes.

- [ ] **Step 5: Implement semantic pattern rows and empty state**

`GrammarList` renders `<ul>` and linked `<li>` rows. Each link targets `/learn/grammar/${item.id}`, uses accessible name `Study ${item.pattern} — ${item.meaning}`, and displays Japanese pattern, Indonesian meaning, `item.structure`, and `item.jlpt`. If `items.length === 0`, render existing `EmptyState` with title `Tidak ada pola grammar` and description `Pilih level lain untuk melihat materi yang tersedia.`

- [ ] **Step 6: Compose the index page**

`GrammarPage` calls `getGrammar()` and `getGrammarLevels()`, stores only `selectedLevel` with initial value `all`, derives filtered items with `filterGrammarByLevel`, and renders:

```jsx
<GrammarFilters
  levels={levels}
  selectedLevel={selectedLevel}
  onLevelChange={setSelectedLevel}
/>
<GrammarList items={filteredGrammar} />
```

Use heading `Grammar`, Japanese seal `文法`, badge `Curated JLPT N5 seed`, count `${filteredGrammar.length} patterns`, Indonesian-supporting description, and a back link to `/learn`. Do not add search, progress, or persistence.

- [ ] **Step 7: Run focused tests**

Run: `npm test -- src/features/grammar/GrammarPage.test.jsx`

Expected: index and Learn-entry tests PASS.

- [ ] **Step 8: Commit index slice**

```bash
git add src/App.jsx src/features/learn/LearnPage.jsx src/features/grammar/GrammarPage.jsx src/features/grammar/GrammarPage.test.jsx src/features/grammar/components/GrammarFilters.jsx src/features/grammar/components/GrammarList.jsx
git commit -m "feat: add grammar curriculum index"
```

---

### Task 3: Grammar detail and related patterns

**Files:**
- Create: `src/features/grammar/GrammarDetailPage.jsx`
- Create: `src/features/grammar/components/GrammarFormula.jsx`
- Create: `src/features/grammar/components/RelatedGrammar.jsx`
- Modify: `src/features/grammar/GrammarPage.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `getGrammarById(id)` and `getRelatedGrammar(item)` from Task 1.
- Produces: `/learn/grammar/:grammarId`, `GrammarFormula({ structure })`, and `RelatedGrammar({ items })`.

- [ ] **Step 1: Write failing detail and recovery tests**

```js
it('shows Grammar details, examples, and related links', () => {
  renderRoute('/learn/grammar/n5-grammar-012')
  expect(screen.getByRole('heading', { name: '～たいです', level: 1 })).toBeVisible()
  expect(screen.getByText('Verb stem')).toBeVisible()
  expect(screen.getByText('ingin melakukan sesuatu')).toBeVisible()
  expect(screen.getByText('寿司を食べたいです。')).toBeVisible()
  expect(screen.getByText('すしをたべたいです。')).toBeVisible()
  expect(screen.getByText('Saya ingin makan sushi.')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Open grammar ～を' })).toHaveAttribute(
    'href',
    '/learn/grammar/n5-grammar-006',
  )
})

it('shows safe recovery for an invalid Grammar ID', () => {
  renderRoute('/learn/grammar/not-real')
  expect(screen.getByRole('heading', { name: 'Pola grammar tidak ditemukan' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Kembali ke Grammar' })).toHaveAttribute(
    'href',
    '/learn/grammar',
  )
})
```

- [ ] **Step 2: Run detail tests and verify failure**

Run: `npm test -- src/features/grammar/GrammarPage.test.jsx`

Expected: FAIL because the detail route does not exist.

- [ ] **Step 3: Implement the formula rail**

Split `structure` on `' + '` and render each segment in order. Insert a visible, aria-hidden `+` between segment pills while the container exposes `aria-label={structure}`. Wrap the rail in `overflow-x-auto`, keep `whitespace-nowrap`, and apply the `grammar-construction-rail` class added in Task 4. For `Noun + ではありません`, the visible tokens are `Noun`, `+`, and `ではありません`; the text remains comprehensible without color.

- [ ] **Step 4: Implement related links**

`RelatedGrammar` renders a semantic list. Every link targets `/learn/grammar/${item.id}`, has accessible name `Open grammar ${item.pattern}`, and shows pattern plus meaning. If empty, render `Belum ada pola terkait dalam kurikulum ini.`

- [ ] **Step 5: Implement the detail page and route**

Register `/learn/grammar/:grammarId` in `App.jsx`. `GrammarDetailPage` reads `grammarId` with `useParams`, calls `getGrammarById`, and returns recovery UI when null. Valid records render:

- back link `Kembali ke Grammar`
- badge `${item.jlpt} curated seed`
- `<h1 lang="ja">{item.pattern}</h1>`
- visible Indonesian meaning
- `GrammarFormula` with `item.structure`
- explanation section
- ordered example list, each containing Japanese, reading, and Indonesian meaning
- `RelatedGrammar` resolved through `getRelatedGrammar(item)`

Example Japanese and reading use `lang="ja"` and `font-japanese`. Use existing `Card` and `Badge`; do not duplicate relationship logic.

- [ ] **Step 6: Run focused tests**

Run: `npm test -- src/features/grammar/GrammarPage.test.jsx`

Expected: all Grammar page tests PASS.

- [ ] **Step 7: Commit detail slice**

```bash
git add src/App.jsx src/features/grammar/GrammarDetailPage.jsx src/features/grammar/GrammarPage.test.jsx src/features/grammar/components/GrammarFormula.jsx src/features/grammar/components/RelatedGrammar.jsx
git commit -m "feat: add grammar pattern details"
```

---

### Task 4: Responsive visual signature and final validation

**Files:**
- Modify: `src/styles/index.css`
- Modify: Grammar files only if validation exposes task-specific defects.

**Interfaces:**
- Consumes: `grammar-construction-rail` from Task 3 and existing design tokens.
- Produces: responsive construction-rail styling with no global behavioral change.

- [ ] **Step 1: Add construction-rail styling**

Inside `@layer components`, add `.grammar-construction-rail` using only existing tokens. Use a quiet paper-strip background with thin horizontal rules, not a gradient hero or new color. Add `.grammar-construction-segment` with surface background, border, restrained radius, ink text, and Japanese-compatible line height. Keep overflow controlled by the JSX container and avoid element selectors that could override unrelated components.

```css
.grammar-construction-rail {
  background-color: rgba(241, 235, 221, 0.55);
  background-image: linear-gradient(
    to bottom,
    transparent calc(50% - 0.5px),
    rgba(196, 148, 88, 0.22) 50%,
    transparent calc(50% + 0.5px)
  );
}

.grammar-construction-segment {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-surface);
  color: var(--color-ink);
  line-height: 1.5;
}
```

- [ ] **Step 2: Run focused and full tests**

Run: `npm test -- src/features/grammar/services/grammarData.test.js src/features/grammar/GrammarPage.test.jsx`

Expected: all focused tests PASS.

Run: `npm test`

Expected: complete suite PASS with no regression.

- [ ] **Step 3: Run static and dependency validation**

Run: `npm run lint`

Expected: exit code 0.

Run: `npm audit --audit-level=high`

Expected: no high-severity vulnerability causes failure.

- [ ] **Step 4: Build production bundle**

Run: `npm run build`

Expected: Vite production build completes with exit code 0.

- [ ] **Step 5: Inspect responsive layouts**

Run `npm run dev -- --host 127.0.0.1`, then inspect `/learn/grammar` plus `/learn/grammar/n5-grammar-012` at 1440px, 768px, and 390px. Confirm no viewport overflow, formula rail scrolls within its own region, Japanese glyphs do not clip, every touch target is at least 44px, keyboard focus is visible, and console contains no error.

- [ ] **Step 6: Commit visual and validation fixes**

```bash
git add src/styles/index.css src/features/grammar src/features/learn/LearnPage.jsx src/App.jsx
git commit -m "style: polish responsive grammar workspace"
```

- [ ] **Step 7: Verify final scope**

Run: `git diff HEAD~4..HEAD -- src package.json`

Expected: only Grammar, Learn entry, routes, and the focused construction-rail style changed; `package.json` has no new dependency and no Milestone 7 behavior appears.
