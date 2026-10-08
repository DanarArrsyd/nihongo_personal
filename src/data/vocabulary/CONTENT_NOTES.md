# N5 vocabulary collection

## Scope and references

The collection contains 100 beginner study entries. IDs 001–030 retain their original content; IDs 031–100 are append-only additions. Existing progress, favorites, review schedules, and backups continue to refer to the same learning items.

N5 is an editorial study classification, not a claim that the collection is complete or an official exam syllabus. The [official JLPT FAQ](https://www.jlpt.jp/sp/e/faq/index.html) explains that vocabulary, kanji, and grammar specifications are no longer published.

The [MLC beginner vocabulary reference](https://www.mlcjapanese.co.jp/n5_04_01.html) and its [vocabulary PDF](https://www.mlcjapanese.co.jp/Download/Vocabulary_of_JLPT_N5.pdf) were consulted for beginner vocabulary selection and lexical meanings on 2026-10-09. Indonesian glosses and short example sentences are authored for this project; the reference's example sentences and exercises are not copied.

## Editorial conventions

- Verbs use dictionary forms; examples may use polite or conjugated forms.
- Romaji follows the existing ASCII convention: long vowels use kana-based spellings such as `ou`, `oo`, and `uu`.
- Readings preserve katakana loanwords and grammatical particles written as は, へ, and を.
- `adjective` denotes i-adjectives; `adjectival noun` denotes na-adjectives. In particular, きれい is a na-adjective despite its final い.
- Family words 父, 母, 兄, 姉, 弟, and 妹 describe the speaker's own family in these examples.
- 暑い and 寒い refer to weather or ambient conditions. 高い includes both height and price.
- Each example uses the target word (including conjugated forms) and includes its reading and Indonesian meaning.

## Integration and maintenance

The static JSON remains the sole vocabulary source for Learn, Library, Flashcards, Mixed Quiz, review-card resolution, and catalog totals. No static vocabulary is copied into IndexedDB.

Validation checks unique IDs and words, required fields, example completeness, legacy-content stability, quiz validity, and availability of added entries in Library, Flashcards, and SRS review cards. These automated checks validate data contracts; they do not replace human language review.
