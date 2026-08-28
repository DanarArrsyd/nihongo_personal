# Milestone 7 Reusable Quiz Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one quiz engine shared by Kana, Vocabulary, Kanji, and Grammar, migrate Kana practice, and add a responsive 10-question Mixed Quiz covering five question types.

**Architecture:** Module adapters transform existing static learning records into one normalized question contract. Pure services validate questions, evaluate answers, create response records, and reduce session state; shared React renderers and session components consume only that contract. Route pages generate one in-memory question set per mount and provide recovery UI when generation or validation fails.

**Tech Stack:** React 19, React Router 7, JavaScript, Tailwind CSS 4, Lucide React, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-08-28-milestone-7-reusable-quiz-engine-design.md`

## Global Constraints

- Implement Milestone 7 only; do not add flashcards, SRS, progress persistence, IndexedDB history, daily missions, timers, rewards, or adaptive learning.
- Support exactly `multiple_choice`, `reverse_multiple_choice`, `typing`, `recognition`, and `sentence_completion` in V1.
- Mixed Quiz contains exactly 10 questions, exactly two of every type, and includes Kana, Vocabulary, Kanji, and Grammar.
- Existing Kana paths and recognition/reverse/typing directions remain available through the shared engine.
- Response records contain question ID, type, user answer, correct answer, result, timestamp, module, and learning item ID.
- Static learning content remains owned by existing data services; quiz UI contains no duplicated datasets.
- Use existing Geist, Noto Sans JP, and palette tokens; add no dependency, font, gradient, or random color.
- Desktop, tablet, and 390px smartphone layouts must work without viewport overflow; touch targets are at least 44px.
- Japanese text uses `lang="ja"`; correctness uses text and icons, not color alone; keyboard focus remains visible.
- All existing tests, ESLint, high-severity audit, and production build must pass.

## File Map

- Create `src/features/quiz/services/questionTypes.js`: supported-type and source-module constants.
- Create `src/features/quiz/services/questionValidation.js`: question and full-quiz validation.
- Create `src/features/quiz/services/answerEvaluation.js`: string/boolean normalization and correctness.
- Create `src/features/quiz/services/quizResponse.js`: immutable response creation with injected clock.
- Create `src/features/quiz/services/quizSession.js`: initial state, reducer, navigation guards, score, completion.
- Create `src/features/quiz/services/quizGeneration.js`: deterministic shuffle, unique sample, and option helpers.
- Create `src/features/quiz/adapters/kanaQuizAdapter.js`: Kana route questions.
- Create `src/features/quiz/adapters/vocabularyQuizAdapter.js`: Vocabulary question candidates.
- Create `src/features/quiz/adapters/kanjiQuizAdapter.js`: Kanji question candidates.
- Create `src/features/quiz/adapters/grammarQuizAdapter.js`: Grammar recognition and completion candidates.
- Create `src/features/quiz/adapters/mixedQuizAdapter.js`: exact balanced 10-slot composition.
- Create `src/features/quiz/components/QuestionRenderer.jsx`: exhaustive renderer dispatch and fallback.
- Create `src/features/quiz/components/ChoiceQuestion.jsx`: both multiple-choice directions.
- Create `src/features/quiz/components/TypingQuestion.jsx`: labeled typing form.
- Create `src/features/quiz/components/RecognitionQuestion.jsx`: explicit Benar/Salah controls.
- Create `src/features/quiz/components/SentenceCompletionQuestion.jsx`: sentence blank and choices.
- Create `src/features/quiz/components/AnswerFeedback.jsx`: accessible locked-answer feedback.
- Create `src/features/quiz/components/AnswerTrail.jsx`: numbered state/navigation rail.
- Create `src/features/quiz/components/QuizResults.jsx`: score and per-question review.
- Create `src/features/quiz/components/QuizUnavailable.jsx`: common recovery state.
- Create `src/features/quiz/QuizSession.jsx`: reducer-driven active and completed session host.
- Create `src/features/quiz/MixedQuizPage.jsx`: mixed route host and restart generation.
- Modify `src/features/kana/KanaPracticePage.jsx`: thin shared-engine route host.
- Modify `src/features/practice/PracticePage.jsx`: Mixed Quiz entry and updated practice copy.
- Modify `src/App.jsx`: `/practice/mixed` route.
- Modify `src/styles/index.css`: answer-trail signature styling using existing tokens.
- Delete `src/features/kana/services/kanaQuiz.js` and its test after Kana migration removes all consumers.

Every new service, adapter, component group, and route integration receives a colocated focused test file.

---

### Task 1: Question validation and answer evaluation

**Files:**
- Create: `src/features/quiz/services/questionTypes.js`
- Create: `src/features/quiz/services/questionValidation.js`
- Create: `src/features/quiz/services/questionValidation.test.js`
- Create: `src/features/quiz/services/answerEvaluation.js`
- Create: `src/features/quiz/services/answerEvaluation.test.js`

**Interfaces:**
- Produces: `QUESTION_TYPES`, `SOURCE_MODULES`, `validateQuestion(question)`, `validateQuiz(questions)`, `normalizeAnswer(value)`, and `evaluateAnswer(question, userAnswer)`.

- [ ] **Step 1: Write failing validation tests**

Use this valid fixture and verify all five types by varying `type`, `content`, `answer`, and `options`:

```js
const validChoice = {
  id: 'vocab-001-meaning',
  type: 'multiple_choice',
  source: { module: 'vocabulary', itemId: 'n5-vocab-001' },
  instruction: 'Pilih arti yang tepat.',
  content: { kind: 'text', text: '食べる', lang: 'ja' },
  answer: { value: 'makan', acceptedValues: ['makan'] },
  options: [
    { value: 'makan', label: 'makan', lang: 'id' },
    { value: 'minum', label: 'minum', lang: 'id' },
  ],
}

