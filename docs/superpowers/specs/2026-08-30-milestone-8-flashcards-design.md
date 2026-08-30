# Milestone 8 Flashcards Design

## Goal

Build a reusable active-recall flashcard system for Vocabulary, Kanji, and Grammar. Each module provides a finite 10-card in-memory session with reveal, rating, progress, restart, and a completed-session summary.

## Scope

### Included

- Flashcard deck selector for Vocabulary, Kanji, and Grammar
- One reusable normalized card contract and session reducer
- Module adapters backed by existing static learning-data services
- Finite sessions of up to 10 unique cards
- Front, reveal, Again, Hard, Good, and Easy interactions
- Temporary per-session rating records and a rating summary
- Restart with a newly generated deck
- Keyboard controls for reveal and rating
- Responsive desktop, tablet, and smartphone layouts
- Accessible active, revealed, completed, invalid-route, and unavailable states
- Service, adapter, component, route, and regression tests

### Excluded

- Mixed-module decks or Kana flashcards
- IndexedDB, persistence, resume-after-refresh, favorites writes, or settings
- SRS intervals, due dates, requeueing, scheduling, mastery changes, or review queues
- Audio playback, timers, streaks, rewards, confetti, or adaptive difficulty
- Editing or duplicating static learning datasets
- New dependencies

## Routes and Entry Points

- `/practice` gains a primary Flashcards entry alongside Mixed Quiz and Kana practice
- `/practice/flashcards` presents three module decks
- `/practice/flashcards/:module` starts the chosen session
- Supported module parameters are `vocabulary`, `kanji`, and `grammar`
- Unknown module parameters render a clear recovery state with links to the deck selector and Practice

Refresh creates a new in-memory session. No session survives reload in Milestone 8.

## Session Size and Selection

Each adapter selects up to 10 unique records from its module using an injected RNG. All current datasets contain enough records for a 10-card session, but the contract remains safe for smaller future fixtures: a non-empty source with fewer than 10 records produces every unique record; an empty or invalid source produces an unavailable result.

Restart generates a replacement deck and resets every response. Selection order may vary, but static learning data remains unchanged.

## Normalized Flashcard Model

Every module adapter produces this common shape:

```js
{
  id: 'flashcard-vocabulary-n5-vocab-001',
  source: {
    module: 'vocabulary',
    itemId: 'n5-vocab-001',
  },
  front: {
    eyebrow: 'Vocabulary',
    primary: { text: '食べる', lang: 'ja' },
    hint: 'Ingat bacaan dan artinya.',
  },
  back: {
    title: { text: 'たべる', lang: 'ja' },
    meaning: 'makan',
    details: [
      { label: 'Romaji', value: 'taberu' },
      { label: 'Jenis', value: 'verb' },
    ],
    example: {
      japanese: '私はパンを食べます。',
      reading: 'わたしはパンをたべます。',
      meaning: 'Saya makan roti.',
    },
  },
}
```

The model contains renderable text data only. It never contains React nodes, event handlers, rating state, persistence fields, SRS scheduling, or copied module records.

## Module Card Contracts

### Vocabulary

Front:

- Japanese word
- Prompt to recall reading and meaning

Back:

- Reading and Indonesian meaning
- Romaji and word type
- First real example sentence when available

### Kanji

Front:

- Large Kanji glyph
- Prompt to recall meaning and readings

Back:

- Indonesian meanings
- On'yomi, kun'yomi, and stroke count
- JLPT level

### Grammar

Front:

- Grammar pattern
- Prompt to recall meaning and structure

Back:

- Indonesian meaning
- Structure and explanation
- First real example when available
- Related-grammar metadata is not duplicated into the card session

Japanese values always carry `lang="ja"` and use the project Japanese font. Empty optional fields are omitted rather than rendered as blank rows.

## Rating Contract

Supported ratings are exact string values:

- `again`
- `hard`
- `good`
- `easy`

Ratings describe the learner's recall judgment for the current in-memory session. They do not calculate intervals or update learning status.

Again deliberately advances like every other rating and does not requeue the card. Requeueing belongs to the SRS milestone; adding it now could create unbounded sessions and prematurely couple the UI to scheduling rules.

## Response Record

Rating a revealed card creates one immutable in-memory record:

