# Milestone 7 Reusable Quiz Engine Design

## Goal

Build one reusable quiz engine shared by Kana, Vocabulary, Kanji, and Grammar. Migrate the existing Kana practice routes to the engine and add a 10-question Mixed Quiz that exercises all four learning modules and all five Milestone 7 question types.

## Scope

### Included

- Reusable question schema, validation, answer evaluation, response records, session reducer, navigation, score, and results
- Shared renderers for `multiple_choice`, `reverse_multiple_choice`, `typing`, `recognition`, and `sentence_completion`
- Module adapters for Kana, Vocabulary, Kanji, and Grammar
- Existing Kana practice routes migrated to the shared engine
- New `/practice/mixed` route and Practice entry point
- Finite 10-question Kana and Mixed sessions
- Previous-question review with locked answers
- Responsive desktop, tablet, and smartphone layouts
- Accessible unavailable, invalid, active, answered, and completed states
- Automated service, adapter, component, integration, and regression tests

### Excluded

- Matching, listening, sentence builder, speaking, or writing questions
- Flashcards, SRS, daily missions, mastery updates, or progress analytics
- IndexedDB persistence, saved quiz history, resume-after-refresh, or synchronization
- Timers, leaderboards, rewards, confetti, streaks, or difficulty adaptation
- New dependencies

## Routes and Session Size

- `/practice` gains a Mixed Quiz entry point
- `/practice/mixed` starts a 10-question mixed session
- `/practice/kana/:script/:mode` keeps the existing Hiragana and Katakana paths and modes

Each Kana route becomes a finite 10-question session. Recognition still means Kana to romaji multiple choice, reverse still means romaji to Kana multiple choice, and typing still means Kana to typed romaji. The finite result screen is the only deliberate behavior change from the previous looping session.

Refresh creates a new in-memory session. No session survives reload in Milestone 7.

## Normalized Question Model

Every adapter produces this common shape:

```js
{
  id: 'mixed-vocabulary-n5-vocab-001-meaning',
  type: 'multiple_choice',
  source: {
    module: 'vocabulary',
    itemId: 'n5-vocab-001',
  },
  instruction: 'Pilih arti yang tepat.',
  content: {
    kind: 'text',
    text: '食べる',
    lang: 'ja',
  },
  answer: {
    value: 'makan',
    acceptedValues: ['makan'],
  },
  options: [
    { value: 'makan', label: 'makan', lang: 'id' },
    { value: 'minum', label: 'minum', lang: 'id' },
  ],
}
```

Common fields are `id`, `type`, `source`, `instruction`, `content`, `answer`, and optional `options`.

Content variants:

- `text`: one prompt with `text` and optional `lang`
- `pair`: `primary` and `secondary` text used by true/false recognition
- `sentence`: `before`, `after`, and `lang`, with the answer rendered between the two segments

Answer values may be strings or booleans. `acceptedValues` supports equivalent typing answers. Option values use the same primitive type as the correct answer.

The question model deliberately contains no React nodes, component names, event handlers, timestamps, score, or persistence fields.

## Question Type Contracts

### `multiple_choice`

Displays a prompt and at least two options. The answer is one option value. Mixed Quiz uses this for Kana to romaji and Vocabulary word to Indonesian meaning.

### `reverse_multiple_choice`

Uses the same option interaction but reverses the learning direction. Mixed Quiz uses this for romaji to Kana and Indonesian meaning to Japanese Vocabulary.

### `typing`

Displays one prompt and a labeled text input. Evaluation applies Unicode `NFKC`, trims surrounding whitespace, and lowercases strings. Mixed Quiz uses this for Vocabulary or Kanji readings.

### `recognition`

Displays a proposed pair and exactly two explicit options: `Benar` and `Salah`. The answer is boolean. Mixed Quiz uses this for Kanji-to-meaning and Grammar-pattern-to-meaning pairs. Incorrect pairs use another real record from the same module, never invented learning content.

### `sentence_completion`

Displays a Japanese sentence split into `before` and `after`, with a visible blank between them. The user chooses the missing grammar token from real grammar patterns. Only simple particle entries whose stripped pattern token occurs in an example sentence are eligible. This avoids morphological guessing and keeps content derived from the approved Grammar dataset.

## Validation and Evaluation

`validateQuestion(question)` returns `{ valid, errors }` and checks:

- unique non-empty ID at quiz level
- supported question type
- known source module and non-empty item ID
- compatible content kind
- correct answer exists
- required options exist, have unique values, and include the correct answer
- recognition uses boolean answer and exactly `Benar`/`Salah` values
- typing has no selectable options
- sentence completion contains non-empty surrounding sentence content

`validateQuiz(questions)` validates every question, rejects duplicate IDs, and rejects an empty quiz.