expect(validateQuestion(validChoice)).toEqual({ valid: true, errors: [] })
expect(validateQuestion({ ...validChoice, id: '' }).valid).toBe(false)
expect(validateQuestion({ ...validChoice, type: 'matching' }).errors).toContain(
  'Unsupported question type: matching',
)
expect(validateQuiz([validChoice, validChoice]).errors).toContain(
  'Duplicate question ID: vocab-001-meaning',
)
expect(validateQuiz([]).valid).toBe(false)
```

Also assert typing rejects options, recognition requires boolean answer plus exactly `true`/`false` options labeled `Benar`/`Salah`, sentence completion requires `before` and `after`, selectable options are unique and contain the correct answer, and source modules outside Kana/Vocabulary/Kanji/Grammar fail.

- [ ] **Step 2: Run validation tests and confirm RED**

Run: `npm test -- src/features/quiz/services/questionValidation.test.js`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement constants and validators**

```js
export const QUESTION_TYPES = Object.freeze([
  'multiple_choice',
  'reverse_multiple_choice',
  'typing',
  'recognition',
  'sentence_completion',
])

export const SOURCE_MODULES = Object.freeze([
  'kana',
  'vocabulary',
  'kanji',
  'grammar',
])
```

Implement validation as small field checks that append stable error strings. `validateQuiz` first rejects non-arrays/empty arrays, then aggregates indexed question errors and duplicate IDs. It returns only `{ valid: errors.length === 0, errors }`; it never throws or mutates input.

- [ ] **Step 4: Write failing evaluator tests**

```js
expect(normalizeAnswer('  ＴＡＢＥＲＵ ')).toBe('taberu')
expect(evaluateAnswer(validChoice, ' MAKAN ')).toBe(true)
expect(evaluateAnswer({ ...validChoice, answer: { value: 'taberu', acceptedValues: ['たべる'] } }, 'たべる')).toBe(true)
expect(evaluateAnswer(recognitionQuestion, true)).toBe(true)
expect(evaluateAnswer(recognitionQuestion, 'true')).toBe(false)
expect(evaluateAnswer(validChoice, 'minum')).toBe(false)
```

- [ ] **Step 5: Implement pure evaluation**

```js
export function normalizeAnswer(value) {
  return typeof value === 'string'
    ? value.normalize('NFKC').trim().toLocaleLowerCase()
    : value
}

