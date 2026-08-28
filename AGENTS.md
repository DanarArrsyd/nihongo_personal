# AGENTS.md

## Project Overview

Project Name: Nihongo Personal

Nihongo Personal is a private, single-user Japanese learning web application.

The application is intended to provide structured Japanese learning through:

- Hiragana
- Katakana
- Vocabulary
- Kanji
- Grammar
- Flashcards
- Quizzes
- Spaced Repetition
- Daily Missions
- Progress Tracking

The application should feel like a personal Japanese learning workspace rather than a generic language-learning website.

The primary priorities are:

1. Clean architecture
2. Simple user experience
3. Fast performance
4. Offline capability
5. Maintainability
6. Progressive learning
7. Accurate progress tracking

---

# Technology Stack

Use the following technologies unless explicitly instructed otherwise.

Frontend:
- React
- Vite
- JavaScript

Styling:
- Tailwind CSS

Routing:
- React Router

Icons:
- Lucide React

Local Database:
- IndexedDB

IndexedDB Wrapper:
- Dexie.js

PWA:
- vite-plugin-pwa

Hosting:
- Vercel

Repository:
- GitHub

Do not introduce the following unless explicitly requested:

- Next.js
- TypeScript
- Firebase
- Supabase
- MongoDB
- MySQL
- PostgreSQL
- Authentication
- External backend
- Paid APIs
- AI APIs
- Complex state-management libraries

Prefer React Context or local state when sufficient.

Zustand may only be introduced if application state becomes significantly complex.

---

# Application Philosophy

The application is designed for one private user.

Do not introduce:

- multi-user functionality
- account management
- admin panels
- permission systems
- organization features
- subscription systems
- payment functionality

unless explicitly requested later.

The system should remain simple.

---

# Design Direction

The application should feel like:

"Modern Japanese Study Workspace"

Avoid making the application feel like:

- children's educational software
- anime fan website
- gaming dashboard
- overly colorful language app

Visual characteristics:

- minimal
- warm
- calm
- spacious
- premium
- modern
- readable

---

# Color Palette

Main Background:

#F8F5EF

Secondary Background:

#F1EBDD

Surface / Card:

#FFFDF9

Border:

#DDD6C9

Primary Text:

#262522

Secondary Text:

#77736B

Primary Accent / Japanese Red:

#C94A45

Soft Japanese Red:

#F3DEDA

Matcha Green:

#738768

Soft Matcha:

#E4EADF

Warm Gold:

#C49458

Muted Blue:

#62798A

Do not introduce random colors.

Additional colors must match the muted warm visual system.

---

# Typography

Primary UI Font:

Geist

Fallback:

Inter
system-ui
sans-serif

Japanese Font:

Noto Sans JP

Japanese characters must always remain easy to read.

Avoid overly decorative Japanese fonts for learning content.

---

# Layout

Desktop:

Use a persistent sidebar.

Main navigation:

- Dashboard
- Learn
- Practice
- Review
- Progress
- Library

Mobile:

Use a compact responsive navigation pattern.

Possible implementation:

- bottom navigation
- collapsible navigation
- mobile drawer

The interface must work properly on:

- desktop
- tablet
- smartphone

Primary development priority:

Desktop first.

However, mobile must remain fully usable.

---

# Component Rules

Components must remain focused and reusable.

Avoid creating components larger than necessary.

Prefer:

components/
features/
pages/
hooks/
services/
data/
db/
utils/

Do not put business logic directly inside UI components when it can reasonably be extracted.

Example:

Bad:

VocabularyCard.jsx contains:
- rendering
- SRS calculations
- database queries
- progress calculation
- navigation logic

Preferred:

VocabularyCard.jsx
services/srs.js
db/progressRepository.js
hooks/useVocabularyProgress.js

---

# Suggested Structure

src/

components/
- layout/
- ui/
- feedback/

features/
- kana/
- vocabulary/
- kanji/
- grammar/
- flashcards/
- quiz/
- review/
- missions/
- progress/

pages/

data/
- kana/
- vocabulary/
- kanji/
- grammar/

db/

hooks/

services/

utils/

styles/

App.jsx

main.jsx

Do not create unnecessary abstraction before it is needed.

---

# Static Learning Data

Learning content should initially be stored locally.

Examples:

src/data/kana/hiragana.json

src/data/kana/katakana.json

src/data/vocabulary/n5.json

src/data/kanji/n5.json

src/data/grammar/n5.json

Static learning data and user progress MUST remain separated.

---

# Vocabulary Data Model

Recommended structure:

{
  "id": "n5-vocab-001",
  "word": "食べる",
  "reading": "たべる",
  "romaji": "taberu",
  "meaning": "makan",
  "type": "verb",
  "jlpt": "N5",
  "examples": [
    {
      "japanese": "私は寿司を食べます。",
      "reading": "わたしはすしをたべます。",
      "meaning": "Saya makan sushi."
    }
  ]
}

---

# Kanji Data Model

Recommended structure:

{
  "id": "n5-kanji-001",
  "kanji": "食",
  "meaning": ["makan", "makanan"],
  "onyomi": ["ショク"],
  "kunyomi": ["た.べる"],
  "jlpt": "N5",
  "strokes": 9,
  "examples": [
    "食べる",
    "食事",
    "朝食"
  ]
}

