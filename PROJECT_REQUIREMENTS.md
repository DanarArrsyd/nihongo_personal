# PROJECT_REQUIREMENTS.md

# Nihongo Personal

Version: 1.1

Project Type:
Personal Japanese Learning Web Application

Target User:
Single private user

Primary Platform:
Desktop Web

Secondary Platform:
Mobile Web / PWA

Deployment:
Vercel

Repository:
GitHub

---

# 1. Product Vision

Nihongo Personal is a personal Japanese learning system designed to make Japanese study structured, measurable, and consistent.

The application should help the user answer three questions every day:

1. What should I learn today?
2. What should I review today?
3. How much progress have I made?

The application should combine structured learning with active recall and spaced repetition.

---

# 2. Product Principles

The product must prioritize:

Structured Learning

The user should always know what to study next.

Active Recall

Users should actively retrieve information rather than only reading material.

Spaced Repetition

Previously learned material should automatically return for review.

Contextual Learning

Vocabulary, Kanji, Grammar, and Sentences should connect to each other.

Low Friction

Starting a study session should require minimal decision making.

Progress Visibility

Progress should be visible and understandable.

Consistency

The system should encourage daily study without aggressive gamification.

---

# 3. Main Navigation

Primary navigation:

Dashboard

Learn

Practice

Review

Progress

Library

---

# 4. Dashboard

Purpose:

Give the user an immediate overview of today's Japanese study.

Required components:

Greeting

Example:

おはようございます。

Welcome back.

Current JLPT level

Example:

JLPT N5

Daily Goal

Example:

18 / 20 minutes

Daily Mission

Example:

Review
18 items

Learn
5 Vocabulary
2 Kanji
1 Grammar

Practice
10 Questions

Continue Learning button

Current Streak

Example:

🔥 12 Days

Learning statistics

Vocabulary mastered

Kanji mastered

Grammar mastered

Reviews due today

Weekly learning activity

Recent activity

---

# 5. Learn

Learn contains structured learning modules.

Sections:

Kana

Vocabulary

Kanji

Grammar

Eventually:

Reading

Listening

Sentences

---

# 6. Hiragana Module

The module must teach Hiragana progressively.

Groups:

Vowels

K Group

S Group

T Group

N Group

H Group

M Group

Y Group

R Group

W Group

N

Dakuten

Handakuten

Combination Kana

Learning card should include:

Japanese character

Romaji

Pronunciation

Learning status

Possible practice modes:

Recognition

Reverse Recognition

Typing

Listening

Matching

Mastery Test

Required progress indicators:

Characters learned

Accuracy

Mastery percentage

---

# 7. Katakana Module

Use the same learning architecture as Hiragana.

Do not duplicate unnecessary logic.

Katakana should support the same practice modes.

---

# 8. Vocabulary

Vocabulary card information:

Japanese word

Reading

Romaji

Meaning

Word type

JLPT level

Pronunciation

Example sentence

Learning status

Favorite status

Example:

食べる

たべる

taberu

Makan

Verb

JLPT N5

Example:

私は寿司を食べます。

Vocabulary learning modes:

Flashcard

Meaning Recognition

Japanese Recall

Reading Recognition

Sentence Completion

Listening Recognition

---

# 9. Vocabulary Progress

Each vocabulary item should support:

new

learning

familiar

mastered

Progress should contain:

correct answers

incorrect answers

accuracy

last reviewed date

next review date

SRS stage

---

# 10. Kanji

Kanji learning page should contain:

Kanji

Meaning

On'yomi

Kun'yomi

JLPT level

Stroke count

Related vocabulary

Example usage

Optional future feature:

Mnemonic

Radical/component relationships

Stroke order animation

---

# 11. Grammar

Grammar point should contain:

Pattern

Meaning

JLPT level

Structure

Explanation

Example sentences

Related grammar

Example:

～たい

Meaning:

ingin melakukan sesuatu

Structure:

Verb stem + たい

Example:

日本へ行きたいです。

Saya ingin pergi ke Jepang.

Grammar practice:

Multiple choice

Sentence completion

Meaning recognition

Structure selection

Sentence construction

---

# 12. Flashcards

Flashcards should support:

Vocabulary

Kanji

Grammar

Potentially Kana

Flashcard interaction:

Front

↓

Reveal

↓

Again

Hard

Good

Easy

Rating must update SRS scheduling.

---

# 13. Quiz Engine

The application should have one reusable quiz engine.

Supported question types:

Multiple Choice

Reverse Multiple Choice

Typing

Recognition

Sentence Completion

Matching

Future:

Listening

Sentence Builder

Each question should record:

question ID

question type

user answer

correct answer

result

timestamp

associated learning item

---

# 14. Practice

Practice is separate from structured learning.

Practice allows user-controlled training.

Available V1 modes:

Quick Quiz

Flashcards

Kana Practice

Vocabulary Practice

Kanji Practice

Grammar Practice

