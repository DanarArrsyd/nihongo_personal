# Task 3 Report: Deterministic Quiz Generation and Kana Adapter

## RED/GREEN evidence

- RED: `npm test -- src/features/quiz/services/quizGeneration.test.js` failed because `quizGeneration.js` did not exist.
- GREEN: the generation-helper test passed after adding immutable Fisher-Yates shuffle, sampling, and option construction.
- RED: `npm test -- src/features/quiz/adapters/kanaQuizAdapter.test.js` failed because `kanaQuizAdapter.js` did not exist.
- GREEN: the focused helper and adapter run passed: 2 test files, 8 tests.

## Validation

- `npm test -- src/features/quiz/services/quizGeneration.test.js src/features/quiz/adapters/kanaQuizAdapter.test.js` — passed (2 files, 8 tests).
- `npm test` — passed (21 files, 121 tests).
- `npm run lint` — passed.
- `npm run build` — passed.
- `git diff --check` — passed.

## Files

- `src/features/quiz/services/quizGeneration.js` — seeded-RNG-compatible immutable shuffle, sampling, and unique option construction.
- `src/features/quiz/services/quizGeneration.test.js` — covers deterministic ordering, source immutability, undersized pools, and duplicate answer options.
- `src/features/quiz/adapters/kanaQuizAdapter.js` — maps local Kana records into validated shared-question contracts for recognition, reverse, and typing modes.
- `src/features/quiz/adapters/kanaQuizAdapter.test.js` — covers script/mode mappings, valid ten-question output, directions, labels, associated keys, and invalid inputs.

## Self-review

Selection uses injected RNG throughout and does not mutate the Kana data. Each Kana source uses `module: 'kana'` and a script-prefixed item ID (`<script>:<item.id>`), preventing Hiragana and Katakana progress collisions. Selectable questions contain exactly the correct answer plus three distinct, real source distractors; Japanese prompt and option labels are annotated only where they are Japanese.

## Concerns

No known concerns within Task 3 scope. Existing Kana practice UI remains untouched for the later migration task.

## Fix Round 1

### Files

- `src/features/quiz/adapters/kanaQuizAdapter.js` — deduplicates selectable-mode distractor records by their displayed answer value before sampling, so the real `ji`/`zu` Kana duplicates cannot collapse an option set.
- `src/features/quiz/adapters/kanaQuizAdapter.test.js` — adds a seeded regression case (`424`) that previously returned no recognition quiz and now asserts ten questions with four distinct values each.

### Validation

```text
$ npm test -- src/features/quiz/services/quizGeneration.test.js src/features/quiz/adapters/kanaQuizAdapter.test.js

Test Files  2 passed (2)
Tests  9 passed (9)
```

Additional validation: `npm test` passed (21 files, 122 tests); `npm run lint`, `npm run build`, and `git diff --check` passed.

### Self-review

The deduplication occurs before RNG-backed sampling and uses the same value used in each option's display and answer contract. It retains one real catalog record for every available value, excludes the answer value, and leaves injected RNG behavior unchanged. The helper is applied to both selectable modes; typing continues to omit options.

### Concerns

No known concerns within this fix's scope.
