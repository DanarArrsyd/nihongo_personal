# ROADMAP.md

# Nihongo Personal Development Roadmap

The application must be developed incrementally.

Every milestone must leave the project in a functional and buildable state.

Do not proceed to the next milestone while major errors remain in the current milestone.

---

# MILESTONE 0 — Project Foundation

Goal:

Create the basic application environment.

Tasks:

- Initialize React + Vite
- Configure Tailwind CSS
- Install React Router
- Install Dexie.js
- Install Lucide React
- Install vite-plugin-pwa
- Configure basic PWA manifest
- Configure fonts
- Configure global styles
- Create project folders
- Configure ESLint
- Confirm production build

Acceptance Criteria:

npm run dev works.

npm run build succeeds.

No critical console errors.

---

# MILESTONE 1 — Design System & Application Shell

Goal:

Establish the visual language of the application.

Implement:

Desktop sidebar

Mobile navigation

Page layout

Typography

Buttons

Cards

Badges

Progress bars

Empty states

Loading states

Color system

Navigation:

Dashboard

Learn

Practice

Review

Progress

Library

Acceptance Criteria:

All primary pages can be navigated.

Layout works on desktop and mobile.

Visual design follows AGENTS.md.

---

# MILESTONE 2 — Dashboard

Goal:

Create the central study dashboard.

Implement:

Japanese greeting

Current JLPT level

Streak

Daily goal

Today's Mission

Continue Learning CTA

Vocabulary statistics

Kanji statistics

Grammar statistics

Reviews Due

Weekly activity

Recent activity

Initially use structured mock data.

Do not implement database persistence yet.

Acceptance Criteria:

Dashboard is fully responsive.

No data should be hardcoded directly inside presentation components.

---

# MILESTONE 3 — Kana Learning

Goal:

Create reusable Kana learning architecture.

Modules:

Hiragana

Katakana

Implement:

Kana datasets

Kana grid

Character details

Romaji

Pronunciation

Learning status

Recognition quiz

Reverse recognition

Typing practice

Progress UI

Acceptance Criteria:

Both Hiragana and Katakana use shared reusable logic.

User can navigate through Kana groups.

Basic practice works.

---

# MILESTONE 4 — Vocabulary

Goal:

Create vocabulary learning system.

Implement:

JLPT N5 vocabulary dataset structure

Vocabulary list

Vocabulary detail

Search/filter

Word types

Pronunciation

Example sentences

Favorite UI

Learning status

Acceptance Criteria:

Vocabulary content comes from structured data files.

Components remain reusable.

---

# MILESTONE 5 — Kanji

Goal:

Create Kanji learning module.

Implement:

JLPT N5 Kanji dataset structure

Kanji grid

Kanji detail page

Meaning

On'yomi

Kun'yomi

Stroke count

Related vocabulary

JLPT information

Acceptance Criteria:

Kanji and vocabulary relationships can be displayed.

No duplicated learning content inside components.

---

# MILESTONE 6 — Grammar

Goal:

Create structured grammar learning.

Implement:

Grammar list

Grammar detail

Pattern

Meaning

Structure

Explanation

Example sentences

Related grammar

JLPT filter

Acceptance Criteria:

Grammar data remains separated from UI.

Grammar page follows the same design system.

---

# MILESTONE 7 — Reusable Quiz Engine

Goal:

Build one quiz system usable across modules.

Implement:

Quiz session state

Question renderer

Answer evaluation

Results

Score

Question navigation

Supported V1 question types:

multiple_choice

reverse_multiple_choice

typing

recognition

sentence_completion

Architecture must support future quiz types.

Acceptance Criteria:

Kana, vocabulary, Kanji, and Grammar can use the same quiz infrastructure.

---

# MILESTONE 8 — Flashcards

Goal:

Implement active recall flashcards.

Support:

Vocabulary

Kanji

Grammar

Interface:

Front

Reveal Answer

Again

Hard

Good

Easy

Do not implement advanced SRS yet.

Ratings can initially update temporary session state.

Acceptance Criteria:

Flashcard experience works on desktop and mobile.

Keyboard controls may be added where appropriate.

---

# MILESTONE 9 — IndexedDB Persistence

Goal:

Persist real user learning data.

Implement Dexie database.

Suggested tables:

progress

reviews

quizHistory

studySessions

favorites

settings

Potential schema:

progress:
- itemId
- itemType
- status
- mastery
- correctCount
- incorrectCount
- lastStudiedAt

reviews:
- itemId
- itemType
- dueAt
- interval
- difficulty
- lastRating

quizHistory:
- sessionId
- questionId
- result
- timestamp

studySessions:
- startedAt
- endedAt
- duration
- module
- score

Acceptance Criteria:

Refresh does not delete learning progress.

Application continues working if IndexedDB contains no data.

---

# MILESTONE 10 — SRS Review Engine

Goal:

Automatically schedule reviews.

Implement:

Due calculation

Review queue

Again

Hard

Good

Easy

Interval updates

Next review timestamps

Review page

Show:

Total due

Vocabulary due

Kanji due

Grammar due

Kana due

Acceptance Criteria:

Items correctly become due based on stored timestamps.

SRS logic is independent from React presentation components.

---

