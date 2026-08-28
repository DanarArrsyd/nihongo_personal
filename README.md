# Nihongo Personal

Nihongo Personal is a private, single-user Japanese learning workspace built for structured, calm, and measurable study.

## Current features

- Responsive application shell for desktop, tablet, and smartphone
- Dashboard with structured study overview data
- Complete shared Hiragana and Katakana learning architecture
- Kana recognition, reverse-recognition, and typing practice
- JLPT N5 vocabulary seed set with 30 structured entries
- Vocabulary search, word-type and learning-status filters
- Vocabulary details, example sentences, pronunciation, favorites, and session status
- Basic PWA manifest and application-shell caching

Favorites, learning status, and progress currently live only for the active browser session. IndexedDB persistence is planned for Milestone 9.

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