export function evaluateAnswer(question, userAnswer) {
  const accepted = question.answer.acceptedValues ?? [question.answer.value]
  if (typeof question.answer.value === 'boolean') {
    return typeof userAnswer === 'boolean' && userAnswer === question.answer.value
  }
  const normalizedUserAnswer = normalizeAnswer(userAnswer)
  return accepted.some((value) => normalizeAnswer(value) === normalizedUserAnswer)
}
```

- [ ] **Step 6: Run focused tests and commit**

Run: `npm test -- src/features/quiz/services/questionValidation.test.js src/features/quiz/services/answerEvaluation.test.js`

Expected: all focused tests PASS.

```bash
git add src/features/quiz/services
git commit -m "feat: add quiz question contracts"
```

---

### Task 2: Response records and session reducer

**Files:**
- Create: `src/features/quiz/services/quizResponse.js`
- Create: `src/features/quiz/services/quizResponse.test.js`
- Create: `src/features/quiz/services/quizSession.js`
- Create: `src/features/quiz/services/quizSession.test.js`

**Interfaces:**
- Consumes: `evaluateAnswer(question, userAnswer)`.
- Produces: `createQuizResponse({ question, userAnswer, now })`, `createQuizState(questions)`, `quizSessionReducer(state, action)`, `getQuizScore(state)`, `isQuizComplete(state)`, and `canNavigateTo(state, index)`.

- [ ] **Step 1: Write failing response tests**

```js
const now = () => new Date('2026-08-28T12:00:00.000Z')
const response = createQuizResponse({ question, userAnswer: 'makan', now })

expect(response).toEqual({
  questionId: question.id,
  questionType: question.type,
  userAnswer: 'makan',
  correctAnswer: question.answer.value,
  result: true,
  timestamp: '2026-08-28T12:00:00.000Z',
  associatedItem: { ...question.source },
})
expect(response.associatedItem).not.toBe(question.source)
```

- [ ] **Step 2: Implement response creation**

Use `now = () => new Date()` as default. Copy `question.source`, compute result through `evaluateAnswer`, convert `now()` to ISO, and return a fresh plain object.

- [ ] **Step 3: Write failing reducer tests**

Cover these exact state transitions:

```js
const initial = createQuizState([questionOne, questionTwo])
expect(initial).toEqual({
  questions: [questionOne, questionTwo],
  currentIndex: 0,
  responses: {},
  status: 'active',
})

expect(quizSessionReducer(initial, { type: 'NEXT' })).toBe(initial)
const answered = quizSessionReducer(initial, { type: 'ANSWER', response: responseOne })
expect(answered.responses[questionOne.id]).toBe(responseOne)
expect(quizSessionReducer(answered, { type: 'ANSWER', response: changedResponse })).toBe(answered)
expect(quizSessionReducer(answered, { type: 'NEXT' }).currentIndex).toBe(1)
expect(canNavigateTo(answered, 1)).toBe(false)
expect(canNavigateTo(answered, 0)).toBe(true)
```

Also test PREVIOUS, GO_TO guard, final completion after every answer, score derivation, and RESTART with a replacement question set.

- [ ] **Step 4: Implement reducer and selectors**

```js
export function createQuizState(questions) {
  return { questions, currentIndex: 0, responses: {}, status: 'active' }
}

export function getQuizScore(state) {
  return Object.values(state.responses).filter((response) => response.result).length
}

