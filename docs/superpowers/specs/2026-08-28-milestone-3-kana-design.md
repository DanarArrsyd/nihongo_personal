# Milestone 3 Kana Design

## Scope

Milestone 3 adds complete shared Kana learning for Hiragana and Katakana. It replaces the Learn placeholder with a module overview, adds script and group navigation, character detail, browser pronunciation, temporary session progress, and three basic practice modes: recognition, reverse recognition, and typing.

Vocabulary, Kanji, Grammar, IndexedDB persistence, SRS, listening quizzes, matching, and the global quiz engine remain excluded.

## Architecture

Static Kana content lives in `src/data/kana/` and contains paired Hiragana, Katakana, romaji, and group metadata. Feature code selects a script from the same catalog, preventing duplicated behavior while keeping content separate from user state.

Routes:

- `/learn` — learning module overview.
- `/learn/kana/:script` — script overview; redirects to its first group.
- `/learn/kana/:script/:groupId` — group grid, selected character detail, pronunciation, and session progress.
- `/practice` — practice overview containing the available Kana module.
- `/practice/kana/:script/:mode` — one Kana practice session.

Supported `script` values are `hiragana` and `katakana`. Supported `mode` values are `recognition`, `reverse`, and `typing`. Invalid parameters resolve to a focused not-found state with a safe route back to Learn or Practice.

## Learning Experience

The Learn page presents Hiragana and Katakana as two related practice sheets. The Kana page uses a desktop group rail, horizontal group chips on smaller screens, a character grid, and a focused detail panel. Selecting a character exposes its romaji and pronunciation action. Marking it learned updates only local React state and the visible session progress.

The visual signature is a restrained genkō-yōshi grid used only behind active Kana. Existing cream, Japanese red, matcha, and ink tokens remain unchanged. Noto Sans JP Variable renders learning characters with high legibility.

## Practice

Practice logic remains feature-local until Milestone 7. A pure service creates deterministic question shapes from a supplied item and choices:

- `recognition`: prompt is Kana; answer is romaji.
- `reverse`: prompt is romaji; answer is Kana.
- `typing`: prompt is Kana; answer is typed romaji.

The UI tracks question index, selected or typed answer, correctness, and session score in memory. Both scripts consume the same service and components.

## Pronunciation

`speakJapanese(text, speechSynthesis)` uses browser Speech Synthesis with `lang = "ja-JP"`. Missing browser support returns a failure result; UI shows a clear unavailable message instead of throwing.

## Accessibility and Error Handling

Kana cards are buttons, selected state is announced, group controls use navigation semantics, forms have labels, feedback uses text plus color, and focus remains visible. Character text carries `lang="ja"`. Reduced-motion behavior from the application shell remains active.

## Validation

Tests cover catalog integrity, shared script selection, question generation, route rendering, group changes, selected-character details, temporary progress, practice answers, and pronunciation fallback. Final validation requires full tests, ESLint, production build, browser console checks, and screenshots at 1440 px and 390 px.