```js
{
  cardId: 'flashcard-vocabulary-n5-vocab-001',
  rating: 'good',
  timestamp: '2026-08-30T12:00:00.000Z',
  associatedItem: {
    module: 'vocabulary',
    itemId: 'n5-vocab-001',
  },
}
```

The response factory accepts a clock dependency for deterministic tests. This record is compatible with later persistence and SRS adapters without implementing either now.

## Session State

The reducer owns:

```js
{
  cards: [],
  currentIndex: 0,
  revealed: false,
  responses: [],
  status: 'active',
}
```

Supported actions:

- `REVEAL`: exposes the current back and is idempotent
- `RATE`: accepts the first valid rating only after reveal, records it, then advances or completes
- `RESTART`: creates fresh state from a newly generated deck

There is no previous-card navigation during an active session. Ratings are judgments, not correct answers, and cannot be edited in Milestone 8. The results screen shows all recorded ratings and their distribution.

Derived selectors provide current card, progress, completion, and rating counts. State never stores redundant percentages or counters.

## Architecture

### Services

- `flashcardSession.js`: initial state, reducer, selectors, and rating validation
- `flashcardResponse.js`: immutable response record with injected clock
- `flashcardGeneration.js`: unique sampling with injected RNG

### Adapters

- `vocabularyFlashcardAdapter.js`
- `kanjiFlashcardAdapter.js`
- `grammarFlashcardAdapter.js`
- `flashcardDeckAdapter.js`: validates module names, obtains existing module data, and returns `{ cards, error }`

Adapters consume `getVocabulary()`, `getKanji()`, and `getGrammar()`. They do not import JSON directly and do not change existing data services.

### Components

- `FlashcardSession`: active/completed session composition and keyboard handling
- `StudyCard`: accessible front/back presentation
- `RatingControls`: Again, Hard, Good, and Easy actions
- `FlashcardProgress`: current position and slim progress rail
- `FlashcardResults`: rating distribution, completed-card list, and restart
- `FlashcardUnavailable`: invalid or empty deck recovery

### Route Pages

- `FlashcardsPage`: module deck selector
- `FlashcardSessionPage`: thin route validator, deck generator, restart host, and shared-session key owner
- `PracticePage`: adds the Flashcards entry without removing Mixed Quiz or Kana practice
- `App.jsx`: registers static selector route before the parameterized session route

Business rules stay in services and adapters. Route pages own only parameters, deck lifecycle, headings, and recovery destinations.

## Data Flow

1. User opens the deck selector and chooses one module.
2. Session route validates the module parameter.
3. Deck adapter gets real static records through the module service.
4. Module adapter maps records into normalized cards.
5. Generator selects up to 10 unique cards once for the mounted session.
6. Invalid or empty results render recovery UI.
7. Session reducer starts on the first card with its back hidden.
8. Reveal exposes the answer and rating controls.
9. Rating creates one response and advances to the next card.
10. Final rating shows results with distribution and completed-card review.
11. Restart generates a new deck and increments the session key.
12. Leaving or refreshing discards the session.

## Keyboard Interaction

- `Space` reveals the current card while the back is hidden
- `1` rates Again after reveal
- `2` rates Hard after reveal
- `3` rates Good after reveal
- `4` rates Easy after reveal
- Shortcuts do nothing when focus is inside an input, textarea, select, or editable element
- Shortcuts do nothing when the corresponding action is unavailable

Visible labels show shortcut numbers. Buttons remain the primary interaction and all behavior works without a keyboard.

## Visual Direction

Subject: a calm personal recall desk for one adult Japanese learner. Page job: focus on one learning item, make an honest recall judgment, and continue with minimal friction.

Existing tokens remain authoritative:

- Paper `#F8F5EF`
- Paper deep `#F1EBDD`
- Surface `#FFFDF9`
- Ink `#262522`
- Ink muted `#77736B`
- Japanese red `#C94A45`
- Matcha `#738768`
- Warm gold `#C49458`
- Border `#DDD6C9`

Geist remains the UI face and Noto Sans JP remains the Japanese face. No new colors, fonts, gradients, or dependencies are introduced.

Signature element: the study fuda. The active card is a generous paper-like study slip with a narrow vertical module label and a functional progress rail. This creates a Japanese stationery reference without decorative imitation, anime styling, or a generic dashboard-card grid.