export function isQuizComplete(state) {
  return state.questions.length > 0
    && state.questions.every((question) => state.responses[question.id])
}
```

Reducer actions use immutable object copies. `ANSWER` accepts only the current question ID and only when no response exists. Answering the final unanswered question sets `status: 'completed'`. `NEXT`, `PREVIOUS`, and `GO_TO` enforce the design guards. `RESTART` calls `createQuizState(action.questions)`.

- [ ] **Step 5: Run focused tests and commit**

Run: `npm test -- src/features/quiz/services/quizResponse.test.js src/features/quiz/services/quizSession.test.js`

Expected: all focused tests PASS.

```bash
git add src/features/quiz/services/quizResponse* src/features/quiz/services/quizSession*
git commit -m "feat: add quiz session state"
```

---

### Task 3: Deterministic generation helpers and Kana adapter

**Files:**
- Create: `src/features/quiz/services/quizGeneration.js`
- Create: `src/features/quiz/services/quizGeneration.test.js`
- Create: `src/features/quiz/adapters/kanaQuizAdapter.js`
- Create: `src/features/quiz/adapters/kanaQuizAdapter.test.js`

**Interfaces:**
- Produces: `shuffle(items, rng)`, `sampleUnique(items, count, rng)`, `buildOptions(answerOption, distractorOptions, rng)`, `createKanaQuiz({ script, mode, count, rng })`.

- [ ] **Step 1: Write failing generation-helper tests**

Use an injected sequence RNG and verify no source mutation:

```js
const source = ['a', 'b', 'c', 'd']
expect(shuffle(source, () => 0)).toEqual(['b', 'c', 'd', 'a'])
expect(source).toEqual(['a', 'b', 'c', 'd'])
expect(sampleUnique(source, 2, () => 0)).toHaveLength(2)
expect(sampleUnique(source, 5, () => 0)).toEqual([])
expect(buildOptions(
  { value: 'a', label: 'a' },
  [{ value: 'i', label: 'i' }, { value: 'a', label: 'duplicate' }],
  () => 0,
)).toHaveLength(2)
```

- [ ] **Step 2: Implement immutable Fisher-Yates helpers**

`shuffle` clones first and uses `Math.floor(rng() * (index + 1))`. `sampleUnique` returns `[]` when the pool is too small. `buildOptions` deduplicates by primitive `value`, keeps the correct option, and shuffles the result.

- [ ] **Step 3: Write failing Kana adapter tests**

For Hiragana and Katakana, assert exactly 10 unique valid questions. Assert mappings:

```js
expect(createKanaQuiz({ script: 'hiragana', mode: 'recognition', rng }).every(
  (question) => question.type === 'multiple_choice',
)).toBe(true)
expect(createKanaQuiz({ script: 'hiragana', mode: 'reverse', rng })[0].type)
  .toBe('reverse_multiple_choice')
expect(createKanaQuiz({ script: 'katakana', mode: 'typing', rng })[0].type)
  .toBe('typing')
expect(createKanaQuiz({ script: 'invalid', mode: 'typing', rng })).toEqual([])
```

Recognition prompts use Japanese Kana and romaji options. Reverse prompts use romaji and Japanese options. Typing accepts the exact romaji. Every source uses module `kana` and composite item ID `<script>:<item.id>`, so Hiragana and Katakana never share an associated learning-item key.

- [ ] **Step 4: Implement Kana adapter**

Consume `getAllKana(script)` and `isSupportedScript(script)` plus shared generation helpers. Default `count` is 10 and `rng` is `Math.random`. Return `[]` for unsupported scripts/modes or insufficient pools. Options contain one answer plus three real distractors and carry `lang: 'ja'` only for Japanese labels.

- [ ] **Step 5: Run focused tests and commit**

Run: `npm test -- src/features/quiz/services/quizGeneration.test.js src/features/quiz/adapters/kanaQuizAdapter.test.js`

Expected: all focused tests PASS.

```bash
git add src/features/quiz/services/quizGeneration* src/features/quiz/adapters/kanaQuizAdapter*
git commit -m "feat: adapt Kana to shared quiz questions"
```

---

### Task 4: Vocabulary and Kanji adapters

**Files:**
- Create: `src/features/quiz/adapters/vocabularyQuizAdapter.js`
- Create: `src/features/quiz/adapters/vocabularyQuizAdapter.test.js`
- Create: `src/features/quiz/adapters/kanjiQuizAdapter.js`
- Create: `src/features/quiz/adapters/kanjiQuizAdapter.test.js`

**Interfaces:**
- Consumes: existing `getVocabulary()`, `getKanji()`, and generation helpers.
- Produces: `createVocabularyQuestion({ item, type, distractors, truthItem, rng })`, `createKanjiQuestion({ item, type, distractors, truthItem, rng })`.

- [ ] **Step 1: Write failing Vocabulary adapter tests**

Assert `multiple_choice` maps word to meaning, `reverse_multiple_choice` maps meaning to Japanese word, `typing` accepts both kana reading and romaji, and recognition produces a pair with boolean answer. A false pair must use `truthItem` from another real Vocabulary record. Options must contain the answer and unique real distractors.

```js
expect(createVocabularyQuestion({ item, type: 'multiple_choice', distractors, rng }).source)
  .toEqual({ module: 'vocabulary', itemId: item.id })
