# Nihongo Personal

Nihongo Personal is a private, single-user Japanese learning workspace built for structured, calm, and measurable study.

## Current features

- Responsive application shell for desktop, tablet, and smartphone
- Dashboard with structured study overview data
- Complete shared Hiragana and Katakana learning architecture
- Kana recognition, reverse-recognition, and typing practice
- JLPT N5 vocabulary seed set with 30 structured entries
- Vocabulary search, word-type and learning-status filters
- Vocabulary details, example sentences, pronunciation, favorites, and persisted learning status
- JLPT N5 Kanji and Grammar reference modules
- Reusable mixed quiz and Vocabulary, Kanji, and Grammar flashcards
- IndexedDB learning history, favorites, settings, progress, and study sessions
- Interval-based SRS scheduling with a responsive due-review queue
- Persisted daily missions covering review, new learning, and mixed practice
- Basic PWA manifest and application-shell caching

User progress stays in local IndexedDB on the current browser. Cloud synchronization is outside Version 1 scope.

## Technology

- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Lucide React
- Dexie.js
- vite-plugin-pwa
- Vitest and Testing Library

## Local setup

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Scripts

```bash
npm run dev
npm test -- --run
npm run lint
npm run build
```

## Project documentation

- [Requirements](PROJECT_REQUIREMENTS.md)
- [Roadmap](ROADMAP.md)
- [Contributor instructions](AGENTS.md)
- [Milestone 4 design](docs/superpowers/specs/2026-08-28-milestone-4-vocabulary-design.md)
- [Milestone 4 implementation plan](docs/superpowers/plans/2026-08-28-milestone-4-vocabulary.md)