The front keeps one dominant Japanese learning item and a concise recall prompt. Reveal does not perform a 3D flip; the same stable frame expands into a structured answer area. This avoids motion sickness, preserves reading orientation, and reduces layout shift.

Desktop uses a centered study fuda with progress information in a quiet side rail. Tablet reduces side whitespace while preserving the same hierarchy. Smartphone uses a full-width card, puts progress above content, and renders ratings in a two-column grid. Every interactive target is at least 44px. No viewport-level horizontal overflow is permitted.

Ratings use the existing palette with text and icons, never color alone. Again uses Japanese red, Hard uses warm gold, Good uses muted blue, and Easy uses matcha on borders and icons. Normal-sized text uses ink on soft surfaces so every label keeps accessible contrast.

Motion is limited to a subtle reveal transition and progress update. `prefers-reduced-motion` removes non-essential transition. No card flip, bounce, confetti, glow, oversized score hero, or decorative progress dots are used.

## Accessibility

- One page-level `h1`; session question and result headings follow semantic hierarchy
- Japanese text uses `lang="ja"` and Noto Sans JP
- Reveal and rating controls are native buttons
- Front and revealed state are announced through clear visible text
- Revealed answer uses a polite live region without stealing focus
- Rating buttons are unavailable before reveal
- Focus moves to the revealed-answer heading after reveal and to the next card heading after rating
- Keyboard shortcuts never replace labeled controls
- Rating meaning uses labels and icons in addition to color
- Touch targets are at least 44px with visible keyboard focus
- Empty and invalid states explain the problem and provide a recovery action

## Error Handling

- Unknown module: render `FlashcardUnavailable` with `Deck tidak ditemukan`
- Empty or malformed source: render `FlashcardUnavailable` with `Flashcard belum tersedia`
- Invalid normalized card set: return an unavailable result rather than a partial broken session
- Optional missing fields: omit their row while keeping the card usable
- Development errors remain visible through deterministic service return values and tests; errors are not silently swallowed

## Testing Strategy

### Service Tests

- Initialization hides the back and starts at card one
- Reveal is idempotent
- Rating before reveal or with an unknown value is ignored
- First valid rating creates one immutable response and advances
- Final rating completes the session
- Restart clears responses and accepts replacement cards
- Derived rating counts are correct
- Clock injection produces deterministic timestamps

### Adapter Tests

- Each module maps real record shapes into the normalized contract
- Japanese fields carry language metadata
- Optional fields are omitted safely
- Sampling is unique, bounded to 10, and deterministic with injected RNG
- Unknown and empty modules produce clear unavailable results

### Component Tests

- Front hides answer details
- Reveal exposes the correct module-specific back
- Ratings remain unavailable before reveal
- Each rating advances once and cannot double-submit
- Keyboard shortcuts follow reveal and focus guards
- Results show exact rating distribution and completed items
- Restart resets to an unrevealed first card
- Japanese text, focus, live-region, icon/text semantics, and 44px targets are covered

### Route and Regression Tests

- Practice links to Flashcards while retaining Mixed Quiz and Kana
- Selector exposes exactly Vocabulary, Kanji, and Grammar
- All three session routes render their real module content
- Invalid module and unavailable deck recover safely
- Refresh boundary remains in-memory only
- Existing full test suite remains green

### Visual Inspection

Inspect selector, front, revealed, and results states for all three modules at 1440px, 768px, and 390px. Confirm stable layout, no viewport overflow, readable Japanese, visible focus, 44px targets, shortcut hints, reduced-motion behavior, and no console errors.

## Acceptance Criteria

- User can select Vocabulary, Kanji, or Grammar from `/practice/flashcards`
- Each module starts a finite session of up to 10 unique cards
- Answer details remain hidden until Reveal
- Again, Hard, Good, and Easy record temporary ratings and advance exactly once
- Final rating produces a complete session summary
- Restart creates a clean replacement deck
- Mouse, touch, and keyboard flows work on desktop, tablet, and smartphone
- Invalid and empty decks fail safely with recovery actions
- No IndexedDB, SRS scheduling, persistence, or Milestone 9+ behavior is introduced
- Lint, tests, audit, production build, scope checks, and visual inspection pass