---

# Grammar Data Model

Recommended structure:

{
  "id": "n5-grammar-001",
  "pattern": "～たい",
  "meaning": "ingin melakukan sesuatu",
  "jlpt": "N5",
  "structure": "Verb stem + たい",
  "explanation": "",
  "examples": []
}

---

# IndexedDB

Dexie.js should be used as the IndexedDB wrapper.

IndexedDB stores USER-SPECIFIC DATA only.

Examples:

- progress
- mastery
- learning history
- review history
- quiz results
- streak
- favorites
- SRS state
- daily missions
- settings

Never duplicate all static learning content into IndexedDB unless a future requirement specifically requires it.

---

# Learning Status

Suggested learning states:

new

learning

familiar

mastered

Individual modules may expand this model when necessary.

---

# Spaced Repetition

Initial implementation can use a simple interval-based SRS.

Possible review ratings:

Again

Hard

Good

Easy

However:

SRS logic MUST live independently from UI components.

Example:

services/srs.js

Future versions may replace the simple algorithm with FSRS.

Therefore:

Do not tightly couple UI components to a specific SRS algorithm.

---

# Quiz Engine

The quiz architecture must support multiple question types.

Examples:

multiple_choice

reverse_multiple_choice

typing

matching

sentence_completion

recognition

The quiz engine should be reusable across:

- Hiragana
- Katakana
- Vocabulary
- Kanji
- Grammar

Do not create separate duplicated quiz engines for every module.

---

# Daily Mission

Daily Missions should eventually combine:

Review

New Learning

Practice

Example:

Review:
20 due items

Learn:
5 vocabulary
2 kanji
1 grammar

Practice:
10 mixed questions

Daily Mission logic should eventually be generated using progress data.

---

# Progress Tracking

Track meaningful learning metrics.

Possible metrics:

- vocabulary learned
- kanji learned
- grammar learned
- kana mastery
- review accuracy
- quiz accuracy
- learning streak
- total study sessions
- total study time
- weak areas
- mastery percentage

Do not calculate unrelated vanity metrics unless useful.

---

# PWA

The application must eventually support:

- installation
- offline loading
- application icon
- manifest
- caching of application shell

Do not aggressively cache data in ways that may cause stale application versions.

---

# Accessibility

Use semantic HTML.

Interactive elements must be keyboard accessible.

Buttons must use button elements.

Forms must have labels.

Do not rely only on color to communicate status.

Maintain readable contrast.

---

# Performance

Avoid unnecessary re-renders.

Avoid excessive dependency installation.

Lazy loading may be used where beneficial.

Static Japanese learning datasets should not unnecessarily block initial application rendering.

Optimize large datasets if the project eventually becomes large.

---

# Coding Style

Prioritize readability.

Prefer:

small functions

clear names

predictable data flow

simple abstractions

Avoid clever code when straightforward code is easier to maintain.

Use English for:

- filenames
- variable names
- functions
- comments
- technical documentation

UI content may use:

- English
- Indonesian
- Japanese

depending on the learning context.

---

# Error Handling

Do not silently swallow errors.

Handle IndexedDB failures gracefully.

User-facing errors should be understandable.

Development errors should remain useful for debugging.

---

# Development Workflow

Before implementing any task:

1. Read AGENTS.md.
2. Inspect existing architecture.
3. Identify the relevant feature.
4. Reuse existing patterns.
5. Avoid unrelated changes.

After implementing:

1. Run lint if configured.
2. Run tests if available.
3. Run:

npm run build

4. Fix all build errors.
5. Report what changed.

---

# Git Rules

Keep commits focused.

Recommended Conventional Commit style:

feat:

fix:

refactor:

style:

docs:

chore:

Examples:

feat: add hiragana learning module

feat: implement vocabulary flashcards

fix: preserve review state after refresh

refactor: extract quiz evaluation service

Do not bundle unrelated modifications into the same task.

---

# Important Restrictions

Do NOT:

- redesign unrelated screens without being asked
- replace working architecture without justification
- add unnecessary dependencies
- introduce a backend prematurely
- add authentication
- use external APIs without approval
- invent Japanese learning data when accuracy is uncertain
- hardcode large data structures directly into components
- duplicate business logic
- remove existing features without explicit instruction

---

# Development Strategy

Build the project incrementally.

Do not attempt the full application in a single implementation task.

Preferred progression:

Foundation

↓

Dashboard

↓

Kana

↓

Vocabulary

↓

Kanji

↓

Grammar

↓

Quiz Engine

↓

Flashcards

↓

Progress Persistence

↓

SRS

↓

Daily Mission

↓

Progress Analytics

↓

PWA

Each milestone must leave the project in a working buildable state.

---

# Current Scope

Version 1 includes:

- Dashboard
- Hiragana
- Katakana
- Vocabulary
- Kanji
- Grammar
- Flashcards
- Mixed Quiz
- SRS Review
- Daily Mission
- Progress

Do not implement future modules until requested.

Future modules include:

- Sentence Builder
- Listening
- Reading
- Mistake Book
- Dictionary
- JLPT Roadmap
- Speaking
- Writing
- AI Sensei
- Adaptive Learning
- Cloud synchronization