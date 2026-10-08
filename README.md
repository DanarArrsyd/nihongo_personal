# Nihongo Personal

Nihongo Personal is a private, single-user Japanese learning workspace built for structured, calm, and measurable study.

Production: [nihongopersonal.vercel.app](https://nihongopersonal.vercel.app)

## Current features

- Responsive application shell for desktop, tablet, and smartphone
- Dashboard with structured study overview data
- Complete shared Hiragana and Katakana learning architecture
- Kana recognition, reverse-recognition, and typing practice
- JLPT N5 vocabulary seed set with 30 structured entries
- Vocabulary search, word-type and learning-status filters
- Vocabulary details, example sentences, pronunciation, favorites, and persisted learning status
- JLPT N5 Kanji and Grammar reference modules
- Configurable 10, 20, or 30-question Mixed Quiz with module/type filters and smart randomization
- Vocabulary, Kanji, and Grammar flashcards
- IndexedDB learning history, favorites, settings, progress, and study sessions
- Interval-based SRS scheduling with a responsive due-review queue
- Persisted daily missions covering review, new learning, and mixed practice
- Persisted progress analytics for mastery, accuracy, streaks, weekly activity, and study history
- Searchable Vocabulary, Kanji, and Grammar library with persisted favorites
- Installable PWA with final icons, offline learning shell, and user-controlled updates
- Manual JSON backup and atomic restore for all local learning data
- Guided Hiragana and Katakana writing practice with touch, stylus, and mouse input

User progress stays in local IndexedDB on the current browser. Cloud synchronization is outside Version 1 scope.

Kana writing uses locally bundled stroke-order data from KanjiVG. Attribution and licence details are available in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

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

Prerequisites:

- Node.js `20.19+` or `22.12+`
- npm

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

To verify the installable production PWA locally, build first and serve the generated output:

```bash
npm run build
npm run preview
```

Open the HTTPS deployment or local preview once while online. The application shell and bundled learning content are then available offline; personal progress remains in the browser's IndexedDB.

## Local data and recovery

Progress, review history, favorites, missions, and settings are stored only in IndexedDB for the current browser and origin. Clearing site data, using a different browser, or changing the deployment origin starts a separate empty workspace. V1.1 provides manual JSON backup and restore from the Progress page; cloud sync remains outside the current scope.

If browser storage cannot be opened, the application keeps static learning content available where possible and shows a persistence warning. Retry after confirming that IndexedDB is enabled and storage is not blocked. Clear site data only as a last resort because it permanently removes local progress for that origin.

## Production readiness check

Run the complete local gate before release:

```bash
npm ci
npm run lint
npm test -- --run
npm run build
npm audit --audit-level=high
npm run preview
```

The deployable static output is generated in `dist/`. Hosting and production deployment are intentionally handled in the next milestone.

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