# MILESTONE 11 — Daily Mission

Goal:

Provide an automatic daily learning routine.

Mission contains:

Review

New Learning

Practice

Example:

Review:
15 items

Vocabulary:
5 new

Kanji:
2 new

Grammar:
1 new

Practice:
10 questions

Implement:

Mission generation

Mission progress

Start Mission

Resume Mission

Mission completion

Acceptance Criteria:

Mission progress persists after refresh.

Completed mission should not unnecessarily regenerate during the same day.

---

# MILESTONE 12 — Progress Analytics

Goal:

Make learning progress measurable.

Implement:

Overall progress

Kana mastery

Vocabulary mastery

Kanji mastery

Grammar mastery

Quiz accuracy

Review accuracy

Study streak

Weekly activity

Study history

Use simple charts where useful.

Avoid unnecessary analytics dependencies if native CSS or lightweight implementation is enough.

Acceptance Criteria:

Statistics come from persisted activity data.

Do not use fake values after database integration.

---

# MILESTONE 13 — Library

Goal:

Provide searchable reference access to learning content.

Implement:

Vocabulary library

Kanji library

Grammar library

Favorites

Search

Filters

Search should support where possible:

Japanese

Kana

Romaji

Meaning

Acceptance Criteria:

Search remains fast for expected dataset size.

---

# MILESTONE 14 — PWA & Offline Polish

Goal:

Make application feel installable and reliable.

Implement:

Final application manifest

Application icons

Standalone mode

Offline application shell

Offline learning data

Appropriate caching strategy

Update behavior

Acceptance Criteria:

Application can be installed.

Main learning features work after initial load when offline.

Progress remains local.

---

# MILESTONE 15 — Production Preparation

Goal:

Prepare project for real personal usage.

Tasks:

Run lint

Run production build

Review console warnings

Review responsive layouts

Review IndexedDB migration behavior

Review PWA

Check navigation

Check empty database state

Check corrupted/failed DB handling

Check Japanese character rendering

Remove unnecessary development mocks

Remove dead code

Document setup

Acceptance Criteria:

npm run build succeeds.

No known blocking issues.

---

# MILESTONE 16 — GitHub & Vercel Deployment

Goal:

Deploy production V1.

Tasks:

Create GitHub repository.

Push project.

Connect repository to Vercel.

Configure Vercel build:

npm run build

Output:

dist

Deploy production.

Verify PWA.

Verify routes.

Verify mobile layout.

Acceptance Criteria:

Production URL loads successfully.

Page refresh on nested routes works.

Learning progress works.

PWA can be installed where supported.

---

# V1.1 — DATA SAFETY

Goal:

Protect local learning progress from accidental browser or device data loss.

Implement:

Manual JSON export for every user-data table.

Validated backup preview.

Explicit restore confirmation.

Atomic full-database restore.

Clear success and failure feedback.

Acceptance Criteria:

Exported backup contains user data only.

Malformed or incompatible files cannot replace current data.

Restore failure preserves the previous database state.

Backup and restore remain usable on desktop and mobile.

---

# V1.2 — KANA WRITING PRACTICE

Goal:

Teach the physical stroke order of Kana through direct drawing practice.

Implement:

Touch, stylus, and mouse writing canvas.

Numbered Hiragana and Katakana stroke guides.

Stroke-order, direction, and shape feedback.

Entry points from Learn and Practice.

Existing progress and study-session persistence.

Locally bundled, attributed stroke data for offline use.

Acceptance Criteria:

All single-character Kana in the current catalogue can be practised.

Incorrect stroke order or direction produces understandable feedback.

The writing board remains usable on smartphone, tablet, and desktop.

Successful practice is included in existing progress and data backups.

---

# V1.3 — PRACTICE VARIETY

Goal:

Make practice sessions configurable, varied, and informed by existing learning progress.

Implement:

Mixed Quiz session setup.

10, 20, and 30 question sessions.

Module and question-type selection.

Unique questions within a session.

Balanced module and question-type distribution.

Reduced repetition from recent quiz history.

Weak-item prioritization from existing progress.

Acceptance Criteria:

The user can configure and start a valid session on smartphone, tablet, and desktop.

Every generated session contains the requested number of unique, valid questions.

Restarting creates a fresh session with reduced immediate repetition.

Empty or failed local personalization data does not block practice.

This milestone does not add new curriculum records or future practice modules.

---

# FUTURE V2

Sentence Builder

Listening Practice

Reading Practice

Mistake Book

Dictionary improvements

JLPT Roadmap

Achievements

Custom Daily Goals

Study Calendar

---

# FUTURE V3

Speaking Practice

Writing Practice

AI Sensei

Conversation Simulator

Adaptive Learning

Weakness Detection

Smart Recommendations

Cloud Backup

Cross-device Sync

Optional Authentication

---

# Codex Working Rule

For each milestone:

1. Read AGENTS.md.
2. Read PROJECT_REQUIREMENTS.md.
3. Read ROADMAP.md.
4. Inspect the current repository.
5. Implement ONLY the requested milestone.
6. Preserve unrelated working features.
7. Run validation.
8. Run production build.
9. Fix errors.
10. Summarize changed files.

Never implement future milestones unless explicitly instructed.