`evaluateAnswer(question, userAnswer)` is pure and returns a boolean. String evaluation uses `NFKC`, trim, and lowercase normalization. Boolean evaluation uses exact equality. Unknown or malformed questions are rejected by validation before evaluation.

## Response Record

Submitting an answer creates one immutable in-memory record:

```js
{
  questionId: 'mixed-vocabulary-n5-vocab-001-meaning',
  questionType: 'multiple_choice',
  userAnswer: 'makan',
  correctAnswer: 'makan',
  result: true,
  timestamp: '2026-08-28T12:00:00.000Z',
  associatedItem: {
    module: 'vocabulary',
    itemId: 'n5-vocab-001',
  },
}
```

The response factory accepts a clock dependency for deterministic tests. Records are ready for a future persistence milestone but are not written to IndexedDB now.

## Session State and Navigation

The reducer owns:

```js
{
  questions: [],
  currentIndex: 0,
  responses: {},
  status: 'active',
}
```

Supported actions:

- `ANSWER`: records the first answer for the current question; later attempts are ignored
- `NEXT`: advances only after the current question is answered
- `PREVIOUS`: opens an earlier question without changing its answer
- `GO_TO`: opens the current question or any previously answered question; unanswered future questions stay unavailable
- `COMPLETE`: moves to results after the final question is answered
- `RESTART`: creates a fresh state from a newly generated question set

Score is derived from responses, never separately incremented. Completion occurs only when all questions have response records. Results show total correct, percentage, and every question with the submitted and correct answers.

## Module Adapters

Adapters depend on existing data services and return normalized questions. They never copy full static datasets into quiz code.

### Kana

- Consumes `getAllKana(script)`
- Preserves `recognition`, `reverse`, and `typing` route modes
- Maps route recognition to `multiple_choice`
- Maps route reverse to `reverse_multiple_choice`
- Maps route typing to `typing`
- Produces 10 unique questions when at least 10 source items exist

### Vocabulary

- Consumes `getVocabulary()`
- Produces word-to-meaning, meaning-to-word, typing-reading, and recognition candidates
- Distractors come from other real Vocabulary records

### Kanji

- Consumes `getKanji()`
- Produces Kanji-to-primary-meaning recognition and reading typing candidates
- Accepted typing readings remove the display separator dot from on'yomi and kun'yomi values where relevant; original learning data stays unchanged
- Distractors come from other real Kanji records

### Grammar

- Consumes `getGrammar()`
- Produces pattern-to-meaning recognition and sentence-completion candidates
- Sentence completion strips the leading `～` from simple particle patterns, finds that real token in an existing example, and splits the sentence at the first match
- Entries that cannot produce an unambiguous split are excluded from completion candidates

## Mixed Quiz Composition

`createMixedQuiz({ rng = Math.random })` uses this exact 10-slot blueprint:

1. Kana `multiple_choice`
2. Kana `reverse_multiple_choice`
3. Vocabulary `multiple_choice`
4. Vocabulary `reverse_multiple_choice`
5. Vocabulary `typing`
6. Kanji `typing`
7. Kanji `recognition`
8. Grammar `recognition`
9. Grammar `sentence_completion`
10. Grammar `sentence_completion`

This yields exactly two questions for every supported type and includes every learning module. Selection, distractors, option order, and final question order may use the injected RNG. Tests inject a deterministic RNG. The current static datasets must always supply all ten slots; an insufficient pool returns a clear unavailable result instead of a partial quiz.

## Architecture

### Services

- `questionValidation.js`: type and quiz validation
- `answerEvaluation.js`: normalization and pure correctness checks
- `quizResponse.js`: immutable response records with injected clock
- `quizSession.js`: initial state, reducer, score, completion, and navigation rules
- `quizGeneration.js`: selection, option creation, and injected RNG helpers

### Adapters

- `kanaQuizAdapter.js`
- `vocabularyQuizAdapter.js`
- `kanjiQuizAdapter.js`
- `grammarQuizAdapter.js`
- `mixedQuizAdapter.js`

### Components

- `QuizSession`: shared active/completed composition
- `QuestionRenderer`: exhaustive type switch with safe unsupported fallback
- `ChoiceQuestion`: shared option interaction for multiple-choice variants
- `TypingQuestion`
- `RecognitionQuestion`
- `SentenceCompletionQuestion`
- `AnswerFeedback`
- `AnswerTrail`
- `QuizResults`
- `QuizUnavailable`

### Route Pages

- `KanaPracticePage` becomes a thin route adapter and shared-session host
- `MixedQuizPage` builds the mixed set once per mounted session and hosts `QuizSession`
- `PracticePage` links to Mixed Quiz and retains both Kana entries

Question generation and session logic never live inside route pages or renderer components.

## Data Flow