expect(createVocabularyQuestion({ item, type: 'typing', distractors, rng }).answer.acceptedValues)
  .toEqual([item.reading, item.romaji])
```

- [ ] **Step 2: Implement Vocabulary adapter**

Use `content.kind: 'text'` for choice/typing and `content.kind: 'pair'` for recognition. Return `null` for unsupported type or missing item. Do not embed the full Vocabulary dataset in the adapter.

- [ ] **Step 3: Write failing Kanji adapter tests**

Typing prompt is Kanji and accepted values combine on'yomi plus kun'yomi with `.` removed. Recognition pairs Kanji with a primary Indonesian meaning and uses another real Kanji record for false claims.

```js
expect(createKanjiQuestion({ item, type: 'typing', distractors, rng }).answer.acceptedValues)
  .toEqual([...item.onyomi, ...item.kunyomi.map((reading) => reading.replaceAll('.', ''))])
```

- [ ] **Step 4: Implement Kanji adapter**

Support only `typing` and `recognition`, return `null` otherwise, preserve original data, and use `{ module: 'kanji', itemId: item.id }`.

- [ ] **Step 5: Run focused tests and commit**

Run: `npm test -- src/features/quiz/adapters/vocabularyQuizAdapter.test.js src/features/quiz/adapters/kanjiQuizAdapter.test.js`

Expected: all focused tests PASS.

```bash
git add src/features/quiz/adapters/vocabularyQuizAdapter* src/features/quiz/adapters/kanjiQuizAdapter*
git commit -m "feat: add word and Kanji quiz adapters"
```

---

### Task 5: Grammar adapter and balanced Mixed Quiz

**Files:**
- Create: `src/features/quiz/adapters/grammarQuizAdapter.js`
- Create: `src/features/quiz/adapters/grammarQuizAdapter.test.js`
- Create: `src/features/quiz/adapters/mixedQuizAdapter.js`
- Create: `src/features/quiz/adapters/mixedQuizAdapter.test.js`

**Interfaces:**
- Consumes: all earlier adapters, existing data services, generation helpers, and `validateQuiz`.
- Produces: `createGrammarQuestion({ item, type, truthItem, distractors, rng })`, `createMixedQuiz({ rng })` returning `{ questions, error }`.

- [ ] **Step 1: Write failing Grammar adapter tests**

Recognition pairs pattern and meaning. Sentence completion is eligible only when the pattern starts with `～`, the stripped token is non-empty, and an example sentence contains it. Verify `～は` becomes:

```js
{
  content: { kind: 'sentence', before: '私', after: 'インドネシア人です。', lang: 'ja' },
  answer: { value: 'は', acceptedValues: ['は'] },
}
```

Options use real stripped particle tokens and include the correct token. Entries such as `～があります／います` that do not form one unambiguous token return `null` for sentence completion.

- [ ] **Step 2: Implement Grammar adapter**

Use `getGrammar()` only in tests or callers; the item factory receives individual records. Recognition false pairs use another real record's meaning. Sentence completion splits only the first token occurrence.

- [ ] **Step 3: Write failing Mixed Quiz tests**

```js
const result = createMixedQuiz({ rng: () => 0 })
expect(result.error).toBeNull()
expect(result.questions).toHaveLength(10)
expect(new Set(result.questions.map((question) => question.id)).size).toBe(10)
expect(countByType(result.questions)).toEqual({
  multiple_choice: 2,
  reverse_multiple_choice: 2,
  typing: 2,
  recognition: 2,
  sentence_completion: 2,
})
expect(new Set(result.questions.map((question) => question.source.module)))
  .toEqual(new Set(['kana', 'vocabulary', 'kanji', 'grammar']))
