import { act, renderHook, waitFor } from '@testing-library/react'

import PersistenceProvider from '../persistence/PersistenceProvider'
import useLibraryFavorites from './useLibraryFavorites'
import { getFavoriteKey } from './services/libraryCatalog'

describe('useLibraryFavorites', () => {
  it('hydrates every supported item type and persists toggles', async () => {
    const favoritesStore = {
      listFavorites: vi.fn(async (itemType) => (
        itemType === 'kanji' ? [{ itemId: 'kanji-1', itemType: 'kanji' }] : []
      )),
      setFavorite: vi.fn(async ({ favorite }) => favorite),
    }
    const wrapper = ({ children }) => <PersistenceProvider>{children}</PersistenceProvider>
    const { result } = renderHook(
      () => useLibraryFavorites({ favoritesStore }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(favoritesStore.listFavorites).toHaveBeenCalledTimes(3)
    expect(result.current.favoriteKeys).toContain(getFavoriteKey('kanji', 'kanji-1'))

    act(() => result.current.toggleFavorite('vocabulary', 'vocab-1'))

    expect(result.current.favoriteKeys).toContain(getFavoriteKey('vocabulary', 'vocab-1'))
    await waitFor(() => expect(favoritesStore.setFavorite).toHaveBeenCalledWith(
      expect.objectContaining({
        favorite: true,
        itemId: 'vocab-1',
        itemType: 'vocabulary',
      }),
    ))
  })
})