1. Route page validates route parameters when applicable.
2. Adapter obtains static records through existing data services.
3. Adapter creates normalized questions once for the mounted session.
4. `validateQuiz` checks the complete set.
5. Invalid or insufficient sets render `QuizUnavailable` with a Practice recovery link.
6. `QuizSession` initializes the reducer with valid questions.
7. Renderer collects one answer and dispatches `ANSWER` with an injected-clock response.
8. Feedback appears; next navigation unlocks.
9. Final answer completes the session and shows `QuizResults`.
10. Restart generates a new question set; leaving or refreshing discards the session.

## Visual Direction

Subject: a calm personal test desk for one adult learner. Page job: answer one focused prompt, understand immediate feedback, and maintain orientation through a short session.

Existing tokens remain authoritative:

- Paper `#F8F5EF`
- Surface `#FFFDF9`
- Ink `#262522`
- Japanese red `#C94A45`
- Matcha `#738768`
- Border `#DDD6C9`

Geist remains the UI face and Noto Sans JP remains the Japanese face. No new colors, fonts, gradients, or dependencies are introduced.

Signature element: an answer trail of ten functional numbered tabs. Each number represents a real question position and exposes current, unanswered, correct, or incorrect state through icon/text semantics as well as color. The trail also performs permitted navigation.

The main quiz frame remains stable while question renderers change. This reduces layout shift and keeps attention on one prompt. Choice buttons are large and quiet; typing uses one labeled input; recognition presents explicit `Benar` and `Salah`; sentence completion places a visible answer slot inside the sentence.

Desktop uses a main question sheet with a vertical answer trail. Tablet narrows the trail without removing labels needed for clarity. Smartphone moves the trail below the header as a horizontally scrollable, keyboard-accessible strip. The viewport never scrolls horizontally. All touch targets are at least 44px.

Results use a restrained score summary and a linear question review. No confetti, rank, oversized metric hero, card-dashboard grid, or decorative progress dots are used. Motion is limited to one feedback transition and follows `prefers-reduced-motion`.

## Accessibility

- Semantic form controls, headings, lists, status messages, and result summaries
- Japanese text uses `lang="ja"` and Noto Sans JP
- Every input has a visible or screen-reader label
- Answer correctness uses icons and text, never color alone
- Disabled future navigation is programmatically unavailable
- Current answer-trail item uses `aria-current="step"`
- Feedback uses a polite live region and does not steal focus
- After navigation, focus moves to the new question heading
- Horizontal answer trail is keyboard reachable and retains visible focus
- Reduced-motion preference remains respected

## Error Handling

- Unsupported Kana route parameters retain the existing recovery screen
- Empty, invalid, duplicate-ID, or insufficient question sets render `QuizUnavailable`
- Unsupported renderer types show recovery UI rather than a blank region
- Duplicate submission cannot overwrite the original response
- NEXT cannot skip an unanswered question
- Previous navigation cannot change a locked response
- Adapter errors contain module and source item context for development diagnostics
- Static datasets create no network failure path

## Testing

- Validation tests: every valid type, missing fields, incompatible content, bad options, duplicate IDs, and empty quiz
- Evaluation tests: strings, booleans, Unicode `NFKC`, whitespace, case, accepted alternatives, and wrong answers
- Response tests: required fields, immutable source mapping, and injected clock
- Reducer tests: answer lock, derived score, previous/next/go-to guards, completion, and restart
- Adapter tests: all four modules, real-source distractors, exact question directions, and insufficient-pool behavior
- Mixed generator tests: exactly 10 questions, two of every type, every module represented, unique IDs, deterministic RNG, and full validation
- Renderer tests: choice, reverse choice, typing, true/false recognition, sentence completion, feedback, and unsupported fallback
- Integration tests: Kana route regression, Mixed Quiz entry, 10-question completion, score, results review, restart, and invalid route recovery
- Accessibility tests: labels, live feedback, locked answers, trail semantics, keyboard navigation, and focus movement
- Regression suite: all existing Dashboard, Learn, Kana, Vocabulary, Kanji, Grammar, Practice, and shell tests
- Final gates: ESLint, full Vitest suite, `npm audit --audit-level=high`, and production build
- Visual inspection: 1440px, 768px, and 390px for active, answered, sentence-completion, result, overflow, focus, and console states

## Acceptance Criteria

- One engine renders, evaluates, navigates, scores, and reports all five Milestone 7 question types
- Kana, Vocabulary, Kanji, and Grammar feed the same normalized question contract
- Existing Kana practice paths use the shared engine
- Mixed Quiz contains exactly 10 valid questions, two per type, across all four modules
- Every response contains question ID, type, user answer, correct answer, result, timestamp, and associated learning item
- Answers remain locked and question navigation follows the defined guards
- Results accurately derive score and expose per-question review
- Desktop, tablet, smartphone, keyboard, and screen-reader flows remain usable
- Static learning content stays separate from quiz UI and no data is persisted
- No Milestone 8+ behavior or new dependency is introduced
- Tests, lint, audit, and build pass
