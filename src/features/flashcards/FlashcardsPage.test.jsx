import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import FlashcardsPage from './FlashcardsPage.jsx'

describe('FlashcardsPage', () => {
  it('offers exactly the three supported module decks', () => {
    render(
      <MemoryRouter>
        <FlashcardsPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Flashcards', level: 1 })).toBeVisible()
    expect(screen.getByRole('link', { name: /Vocabulary/ }))
      .toHaveAttribute('href', '/practice/flashcards/vocabulary')
    expect(screen.getByRole('link', { name: /Kanji/ }))
      .toHaveAttribute('href', '/practice/flashcards/kanji')
    expect(screen.getByRole('link', { name: /Grammar/ }))
      .toHaveAttribute('href', '/practice/flashcards/grammar')
    expect(screen.getAllByRole('link')).toHaveLength(4)
  })
})
