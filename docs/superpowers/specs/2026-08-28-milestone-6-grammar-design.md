# Milestone 6 Grammar Design

## Goal

Build a focused JLPT N5 grammar workspace with 12 curated beginner patterns, a filterable index, dedicated detail pages, structured explanations, example sentences, and explicit related-grammar links. Stop before grammar quizzes, flashcards, progress state, persistence, SRS, or later milestones.

## Scope

### Included

- 12 curated JLPT N5 beginner patterns in structured JSON
- Grammar index and dedicated detail routes
- Pattern, Indonesian meaning, structure, explanation, and example sentences
- Related grammar resolved from grammar IDs
- Data-driven JLPT filter with `Semua` and `N5` options
- Responsive desktop, tablet, and smartphone layouts
- Empty filter and invalid route recovery states
- Automated tests for data services and user-visible behavior

### Excluded

- Claiming a complete or official JLPT N5 grammar corpus
- Grammar quizzes, flashcards, exercises, typing, or sentence completion
- Favorites, learning status, IndexedDB, SRS, and progress persistence
- Milestone 7 reusable quiz engine or later milestones
- Search, category navigation, relationship graphs, and new dependencies

## Curriculum

The seed curriculum contains these 12 patterns in deliberate beginner order:

1. `Noun + です`
2. `Noun + ではありません`
3. `～は`
4. `～も`
5. `Noun + の + Noun`
6. `～を`
7. `～に`
8. `～で`
9. `～へ`
10. `～と`
11. `～があります／います`
12. `Verb stem + たいです`

Each entry teaches one primary beginner use. Explanations must identify important limits when a particle has additional meanings, rather than presenting one example as its complete behavior. `N5` is the project's curated beginner classification; the UI must not claim that an official modern JLPT grammar list exists.

## Data Model

Static grammar content lives in `src/data/grammar/n5.json`. Each entry follows:

```json
{
  "id": "n5-grammar-012",
  "pattern": "～たいです",
  "meaning": "ingin melakukan sesuatu",
  "jlpt": "N5",
  "structure": "Verb stem + たいです",
  "explanation": "Pola ini menyatakan keinginan pembicara untuk melakukan suatu tindakan.",
  "examples": [
    {
      "japanese": "日本へ行きたいです。",
      "reading": "にほんへいきたいです。",
      "meaning": "Saya ingin pergi ke Jepang."
    }
  ],
  "relatedGrammarIds": ["n5-grammar-009"]
}
```

Every record has a stable unique ID, non-empty Indonesian explanation, at least two examples, and valid related IDs. Related records are resolved at runtime, so grammar content is never duplicated inside components. Missing or stale related IDs are ignored rather than crashing the page.

## Architecture

### Routes

- `/learn` gains a Grammar entry point
- `/learn/grammar` renders the grammar index
- `/learn/grammar/:grammarId` renders a dedicated grammar detail

`grammarData.js` owns dataset access, level filtering, lookup, and relationship resolution. UI components consume this service and never import raw JSON. Grammar needs no context provider because Milestone 6 adds no mutable state.

### Components

- `GrammarPage`: heading, curriculum count, JLPT filter, and pattern list
- `GrammarList`: semantic list of linked pattern rows
- `GrammarDetailPage`: pattern, meaning, formula, explanation, examples, and related grammar
- `GrammarFormula`: restrained visual rendering of structure segments
- `RelatedGrammar`: linked records resolved by the service

### Service Interfaces

```js
getGrammar()
getGrammarLevels()
filterGrammarByLevel(items, level)
getGrammarById(id)
getRelatedGrammar(grammar)
```

`getGrammar()` returns all 12 entries in curriculum order. `getGrammarLevels()` derives available levels from the dataset. `filterGrammarByLevel(items, level)` returns all items for `all`, filters exact JLPT values, and returns an empty array for unknown levels. `getGrammarById(id)` returns one item or `null`. `getRelatedGrammar(grammar)` preserves declared order, drops unknown IDs, and returns an empty array when no grammar record is supplied.

