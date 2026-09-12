import { useCallback, useEffect, useReducer, useRef } from 'react'

import Button from '../../components/ui/Button.jsx'
import FlashcardProgress from './components/FlashcardProgress.jsx'
import FlashcardResults from './components/FlashcardResults.jsx'
import FlashcardUnavailable from './components/FlashcardUnavailable.jsx'
import RatingControls from './components/RatingControls.jsx'
import StudyCard from './components/StudyCard.jsx'
import { createFlashcardResponse } from './services/flashcardResponse.js'
import {
  createFlashcardState,
  flashcardSessionReducer,
  getCurrentCard,
  getFlashcardProgress,
  getRatingCounts,
} from './services/flashcardSession.js'

const ratingShortcuts = {
  1: 'again',
  2: 'hard',
  3: 'good',
  4: 'easy',
}

const supportedModules = new Set(['vocabulary', 'kanji', 'grammar'])

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasValidText(value) {
  return hasText(value?.text)
    && (value.lang === undefined || hasText(value.lang))
}

function isValidExample(example) {
  return example === undefined || (
    hasText(example?.japanese)
    && hasText(example.reading)
    && hasText(example.meaning)
  )
}

function isValidCard(card) {
  return hasText(card?.id)
    && supportedModules.has(card.source?.module)
    && hasText(card.source?.itemId)
    && hasText(card.front?.eyebrow)
    && hasValidText(card.front?.primary)
    && hasText(card.front?.hint)
    && hasValidText(card.back?.title)
    && (card.back?.meaning === undefined || hasText(card.back.meaning))
    && Array.isArray(card.back?.details)
    && card.back.details.every((detail) => hasText(detail?.label) && hasValidText(detail.value))
    && isValidExample(card.back.example)
}

function isValidCardSet(cards) {
  if (!Array.isArray(cards) || cards.length === 0 || !cards.every(isValidCard)) return false

  return new Set(cards.map(({ id }) => id)).size === cards.length
}

function createValidatedState(cards) {
  return createFlashcardState(isValidCardSet(cards) ? cards : [])
}

function isEditableTarget(target) {
  return Boolean(target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])'))
}

export default function FlashcardSession({ cards, onRestart, now }) {
  const [state, dispatch] = useReducer(flashcardSessionReducer, cards, createValidatedState)
  const answerHeadingRef = useRef(null)
  const cardHeadingRef = useRef(null)
  const focusIntentRef = useRef(null)
  const nowRef = useRef(now)
  const onRestartRef = useRef(onRestart)
  const ratingLockedRef = useRef(false)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
    nowRef.current = now
    onRestartRef.current = onRestart
  }, [now, onRestart, state])

  useEffect(() => {
    if (focusIntentRef.current === 'answer' && state.revealed) {
      focusIntentRef.current = null
      answerHeadingRef.current?.focus()
    }

    if (focusIntentRef.current === 'card' && state.status === 'active' && !state.revealed) {
      focusIntentRef.current = null
      cardHeadingRef.current?.focus()
    }
  }, [state.currentIndex, state.revealed, state.status])

  const revealCurrentCard = useCallback(() => {
    const currentState = stateRef.current
    if (currentState.status !== 'active' || currentState.revealed || !getCurrentCard(currentState)) {
      return false
    }

    ratingLockedRef.current = false
    focusIntentRef.current = 'answer'
    dispatch({ type: 'REVEAL' })
    return true
  }, [])

  const rateCurrentCard = useCallback((rating) => {
    const currentState = stateRef.current
    const card = getCurrentCard(currentState)
    if (!currentState.revealed || !card || ratingLockedRef.current) return false

    ratingLockedRef.current = true
    focusIntentRef.current = 'card'
    dispatch({
      type: 'RATE',
      response: createFlashcardResponse({ card, rating, now: nowRef.current }),
    })
    return true
  }, [])

  const restart = useCallback(() => {
    if (typeof onRestartRef.current !== 'function') return

    const replacementCards = onRestartRef.current()
    if (!isValidCardSet(replacementCards)) return

    ratingLockedRef.current = false
    focusIntentRef.current = 'card'
    dispatch({ type: 'RESTART', cards: replacementCards })
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (isEditableTarget(event.target)) return

      if (event.code === 'Space' || event.key === ' ') {
        if (revealCurrentCard()) event.preventDefault()
        return
      }

      const rating = ratingShortcuts[event.key]
      if (rating) rateCurrentCard(rating)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [rateCurrentCard, revealCurrentCard])

  if (!isValidCardSet(state.cards)) {
    return (
      <FlashcardUnavailable
        primaryAction={typeof onRestart === 'function' ? (
          <Button type="button" onClick={restart}>Coba lagi</Button>
        ) : null}
      />
    )
  }

  if (state.status === 'completed') {
    return (
      <FlashcardResults
        state={state}
        ratingCounts={getRatingCounts(state)}
        onRestart={restart}
      />
    )
  }

  const card = getCurrentCard(state)
  const progress = getFlashcardProgress(state)

  return (
    <section aria-label="Sesi flashcard" className="flashcard-session mx-auto w-full max-w-5xl">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start">
        <div className="min-w-0">
          <StudyCard
            answerHeadingRef={answerHeadingRef}
            card={card}
            cardHeadingRef={cardHeadingRef}
            revealed={state.revealed}
            onReveal={revealCurrentCard}
          />
          <RatingControls disabled={!state.revealed} onRate={rateCurrentCard} />
        </div>
        <FlashcardProgress {...progress} />
      </div>
    </section>
  )
}
