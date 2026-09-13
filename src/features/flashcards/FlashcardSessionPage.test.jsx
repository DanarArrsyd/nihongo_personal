import { fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createFlashcardDeck } from './adapters/flashcardDeckAdapter.js'
import FlashcardSessionPage from './FlashcardSessionPage.jsx'

vi.mock('./adapters/flashcardDeckAdapter.js', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    createFlashcardDeck: vi.fn(),
  }
})

const moduleCards = {
  vocabulary: {
    id: 'flashcard-vocabulary-route-card',
    source: { module: 'vocabulary', itemId: 'vocabulary-route-card' },
    front: {
      eyebrow: 'Vocabulary',
      primary: { text: '食べる', lang: 'ja' },
      hint: 'Ingat bacaan dan artinya.',
    },
    back: {
      title: { text: 'たべる', lang: 'ja' },
      meaning: 'makan',
      details: [],
    },
  },
  kanji: {
    id: 'flashcard-kanji-route-card',
    source: { module: 'kanji', itemId: 'kanji-route-card' },
    front: {
      eyebrow: 'Kanji',
      primary: { text: '飲', lang: 'ja' },
      hint: 'Ingat arti dan bacaannya.',
    },
    back: {
      title: { text: 'minum' },
      details: [],
    },
  },
  grammar: {
    id: 'flashcard-grammar-route-card',
    source: { module: 'grammar', itemId: 'grammar-route-card' },
    front: {
      eyebrow: 'Grammar',
      primary: { text: '～たい', lang: 'ja' },
      hint: 'Ingat arti dan polanya.',
    },
    back: {
      title: { text: 'ingin melakukan sesuatu' },
      details: [],
    },
  },
}

function successfulDeck(module) {
  return { cards: [moduleCards[module]], error: null }
}

function renderRoute(path, { navigation = false } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      {navigation ? <Link to="/practice/flashcards/grammar">Buka Grammar</Link> : null}
      <Routes>
        <Route path="/practice/flashcards/:module" element={<FlashcardSessionPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('FlashcardSessionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createFlashcardDeck.mockImplementation(({ module }) => successfulDeck(module))
  })

  it.each([
    ['vocabulary', 'Vocabulary Flashcards', '食べる'],
    ['kanji', 'Kanji Flashcards', '飲'],
    ['grammar', 'Grammar Flashcards', '～たい'],
  ])('starts one %s deck for its route', (module, heading, front) => {
    renderRoute(`/practice/flashcards/${module}`)

    expect(createFlashcardDeck).toHaveBeenCalledOnce()
    expect(createFlashcardDeck).toHaveBeenCalledWith({ module })
    expect(screen.getByRole('heading', { name: heading, level: 1 })).toBeVisible()
    expect(screen.getByRole('heading', { name: front, level: 2 })).toBeVisible()
  })

  it('completes the injected deck with the real session UI', () => {
    renderRoute('/practice/flashcards/vocabulary')

    fireEvent.click(screen.getByRole('button', { name: 'Tampilkan jawaban' }))
    fireEvent.click(screen.getByRole('button', { name: 'Good, tombol 3' }))

    expect(screen.getByRole('heading', { name: 'Hasil flashcard' })).toBeVisible()
    expect(screen.getByLabelText('Good: 1')).toBeVisible()
  })

  it('regenerates the deck on restart and returns to a hidden front', () => {
    const replacement = {
      ...moduleCards.vocabulary,
      id: 'flashcard-vocabulary-replacement',
      source: { module: 'vocabulary', itemId: 'vocabulary-replacement' },
      front: { ...moduleCards.vocabulary.front, primary: { text: '飲む', lang: 'ja' } },
      back: { ...moduleCards.vocabulary.back, title: { text: 'のむ', lang: 'ja' }, meaning: 'minum' },
    }
    createFlashcardDeck
      .mockReturnValueOnce(successfulDeck('vocabulary'))
      .mockReturnValueOnce({ cards: [replacement], error: null })
    renderRoute('/practice/flashcards/vocabulary')
    fireEvent.click(screen.getByRole('button', { name: 'Tampilkan jawaban' }))
    fireEvent.click(screen.getByRole('button', { name: 'Good, tombol 3' }))

    fireEvent.click(screen.getByRole('button', { name: 'Mulai lagi' }))

    expect(createFlashcardDeck).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('heading', { name: '飲む' })).toHaveFocus()
    expect(screen.queryByText('minum')).not.toBeInTheDocument()
  })

  it('regenerates for a changed module parameter', () => {
    renderRoute('/practice/flashcards/vocabulary', { navigation: true })
    expect(screen.getByRole('heading', { name: '食べる' })).toBeVisible()

    fireEvent.click(screen.getByRole('link', { name: 'Buka Grammar' }))

    expect(createFlashcardDeck).toHaveBeenCalledTimes(2)
    expect(createFlashcardDeck).toHaveBeenLastCalledWith({ module: 'grammar' })
    expect(screen.getByRole('heading', { name: 'Grammar Flashcards', level: 1 })).toBeVisible()
    expect(screen.getByRole('heading', { name: '～たい' })).toBeVisible()
  })

  it('rejects an unknown module before deck generation', () => {
    renderRoute('/practice/flashcards/kana')

    expect(createFlashcardDeck).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'Deck tidak ditemukan' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Pilih deck Flashcards' }))
      .toHaveAttribute('href', '/practice/flashcards')
    expect(screen.getByRole('link', { name: 'Kembali ke Practice' }))
      .toHaveAttribute('href', '/practice')
  })

  it('recovers when the selected deck cannot be created', () => {
    createFlashcardDeck.mockReturnValue({ cards: [], error: 'unavailable' })
    renderRoute('/practice/flashcards/kanji')

    expect(screen.getByRole('heading', { name: 'Flashcard belum tersedia' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Pilih deck Flashcards' }))
      .toHaveAttribute('href', '/practice/flashcards')
    expect(screen.getByRole('link', { name: 'Kembali ke Practice' }))
      .toHaveAttribute('href', '/practice')
  })
})
