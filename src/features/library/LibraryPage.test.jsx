import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'

import LibraryPage from './LibraryPage'
import { getFavoriteKey } from './services/libraryCatalog'

function useReadyFavorites() {
  const [favoriteKeys, setFavoriteKeys] = useState(new Set())

  return {
    favoriteKeys,
    retry: vi.fn(),
    status: 'ready',
    toggleFavorite(itemType, itemId) {
      const key = getFavoriteKey(itemType, itemId)
      setFavoriteKeys((current) => {
        const next = new Set(current)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
    },
  }
}

function renderPage(useFavorites = useReadyFavorites) {
  return render(
    <MemoryRouter>
      <LibraryPage useFavorites={useFavorites} />
    </MemoryRouter>,
  )
}

describe('LibraryPage', () => {
  it('searches Japanese learning content by romaji and resets the result', () => {
    renderPage()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Cari referensi' }), {
      target: { value: 'taberu' },
    })

    expect(screen.getByRole('heading', { name: '食べる' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: '飲む' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset pencarian' }))
    expect(screen.getByRole('heading', { name: '飲む' })).toBeVisible()
  })

  it('filters by content type and current favorites', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Kanji' }))
    expect(screen.getByRole('heading', { name: '食' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: '食べる' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Semua' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tambahkan 食べる ke favorit' }))
    fireEvent.click(screen.getByRole('button', { name: /Favorit saja/ }))

    expect(screen.getByRole('heading', { name: '食べる' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: '飲む' })).not.toBeInTheDocument()
  })

  it('shows a retry action when favorites cannot be loaded', () => {
    const retry = vi.fn()
    renderPage(() => ({ favoriteKeys: new Set(), retry, status: 'error', toggleFavorite: vi.fn() }))

    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
