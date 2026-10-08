# Beginner Grammar Content Notes

## V1.4 Grammar stage

- 30 curated beginner patterns, including the original 12 unchanged records.
- IDs `n5-grammar-013` through `n5-grammar-030` add polite verb forms, adjective forms, invitations, requests, ongoing actions, permission, prohibition, reasons, ranges, and comparisons.
- Every addition has two Japanese examples, kana readings, Indonesian meanings, and related-pattern links.
- The N5 label is an editorial study-level grouping, not an official or exhaustive JLPT syllabus. This stage does not add a new learning module.

## References

Reviewed on 2026-10-09:

- Japan Foundation, [Irodori Starter](https://www.irodori.jpf.go.jp/en/starter/pdf.html): beginner grammar and communicative uses; especially Lessons 5, 7, 9, 10, 12, 14, 17, and 18.
- Japan Foundation, [Irodori Elementary 1](https://www.irodori.jpf.go.jp/en/elementary01/pdf.html): ongoing actions, reasons, and permission.
- Japan Foundation, [comparison grammar reference](https://www.jpf.go.jp/j/urawa/j_rsorcs/textbook/setsumei_pdf/setsumei15_5.pdf): noun comparisons with より and のほうが.
- Agency for Cultural Affairs, [teaching notes on prohibition](https://www.bunka.go.jp/seisaku/kokugo_nihongo/kyoiku/seikatsusha/h25_nihongo_program_a/pdf/a_26_5.pdf): distinction between rules expressed with てはいけません and requests expressed with ないでください.
- [Elementary 1 grammar worksheets](https://www.irodori.jpf.go.jp/assets/data/resources/Grammar_Worksheets_Y.pdf): supplementary form and usage reference.

These are usage references, not copied curriculum. Explanations, Indonesian translations, example sentences, and exercise choices are authored for this application. No source illustrations, audio, worksheets, or textbook passages are bundled.

## Editorial conventions

- Keep the original 12 records byte-for-byte equivalent at the JSON-record level so progress and review references remain stable.
- Distinguish present/future habitual `ます`, past `ました`, and their negative forms.
- `でした` applies to nouns and な-adjective stems, not directly to い-adjectives.
- `くないです` replaces the final い; `いい` becomes `よくないです`.
- Teach `ています` as both ongoing activity and continuing state; examples in this batch focus on ongoing activity.
- `て`-form suffixes can use `で`, as in `読んでください`.
- Comparison `ほうが` here is noun comparison, not the separate advice construction `たほうがいい`.
- Japanese readings preserve standard written particle spellings は, へ, and を.

## Curated completion exercises

Each new record has two `completionExercises`. Each exercise has a stable local ID, an example index, explicit text before/after the gap, an answer, and three distinct distractors.

The gap reconstructs the corresponding example exactly. The Indonesian meaning is included in the question instruction to distinguish tense, negation, invitation, permission, and prohibition. Distractors are reviewed in the context of that instruction, not merely checked for syntactic plausibility.

The shared quiz adapter consumes these exercises; recognition, flashcards, Library, SRS, and missions retain the parent Grammar item ID. No progress-schema migration is needed. Legacy particle questions remain supported for records without curated exercises, with meaning hints and controlled distractors in Mixed Quiz. In particular, direction questions do not offer both interchangeable に and へ. A 30-question completion session may contain two different examples of the same pattern; it never repeats the same question ID.

When adding records, validate unique IDs/patterns, relationship resolution, complete examples, exact gap reconstruction, distinct options, integration routes, and compatibility with the existing catalogue.