## Data Flow

1. User opens Grammar from Learn.
2. `GrammarPage` obtains records and level options through `grammarData.js`.
3. Selecting `Semua` or `N5` filters the in-memory static dataset without persistence.
4. Selecting a pattern opens its dedicated detail route.
5. `GrammarDetailPage` resolves the route ID, renders the record, and resolves related grammar through the service.
6. Related links open another grammar detail route.
7. Invalid IDs and empty filter results show clear recovery actions.

## Visual Direction

Subject: a private grammar construction desk for one adult Indonesian beginner. Page job: recognize a pattern, understand its construction, and inspect it in real sentences.

Existing design tokens remain authoritative:

- Paper `#F8F5EF`
- Surface `#FFFDF9`
- Ink `#262522`
- Japanese red `#C94A45`
- Matcha `#738768`
- Border `#DDD6C9`

Geist remains the UI face and Noto Sans JP remains the Japanese face. No new font or color dependency is introduced.

Signature element: grammar structures appear as a restrained construction rail. Formula segments such as `Verb stem`, `+`, and `たいです` are visually separated to reveal sentence anatomy. This is the only expressive device; surrounding layout stays quiet and consistent with the existing workspace.

The index uses full-width pattern rows rather than a generic card grid. Each row exposes pattern, meaning, structure, and JLPT level. Detail pages prioritize the Japanese pattern and construction rail, followed by explanation and vertically ordered examples.

Desktop keeps a spacious single content column with filter controls in the header. Tablet retains the same hierarchy with reduced gaps. Smartphone stacks metadata and content; the construction rail may scroll horizontally inside its own labeled region, but the viewport must never overflow. Touch targets are at least 44px and Japanese glyphs never clip.

The design deliberately avoids a statistics hero, dashboard cards, decorative numbering, gradients, and relationship diagrams. Those patterns do not help grammar comprehension and would make this module feel generic.

## Accessibility

- Semantic headings, lists, links, labels, and definition structures
- Japanese content uses `lang="ja"`
- Filter has an accessible label and visible selected state
- Pattern rows have accessible names containing pattern and meaning
- Construction rail remains understandable as text without color
- Keyboard focus remains visible on all interactive controls
- Horizontal formula overflow remains keyboard and touch accessible
- Invalid and empty states explain the next available action
- Reduced-motion preference remains respected by existing global styles

## Error Handling

- Unknown grammar ID renders recovery UI with a link to the Grammar index
- Unknown filter value yields an explicit empty state, not a crash
- Missing grammar input returns no related records
- Stale related IDs are ignored
- Missing optional example reading renders `—` with a descriptive label
- Static local datasets create no network failure path

## Testing

- Service tests: 12-entry contract, derived levels, all/N5/unknown filtering, known and unknown lookup, relationship order, stale ID handling, and empty input
- Page tests: Learn entry, index count, filter behavior, representative pattern row, detail explanation and examples, related links, and invalid ID recovery
- Regression suite: all existing shell, Dashboard, Kana, Practice, Vocabulary, Kanji, and UI tests
- Final gates: ESLint, full Vitest suite, `npm audit --audit-level=high`, and production build
- Visual inspection: desktop 1440px, tablet 768px, smartphone 390px; verify layout, focus, formula overflow, and console output

## Acceptance Criteria

- Exactly 12 curated N5 beginner patterns come from structured static data
- Grammar index and detail routes are fully usable on desktop, tablet, and smartphone
- Pattern, meaning, structure, explanation, examples, related grammar, and JLPT level are visible
- JLPT filtering is data-driven and does not depend on UI-owned content
- Invalid and incomplete relationship data recover safely
- No learning content or relationship logic is duplicated inside UI components
- No Milestone 7+ or deferred Grammar behavior is introduced
- Tests, lint, audit, and build pass