expect(validateQuiz(result.questions).valid).toBe(true)
```

Inject undersized pools through an optional `sources` test seam shaped as `{ kana: { hiragana, katakana }, vocabulary, kanji, grammar }` and expect `{ questions: [], error: 'Quiz belum tersedia.' }`. Production defaults come from `getAllKana('hiragana')`, `getAllKana('katakana')`, `getVocabulary()`, `getKanji()`, and `getGrammar()`.

- [ ] **Step 4: Implement exact mixed blueprint**

Build exactly the ten slots from the spec: two Kana, three Vocabulary, two Kanji, and three Grammar. Use sampled real records and real distractors. Prefix IDs with `mixed-` plus module, item ID, type, and slot index so duplicate source records cannot produce duplicate question IDs. Shuffle final order with injected RNG. Validate the final set; return unavailable result on any missing slot or validation error.

- [ ] **Step 5: Run focused tests and commit**

Run: `npm test -- src/features/quiz/adapters/grammarQuizAdapter.test.js src/features/quiz/adapters/mixedQuizAdapter.test.js`

Expected: all focused tests PASS.

```bash
git add src/features/quiz/adapters/grammarQuizAdapter* src/features/quiz/adapters/mixedQuizAdapter*
git commit -m "feat: generate balanced mixed quizzes"
```

---

### Task 6: Shared question renderers

**Files:**
- Create: `src/features/quiz/components/ChoiceQuestion.jsx`
- Create: `src/features/quiz/components/TypingQuestion.jsx`
- Create: `src/features/quiz/components/RecognitionQuestion.jsx`
- Create: `src/features/quiz/components/SentenceCompletionQuestion.jsx`
- Create: `src/features/quiz/components/QuizUnavailable.jsx`
- Create: `src/features/quiz/components/QuestionRenderer.jsx`
- Create: `src/features/quiz/components/QuestionRenderer.test.jsx`

**Interfaces:**
- Produces: `QuestionRenderer({ question, disabled, onAnswer })` and focused renderer components with the same answer callback contract.

- [ ] **Step 1: Write failing renderer tests**

Render one fixture per type. Assert Japanese `lang`, option labels, visible input label `Jawaban`, explicit `Benar`/`Salah`, sentence blank, disabled controls after answer, and callback primitive values. Assert unsupported type renders heading `Tipe soal tidak didukung` without throwing.

```js
fireEvent.click(screen.getByRole('button', { name: 'makan' }))
expect(onAnswer).toHaveBeenCalledWith('makan')