Mixed Quiz

Possible session sizes:

5 Questions

10 Questions

20 Questions

Unlimited

---

# 15. Review

Review contains learning items due through the SRS system.

Example:

Review Today

32 Items

12 Vocabulary

8 Kanji

7 Grammar

5 Kana

The user should not have to manually choose all review items.

The system determines due content.

---

# 16. Spaced Repetition

Initial SRS levels may use simple intervals.

Example:

Again:
repeat soon

Hard:
short interval

Good:
standard interval

Easy:
long interval

Exact intervals may evolve later.

Architecture must allow replacing this system with FSRS in the future.

---

# 17. Daily Mission

Daily Mission automatically provides a structured daily study session.

Example:

Today's Mission

Review

20 due items

Learn

5 vocabulary

2 kanji

1 grammar

Practice

10 mixed questions

The system should estimate completion progress.

Possible study flow:

Review

↓

New Vocabulary

↓

New Kanji

↓

Grammar

↓

Mixed Practice

↓

Session Summary

---

# 18. Session Summary

At the end of a structured learning session display:

Study duration

Items reviewed

Items learned

Questions answered

Accuracy

Mastery changes

Current streak

Example:

Session Complete

18 minutes

22 reviews

8 new items

15 questions

87% accuracy

---

# 19. Progress

Progress page should include:

Overall learning progress

Kana mastery

Vocabulary progress

Kanji progress

Grammar progress

Review accuracy

Weekly activity

Study streak

Learning history

Potential visualization:

weekly study chart

mastery cards

JLPT module progress

---

# 20. Streak

A streak represents consecutive days containing meaningful study activity.

Opening the application alone should not count.

Possible qualifying actions:

Completing a lesson

Completing a review

Completing a quiz

Completing Daily Mission

Minimum requirements may be refined later.

---

# 21. Library

Library should provide access to learning content outside structured lessons.

Sections:

Vocabulary

Kanji

Grammar

Favorites

User can search content.

Future:

Personal Notes

Dictionary

Mistake Book

---

# 22. Search

Search should eventually support:

Japanese characters

Kana

Romaji

Meaning

Example:

Search:

taberu

Results:

食べる

Search:

makan

Results:

食べる

Search:

食

Results:

食

食べる

食事

Search implementation may be introduced after core modules.

---

# 23. Audio

Initial pronunciation should use browser Speech Synthesis where supported.

Language:

ja-JP

The application should gracefully handle browsers without Japanese speech synthesis.

No paid speech API in V1.

---

# 24. Offline

Application shell and learning content should remain usable offline where reasonably possible.

Offline features:

Kana learning

Vocabulary data

Kanji data

Grammar data

Flashcards

Local progress

Review queue

Some browser-dependent features may not work offline.

---

# 25. PWA

Required eventual PWA capabilities:

Installable

Standalone display

Application icon

Manifest

Offline caching

Responsive layout

---

# 26. Data Separation

Static Content:

JSON files

Examples:

Vocabulary

Kanji

Grammar

Kana

User State:

IndexedDB

Examples:

Mastery

Quiz history

Study history

Favorites

SRS

Streak

Settings

Never mix static Japanese curriculum data with user activity data unnecessarily.

---

# 27. Gamification

Use subtle gamification.

Allowed:

Streak

Achievements

Progress levels

Daily completion

Mastery milestones

Avoid:

Lives

Energy

Aggressive XP systems

Punishment for incorrect answers

Paywalls

Leaderboards

The application exists to encourage learning, not maximize engagement.

---

# 28. Responsive Requirements

Desktop:

Sidebar navigation

Spacious content

Multi-column cards

Mobile:

Comfortable touch targets

Compact navigation

Single-column or adaptive layouts

Flashcard interaction must remain comfortable on mobile.

---

# 29. Future Modules

Not part of V1.

Sentence Builder

Listening Lab

Reading Practice

Mistake Book

Dictionary

JLPT Roadmap

Speaking Practice

Writing Practice

AI Sensei

Conversation Simulation

Adaptive Learning

Cloud Sync

User Accounts

---

# 30. Definition of V1 Complete

Version 1 can be considered complete when the user can:

Open the application.

See today's learning dashboard.

Study Hiragana and Katakana.

Learn vocabulary.

Learn Kanji.

Learn grammar.

Complete quizzes.

Use flashcards.

Have progress saved locally.

Receive due reviews.

Complete Daily Missions.

View learning progress.

Install the application as a PWA.

Refresh or reopen the application without losing progress.

Deploy the application successfully through Vercel.

---

# 31. Data Safety

Version 1.1 must allow the user to:

Export all user-specific IndexedDB records to a portable JSON backup.

Inspect a backup summary before restoring it.

Reject malformed, oversized, duplicate, or incompatible backup data.

Confirm before replacing current local data.

Restore all tables in one atomic transaction so failed restores preserve existing data.

Static Japanese learning content must remain outside the backup.
