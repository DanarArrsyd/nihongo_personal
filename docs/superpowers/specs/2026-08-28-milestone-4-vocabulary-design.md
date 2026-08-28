# Milestone 4 Vocabulary Design

## Goal

Build a focused JLPT N5 vocabulary workspace that supports browsing, searching, filtering, viewing word details, pronunciation, favorites, and session-only learning status. Stop before vocabulary quizzes, flashcards, persistence, SRS, or later milestones.

## Scope

### Included

- 30 curated JLPT N5 seed entries in structured JSON
- Vocabulary list and dedicated detail routes
- Search across Japanese word, reading, romaji, and Indonesian meaning
- Filters for word type and learning status
- Browser speech synthesis using `ja-JP`, with graceful fallback
- Favorite and learning-status controls stored only in React session state
- Responsive desktop, tablet, and smartphone layouts
- Empty search results and invalid vocabulary route recovery
- Automated tests for data services and user-visible behavior

### Excluded

- Claiming a complete JLPT N5 vocabulary corpus
- Vocabulary quizzes, flashcards, or mixed practice
- IndexedDB or any refresh persistence
- SRS scheduling, review queue, and mastery calculations
- Kanji, grammar, or later milestone implementation
- New dependencies

## Data Model

Static content lives in `src/data/vocabulary/n5.json`. Every entry follows:

```json
{
  "id": "n5-vocab-001",
  "word": "食べる",
  "reading": "たべる",
  "romaji": "taberu",
  "meaning": "makan",
  "type": "verb",
  "jlpt": "N5",
  "examples": [
    {
      "japanese": "私は寿司を食べます。",
      "reading": "わたしはすしをたべます。",
      "meaning": "Saya makan sushi."
    }
  ]
}
```

Static data never contains favorite or progress fields. Session state stores only item IDs mapped to `favorite` and `status`. Valid statuses are `new`, `learning`, `familiar`, and `mastered`.

## Architecture

### Routes

- `/learn` includes Kana and Vocabulary entry points
- `/learn/vocabulary` renders the searchable vocabulary index
- `/learn/vocabulary/:vocabularyId` renders a dedicated word detail

`VocabularySessionProvider` wraps both vocabulary routes so favorites and statuses survive route navigation but reset after page refresh. `vocabularyData.js` owns lookup, search, and filter behavior. UI components consume these interfaces and do not query raw JSON directly.

### Components

- `VocabularyLayout`: session-state provider and route outlet
- `VocabularyPage`: search/filter controls, results summary, list
- `VocabularyDetailPage`: selected word, pronunciation, example, favorite and status controls
- `VocabularyFilters`: accessible search and select controls
- `VocabularyList`: compact linked rows/cards
- `VocabularyStatusControl`: four explicit status buttons or select, keyboard accessible
- Shared `speech.js`: existing Japanese browser speech service reused from Kana

### Service Interfaces

```js
getVocabulary()
getVocabularyById(id)
filterVocabulary(items, { query, type, status }, getStatus)
getVocabularyTypes(items)
```

Search is case-insensitive for Latin text and uses substring matching for Japanese text. Empty query returns all items. `all` means no type or status filter. Unknown IDs return `null`.

## Interaction Flow

1. User opens Vocabulary from Learn.
2. Index shows all 30 entries and available filters.
3. Search or filter updates results immediately.
4. Selecting a word opens its detail route.
5. User can hear pronunciation, favorite the word, and change session status.
6. Returning to list preserves status and favorite until refresh.
7. Invalid ID shows a clear recovery link to Vocabulary.

## Visual Direction

Subject: a private Japanese vocabulary notebook for one adult learner. Page job: find a word quickly, then study it without visual noise.

Existing palette remains authoritative:

- Paper `#F8F5EF`
- Surface `#FFFDF9`
- Ink `#262522`
- Japanese red `#C94A45`
- Matcha `#738768`
- Warm gold `#C49458`

Typography remains Geist for UI and Noto Sans JP for Japanese content. No additional font dependency.

Signature element: a restrained vertical dictionary rail. Each list item pairs a large Japanese word with a narrow metadata strip, resembling indexed vocabulary cards rather than a generic dashboard grid. Genkō-yōshi lines appear only behind the selected Japanese word and example, preserving continuity with Kana without repeating decoration everywhere.

Desktop:

```text
+----------------------+---------------------------------------------+
| Search + filters     | Vocabulary heading + result count           |
+----------------------+---------------------------------------------+
| Word list            | Selected word / reading / meaning           |
| 食べる   verb  N5    | Status / favorite / pronunciation           |
| 見る     verb  N5    | Example sentence                            |
| ...                  |                                             |
+----------------------+---------------------------------------------+
```

Tablet uses a narrower two-column split when space permits. Smartphone stacks controls and list; detail becomes its own route with a visible back link. Search and controls use at least 44px touch targets. No horizontal viewport overflow.

## Accessibility

- Semantic headings, lists, labels, buttons, and links
- Search field has visible label
- Filters have labels and do not rely on placeholder text
- Favorite button exposes pressed state
- Status control exposes current value in text
- Japanese text uses `lang="ja"`
- Focus states remain visible
- Speech failure uses a live status message
- Empty and invalid states explain the next available action

## Error Handling

- Unknown vocabulary ID renders recovery UI, not a crash
- Missing browser speech support shows the existing pronunciation fallback
- Empty search results preserve filters and offer a clear reset action
- Dataset remains imported locally; no network failure path exists

## Testing

- Service tests: lookup, multilingual search, type filter, status filter, combined filters, type enumeration
- Page tests: Learn entry, initial list, search, filters, empty reset, detail route, favorite, status, pronunciation fallback, invalid ID
- Regression suite: all existing Kana, Dashboard, shell, and UI tests
- Final gates: ESLint, full Vitest suite, `npm audit --audit-level=high`, production build
- Visual inspection: desktop 1440px, tablet 768px, smartphone 390px; verify no overflow or console errors

## Git Delivery

The project directory becomes its own nested Git repository, isolating it from the unrelated parent repository at `/Users/ekadanararrasyid/VS Code`. Add `.gitignore` before staging so `node_modules`, `dist`, environment files, OS files, and editor-local files stay excluded. Create a useful README, commit project through Milestone 4 on `main`, add `https://github.com/DanarArrsyd/nihongo_personal.git` as `origin`, and push only after all validation passes.

Target commit message:

```text
feat: build app through milestone 4
```

The destination repository is public. No secrets or private learning data may be committed.

## Acceptance Criteria

- All 30 entries come from structured static data
- User can browse, search, filter, and open details
- Pronunciation, favorite UI, and all four learning statuses work during the session
- Desktop, tablet, and smartphone layouts remain fully usable
- Both empty and invalid states recover safely
- No Milestone 5+ behavior is introduced
- Tests, lint, audit, and build pass before Git commit and push