fireEvent.change(screen.getByRole('textbox', { name: 'Jawaban' }), {
  target: { value: 'taberu' },
})
fireEvent.submit(screen.getByRole('form', { name: 'Kirim jawaban' }))
expect(onAnswer).toHaveBeenCalledWith('taberu')
```

- [ ] **Step 2: Implement focused renderers**

Choice variants share `ChoiceQuestion`. Recognition renders exactly two buttons with boolean values. Sentence completion renders `before`, an accessible blank, `after`, then option buttons. Typing owns input text only and clears through component remount keyed by question ID. All buttons use `type="button"` except form submit, 44px minimum size, visible focus, and disabled state.

- [ ] **Step 3: Implement exhaustive dispatch**

```jsx
switch (question.type) {
  case 'multiple_choice':
  case 'reverse_multiple_choice':
    return <ChoiceQuestion {...props} />
  case 'typing':
    return <TypingQuestion {...props} />
  case 'recognition':
    return <RecognitionQuestion {...props} />
  case 'sentence_completion':
    return <SentenceCompletionQuestion {...props} />
  default:
    return <QuizUnavailable title="Tipe soal tidak didukung" />
}
```

Create `QuizUnavailable({ title = 'Quiz belum tersedia', description, backTo = '/practice' })` now as a focused shared component using existing `EmptyState` plus a recovery link. Task 7 consumes this contract unchanged.

- [ ] **Step 4: Run focused tests and commit**

Run: `npm test -- src/features/quiz/components/QuestionRenderer.test.jsx`

Expected: all renderer tests PASS.

```bash
git add src/features/quiz/components
git commit -m "feat: add shared quiz renderers"
```

---

### Task 7: Session UI, answer trail, feedback, and results

**Files:**
- Create: `src/features/quiz/components/AnswerFeedback.jsx`
- Create: `src/features/quiz/components/AnswerTrail.jsx`
- Create: `src/features/quiz/components/QuizResults.jsx`
- Create: `src/features/quiz/QuizSession.jsx`
- Create: `src/features/quiz/QuizSession.test.jsx`

**Interfaces:**
- Consumes: Task 2 session services, Task 6 `QuestionRenderer`, valid questions, `onRestart`, optional `now`.
- Produces: `QuizSession({ questions, onRestart, now })`.

- [ ] **Step 1: Write failing session UI tests**

Cover question count/current step, answer locking, live feedback, guarded next, previous review, trail navigation, final results, score, per-question review, and restart callback.

```js
expect(screen.getByRole('button', { name: 'Soal 1, saat ini' })).toHaveAttribute(
  'aria-current',
  'step',
)
fireEvent.click(screen.getByRole('button', { name: 'makan' }))
expect(screen.getByRole('status')).toHaveTextContent('Benar')
expect(screen.getByRole('button', { name: 'makan' })).toBeDisabled()
fireEvent.click(screen.getByRole('button', { name: 'Soal berikutnya' }))
expect(screen.getByRole('heading', { name: /Soal 2/ })).toHaveFocus()
```

Complete a two-question fixture and assert score `1 dari 2`, percentage `50%`, both user/correct answers, and `Mulai lagi` calls `onRestart`.

- [ ] **Step 2: Implement feedback and answer trail**

`AnswerFeedback` uses `role="status"`, CheckCircle/XCircle icons, and text `Benar` or `Belum tepat. Jawaban benar: …`. `AnswerTrail` renders numbered buttons with accessible names describing number plus current/unanswered/correct/incorrect. It applies `aria-current="step"` to current, disables unanswered future positions, and calls `onNavigate(index)`.

- [ ] **Step 3: Implement results**

Derive score through `getQuizScore`. Render a restrained summary, percentage rounded to nearest integer, ordered review list, source-module label, prompt, submitted answer, correct answer, and text correctness. Boolean values render `Benar`/`Salah`, not raw booleans.

- [ ] **Step 4: Implement reducer-driven session**

Validate questions before initializing. Invalid sets render `QuizUnavailable` with link to `/practice`. Build responses through `createQuizResponse({ question, userAnswer, now })`. Store only reducer state. Focus the new question heading after successful NEXT/PREVIOUS/GO_TO using a ref and effect; do not move focus on initial mount. Render active frame or `QuizResults` based on state status.

- [ ] **Step 5: Run focused tests and commit**

Run: `npm test -- src/features/quiz/QuizSession.test.jsx`

Expected: all session UI tests PASS with no console warnings.

```bash
git add src/features/quiz/QuizSession* src/features/quiz/components
git commit -m "feat: add reusable quiz session UI"
```

---

### Task 8: Kana migration and Mixed Quiz routes

**Files:**
- Modify: `src/features/kana/KanaPracticePage.jsx`
- Modify: `src/features/kana/KanaPracticePage.test.jsx`
- Delete: `src/features/kana/services/kanaQuiz.js`
- Delete: `src/features/kana/services/kanaQuiz.test.js`
- Create: `src/features/quiz/MixedQuizPage.jsx`
- Create: `src/features/quiz/MixedQuizPage.test.jsx`
- Modify: `src/features/practice/PracticePage.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `createKanaQuiz`, `createMixedQuiz`, `validateQuiz`, and `QuizSession`.
- Produces: migrated Kana routes and `/practice/mixed`.

- [ ] **Step 1: Rewrite Kana regression tests to shared-session behavior**

Keep invalid-route recovery. For each recognition, reverse, and typing route, assert the expected prompt direction, submit a correct answer, observe locked feedback, and advance. Complete a small injected or deterministic session through a route-level test seam and assert results. Remove assertions tied only to the old looping score sidebar.

- [ ] **Step 2: Migrate Kana route page**

