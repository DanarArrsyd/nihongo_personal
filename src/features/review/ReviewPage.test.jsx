import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import PersistenceProvider from '../persistence/PersistenceProvider.jsx'
import ReviewPage from './ReviewPage.jsx'

function renderPage(loadReviews) {
  return render(
    <MemoryRouter>
      <PersistenceProvider>
        <ReviewPage
          loadReviews={loadReviews}
          now={() => new Date('2026-10-04T10:00:00.000Z')}
        />
      </PersistenceProvider>
    </MemoryRouter>,
  )
}

describe('ReviewPage', () => {
  it('shows an empty state when no review is due', async () => {
    renderPage(vi.fn().mockResolvedValue([]))

    expect(await screen.findByRole('heading', { name: 'Review hari ini selesai' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Buka Practice' })).toHaveAttribute('href', '/practice')
  })

  it('shows due totals and starts a mixed review session', async () => {
    renderPage(vi.fn().mockResolvedValue([
      { itemType: 'vocabulary', itemId: 'n5-vocab-001' },
      { itemType: 'kana', itemId: 'hiragana:a' },
    ]))

    expect(await screen.findByText('2 kartu menunggu')).toBeVisible()
    const summary = screen.getByRole('region', { name: 'Ringkasan review' })
    expect(summary).toHaveTextContent('Vocabulary1')
    expect(summary).toHaveTextContent('Kana1')

    fireEvent.click(screen.getByRole('button', { name: 'Mulai review' }))

    expect(screen.getByRole('region', { name: 'Sesi flashcard' })).toBeVisible()
    expect(screen.getByRole('heading', { name: '食べる' })).toBeVisible()
  })

  it('offers a retry after local storage fails', async () => {
    const loadReviews = vi.fn()
      .mockRejectedValueOnce(new Error('database failed'))
      .mockResolvedValueOnce([])
    renderPage(loadReviews)

    expect(await screen.findByRole('heading', { name: 'Antrean review belum dapat dimuat' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }))

    await waitFor(() => expect(loadReviews).toHaveBeenCalledTimes(2))
    expect(await screen.findByRole('heading', { name: 'Review hari ini selesai' })).toBeVisible()
  })
})

