# Beginner Kanji collection

## Scope

The collection now contains 60 curated beginner characters. IDs 001–020 preserve their original records exactly. IDs 021–060 add people, vehicles, nature, size, directions, time, and numbers.

N5 is a curated study classification, not an official or complete examination syllabus. The original records retain their previous classification; external study lists differ at the N5/N4 boundary. The additions follow the overlapping beginner selections in [Kanshudo's JLPT collection](https://www.kanshudo.com/collections/jlpt_kanji) and [JLPT Sensei's N5 list](https://jlptsensei.com/jlpt-n5-kanji-list/).

## Reading and stroke reference

Readings and stroke counts for all 40 added characters were checked against [KANJIDIC2](https://www.edrdg.org/wiki/KANJIDIC_Project.html), downloaded from EDRDG on 2026-10-09. The selected fields are adapted from that source. Additional Indonesian meanings and contextual sentences are editorial additions.

Copyright James William BREEN and the Electronic Dictionary Research and Development Group. The added records and adaptations are available under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); see the [EDRDG dictionary licence](https://www.edrdg.org/edrdg/licence.html) and the root THIRD_PARTY_NOTICES.md.

Readings are a beginner selection, not an exhaustive dictionary. On'yomi use katakana and kun'yomi use hiragana. A dot separates a character reading from its okurigana, as in `なが.い`; an ending hyphen marks a prefix. Empty kun'yomi is valid for 電. Word-level readings and counters may differ from isolated readings: 四時 is よじ, 七時 is しちじ, and 八時 is はちじ.

## Vocabulary and examples

Declared vocabulary connections preserve their existing order. The data service appends matching words from the current vocabulary catalogue, deduplicated by ID. New declared connections refer only to available words that contain the character.

Contextual examples reuse existing vocabulary sentences that contain the character. When no catalogue word is available, `exampleSentences` supplies a locally authored sentence, its reading, and Indonesian meaning. The service presents at most three distinct sentences.

No curriculum records are copied into IndexedDB. Existing progress, favorites, review schedules, and backups keep their original item references.

## Maintenance

For future content releases, recheck changed or added readings and stroke counts against the current KANJIDIC2 source and record the retrieval date. Keep source attribution and share-alike licensing attached to derived records.

Tests check identity stability, data completeness, contextual examples, vocabulary connections, and integration with Library, Flashcards, Mixed Quiz, and SRS card resolution. Structural tests do not replace language review.