Keep route validation and existing recovery copy. Generate questions once with a state initializer keyed by `script:mode`, render the existing heading/mode picker, then host `QuizSession`. Keep `{ questions, sessionVersion }` in the route host; restart generates a replacement set, increments `sessionVersion`, and passes it as the `QuizSession` React key so reducer state resets. Delete old `kanaQuiz.js` only after `rg 'kanaQuiz' src` shows no consumers except files being deleted.

- [ ] **Step 3: Write failing Mixed Quiz integration tests**

Assert Practice contains link `Mulai Mixed Quiz` to `/practice/mixed`; page renders `Soal 1 dari 10`; answer all ten using visible correct controls derived from the deterministic test fixture; results show ten reviewed questions and a score; restart returns to active state. Mock only the adapter boundary for deterministic route tests, never evaluator or reducer logic.

- [ ] **Step 4: Implement Mixed Quiz page and Practice entry**

`MixedQuizPage` uses a state initializer to call `createMixedQuiz()` once and stores a `sessionVersion`. On error, render `QuizUnavailable` with title `Quiz belum tersedia` and Practice recovery. On success, render header `Mixed Quiz`, copy naming all four modules, and `QuizSession` keyed by `sessionVersion`. Restart replaces the generated result and increments the key. Add route before parameterized Kana routes.

Practice page gains a visually primary Mixed Quiz section above Kana cards, updates intro copy to cover mixed learning, and retains all Kana links/mode explanation.

- [ ] **Step 5: Run route and regression tests**

Run: `npm test -- src/features/kana/KanaPracticePage.test.jsx src/features/quiz/MixedQuizPage.test.jsx src/App.test.jsx`

Expected: all focused integration tests PASS.

Run: `npm test`

Expected: complete suite PASS before commit.

- [ ] **Step 6: Commit route integration**

```bash
git add src/App.jsx src/features/practice/PracticePage.jsx src/features/kana/KanaPracticePage.jsx src/features/kana/KanaPracticePage.test.jsx src/features/kana/services/kanaQuiz.js src/features/kana/services/kanaQuiz.test.js src/features/quiz/MixedQuizPage.jsx src/features/quiz/MixedQuizPage.test.jsx
git commit -m "feat: launch shared Kana and mixed quizzes"
```

---

### Task 9: Responsive answer-trail polish and final validation

**Files:**
- Modify: `src/styles/index.css`
- Modify: Quiz files only when task-specific validation exposes defects.

**Interfaces:**
- Consumes: stable class names from Quiz session components.
- Produces: desktop vertical and mobile horizontal answer-trail treatment.

- [ ] **Step 1: Add approved signature styling**

Add focused classes inside `@layer components`:

```css
.quiz-answer-trail {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.quiz-answer-tab {
  min-width: 2.75rem;
  min-height: 2.75rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-ink-muted);
}
```

Use state modifier classes backed only by accent, matcha, surface, ink, and border tokens. At `lg`, trail becomes a vertical list inside the side column; below `lg`, it remains horizontal with contained overflow. Correct/incorrect state includes icon or readable label in JSX, so CSS never carries meaning alone.

- [ ] **Step 2: Run all automated gates**

Run: `npm test`

Expected: complete suite PASS with pristine output.

Run: `npm run lint`

Expected: exit code 0.

Run: `npm audit --audit-level=high`

Expected: no high-severity vulnerability causes failure.

Run: `npm run build`

Expected: Vite production build exits 0.

- [ ] **Step 3: Inspect required responsive states**

Run `npm run dev -- --host 127.0.0.1`. Inspect `/practice/mixed` and one Kana route at 1440px, 768px, and 390px in active, answered, sentence-completion, and results states. Confirm stable main frame, no viewport overflow, contained mobile trail scrolling, 44px targets, readable Japanese, visible focus, correct keyboard guards, reduced-motion behavior, and no console error.

- [ ] **Step 4: Verify scope and commit**

Run: `git diff --check`

Run: `git diff $(git merge-base main HEAD)..HEAD -- package.json src`

Expected: no dependency change, no IndexedDB write, no Milestone 8 behavior, and only Quiz/Kana/Practice/App/focused style changes.

```bash
git add src/styles/index.css src/features/quiz src/features/kana src/features/practice/PracticePage.jsx src/App.jsx
git commit -m "style: polish responsive quiz workspace"
```
