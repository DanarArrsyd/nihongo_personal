# Milestone 5 Kanji Design

## Goal

Build a focused JLPT N5 Kanji workspace with 20 curated seed characters, a responsive character grid, dedicated detail pages, and explicit links to the existing vocabulary dataset. Stop before Kanji practice, stroke-order animation, progress state, persistence, SRS, or later milestones.

## Scope

### Included

- 20 curated JLPT N5 seed characters in structured JSON
- Kanji grid and dedicated detail routes
- Indonesian meanings, on'yomi, kun'yomi, stroke count, and JLPT label
- Related vocabulary resolved from existing vocabulary IDs
- Responsive desktop, tablet, and smartphone layouts
- Empty relationship and invalid route recovery states
- Automated tests for data services and user-visible behavior

### Excluded

- Claiming a complete or official JLPT N5 Kanji corpus
- Kanji quizzes, flashcards, handwriting, radicals, mnemonics, or stroke-order animation
- Favorites, learning status, IndexedDB, SRS, and progress persistence
- Grammar or later milestone implementation
- New dependencies

## Data Model

Static Kanji content lives in `src/data/kanji/n5.json`. Each entry follows:

```json
{
  "id": "n5-kanji-001",
  "kanji": "食",
  "meaning": ["makan", "makanan"],
  "onyomi": ["ショク"],
  "kunyomi": ["た.べる"],
  "jlpt": "N5",
  "strokes": 9,
  "relatedVocabularyIds": ["n5-vocab-001", "n5-vocab-018"]
}
```

The dataset contains `食`, `飲`, `見`, `聞`, `読`, `書`, `話`, `行`, `来`, `帰`, `学`, `校`, `先`, `生`, `友`, `家`, `本`, `水`, `今`, and `日`. Readings and stroke counts are checked against the EDRDG KANJIDIC2 project. `N5` means the project's curated beginner seed classification; the UI must not claim that an official modern JLPT Kanji list exists.

Kanji data stores only vocabulary IDs. Word, reading, meaning, type, JLPT level, and examples remain owned by `src/data/vocabulary/n5.json` and are resolved at runtime. Missing or stale vocabulary IDs are ignored rather than crashing the page.

## Architecture

### Routes

- `/learn` gains a Kanji entry point
- `/learn/kanji` renders the 20-character index
- `/learn/kanji/:kanjiId` renders a dedicated character detail

`kanjiData.js` owns dataset lookup and cross-dataset relationship resolution. UI components consume the service and never import raw JSON. Kanji needs no context provider because Milestone 5 adds no mutable state.

### Components

- `KanjiPage`: heading, count, and responsive grid
- `KanjiGrid`: semantic list of linked specimen tiles
- `KanjiDetailPage`: character specimen, readings, metadata, and related vocabulary
- `RelatedVocabulary`: linked vocabulary records resolved by the service

### Service Interfaces

```js
getKanji()
getKanjiById(id)
getRelatedVocabulary(kanji)
```

`getKanji()` returns all 20 entries in curriculum order. `getKanjiById(id)` returns one item or `null`. `getRelatedVocabulary(kanji)` resolves `relatedVocabularyIds` against the existing vocabulary service, preserves the declared order, and drops unknown IDs. A missing Kanji argument returns an empty array.

## Interaction Flow

1. User opens Kanji from Learn.
2. Index presents 20 large, readable characters with meaning and stroke count.
3. Selecting a tile opens its dedicated detail route.
4. Detail presents the character, meanings, on'yomi, kun'yomi, stroke count, and JLPT seed label.
5. Related vocabulary links open the existing vocabulary detail route.
6. Invalid Kanji IDs show a clear recovery link to the Kanji index.

## Visual Direction

Subject: a private Kanji specimen notebook for one adult beginner. Page job: recognize a character, inspect its readings, then connect it to words already studied.

Existing design tokens remain authoritative:

- Paper `#F8F5EF`
- Surface `#FFFDF9`
- Ink `#262522`
- Japanese red `#C94A45`
- Matcha `#738768`
- Warm gold `#C49458`

Geist remains the UI face and Noto Sans JP remains the Japanese face. No new font or color dependency is introduced.

Signature element: each Kanji sits on a restrained practice-cell square with center and diagonal guidelines, like a personal character specimen sheet. A narrow stroke-count rail is functional metadata, not decoration. Japanese red appears only as the JLPT seal and active focus accent; surrounding panels stay quiet.

Desktop index:

```text
+---------------------------------------------------------------+
| Kanji / 漢字                         20 character seed set     |
+---------------------------------------------------------------+
| [ 食 | 9 strokes ] [ 飲 | 12 ] [ 見 | 7 ] [ 聞 | 14 ] [ 読 ] |
| [ meaning       ] [ meaning ] [ meaning ] [ meaning ] [ ... ] |
+---------------------------------------------------------------+
```

Desktop detail:

```text
+------------------------------+-------------------------------+
|                              | Meaning / readings            |
|       specimen cell 食       | On: ショク                    |
|                              | Kun: た.べる                  |
|         N5 / 9 strokes       | Related: 食べる, ご飯         |
+------------------------------+-------------------------------+
```

Tablet uses three or four grid columns depending on available width. Smartphone uses two columns and stacks detail sections. All touch targets are at least 44px, Japanese glyphs never clip, and no horizontal viewport overflow is allowed.

## Accessibility

- Semantic headings, lists, links, and definition lists
- Every tile has an accessible name containing character and primary meaning
- Japanese text uses `lang="ja"`
- On'yomi and kun'yomi remain text, not color-only labels
- Focus states remain visible
- Empty readings display `—` with a descriptive label
- Invalid routes explain the next available action
- Reduced-motion preference remains respected by existing global styles

## Error Handling

- Unknown Kanji ID renders recovery UI, not a crash
- Missing Kanji argument returns no related vocabulary
- Stale related vocabulary IDs are ignored
- Empty reading arrays render a neutral `—`
- Static local datasets create no network failure path

## Testing

- Service tests: 20-entry contract, known and unknown lookup, relationship order, stale ID handling, empty input
- Page tests: Learn entry, index count, representative tile, detail metadata, related vocabulary links, invalid ID recovery
- Regression suite: all existing shell, Dashboard, Kana, Practice, Vocabulary, and UI tests
- Final gates: ESLint, full Vitest suite, `npm audit --audit-level=high`, and production build
- Visual inspection: desktop 1440px, tablet 768px, smartphone 390px; verify layout, focus, overflow, and console output

## Acceptance Criteria

- Exactly 20 curated seed Kanji come from structured static data
- Grid and detail routes are fully usable on desktop, tablet, and smartphone
- Meaning, on'yomi, kun'yomi, stroke count, and JLPT seed information are visible
- Related vocabulary uses live records from the existing vocabulary dataset
- Invalid and incomplete relationship data recover safely
- No learning content is duplicated inside UI components
- No Milestone 6+ or deferred Kanji behavior is introduced
- Tests, lint, audit, and build pass
