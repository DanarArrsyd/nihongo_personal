# Milestone 3 Kana Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add shared Hiragana and Katakana learning with group navigation, character detail, session progress, pronunciation, and three practice modes.

**Architecture:** One paired Kana catalog feeds script-specific selectors. Learn and practice routes compose focused feature components; pure services own question generation and speech behavior. All progress stays in local React state until Milestone 9.

**Tech Stack:** React, React Router, JavaScript, Tailwind CSS, Lucide React, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-08-28-milestone-3-kana-design.md`

## Global Constraints

- Implement Milestone 3 only.
- Reuse one architecture for Hiragana and Katakana.
- Keep static Kana content separate from session state.
- Do not add IndexedDB, SRS, Vocabulary, Kanji, Grammar, or a global quiz engine.
- Use browser Speech Synthesis only; no external APIs.

---

### Task 1: Kana catalog and selectors

**Files:**
- Create: `src/data/kana/kanaCatalog.js`
- Create: `src/features/kana/services/kanaData.js`
- Test: `src/features/kana/services/kanaData.test.js`

**Interfaces:**
- Produces: `getKanaGroups(script)`, `getKanaGroup(script, groupId)`, `getAllKana(script)`.

- [ ] Write failing tests asserting both scripts expose matching group IDs, Hiragana `あ`, Katakana `ア`, and invalid scripts return no groups.
- [ ] Run `npm test -- src/features/kana/services/kanaData.test.js`; expect missing-module failure.
- [ ] Add paired catalog data and selector functions returning immutable derived objects.
- [ ] Run focused test; expect pass.

### Task 2: Kana question and pronunciation services

**Files:**
- Create: `src/features/kana/services/kanaQuiz.js`
- Create: `src/features/kana/services/speech.js`
- Test: `src/features/kana/services/kanaQuiz.test.js`, `src/features/kana/services/speech.test.js`

**Interfaces:**
- Produces: `createKanaQuestion({ item, mode, distractors })`, `checkKanaAnswer(question, answer)`, `speakJapanese(text, engine)`.

- [ ] Write failing literal-output tests for recognition, reverse, typing, normalized answers, and unsupported modes.
- [ ] Write failing tests proving speech uses `ja-JP` and missing support returns `{ ok: false }`.
- [ ] Implement pure question/answer behavior and guarded speech behavior.
- [ ] Run both focused test files; expect pass.

### Task 3: Learn overview and Kana learning page

**Files:**
- Create: `src/features/learn/LearnPage.jsx`
- Create: `src/features/kana/KanaLearningPage.jsx`
- Create: `src/features/kana/components/ScriptSwitcher.jsx`, `GroupNavigation.jsx`, `KanaGrid.jsx`, `KanaDetail.jsx`
- Test: `src/features/kana/KanaLearningPage.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: Kana selector services.
- Produces: Learn overview and `/learn/kana/:script/:groupId` interaction.

- [ ] Write failing integration tests for Learn module links, both scripts, group change, selected detail, and mark-learned progress.
- [ ] Run focused test; expect missing page/routes.
- [ ] Implement shared responsive components and local learned-ID state.
- [ ] Add routes and invalid-parameter recovery.
- [ ] Run focused tests; expect pass.

### Task 4: Kana practice

**Files:**
- Create: `src/features/practice/PracticePage.jsx`
- Create: `src/features/kana/KanaPracticePage.jsx`
- Create: `src/features/kana/components/PracticeModePicker.jsx`, `KanaQuestion.jsx`
- Test: `src/features/kana/KanaPracticePage.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: Kana selectors and quiz services.
- Produces: `/practice/kana/:script/:mode` sessions.

- [ ] Write failing integration tests for recognition selection, reverse selection, typing submission, correctness feedback, and next-question movement.
- [ ] Run focused test; expect missing page/routes.
- [ ] Implement one shared practice page with local score and question index.
- [ ] Connect Practice overview and all supported routes.
- [ ] Run focused tests; expect pass.

### Task 5: Visual polish and final proof

**Files:**
- Modify: `src/styles/index.css` only when reusable Tailwind utilities cannot express genkō-yōshi treatment.

**Interfaces:**
- Produces: responsive, keyboard-accessible Milestone 3 experience.

- [ ] Run full tests and ESLint.
- [ ] Start Vite and inspect Learn, both Kana scripts, all group layouts, and three practice modes at 1440 px and 390 px.
- [ ] Check console output, overflow, visible focus, and reduced-motion behavior.
- [ ] Run `npm run build` and `npm audit --audit-level=high`.
- [ ] Compare final source against Milestone 3 non-goals and remove later-milestone behavior.
