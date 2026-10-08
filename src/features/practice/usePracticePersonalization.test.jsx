import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import PersistenceProvider from '../persistence/PersistenceProvider.jsx'
import usePracticePersonalization from './usePracticePersonalization.js'

const wrapper = ({ children }) => <PersistenceProvider>{children}</PersistenceProvider>

describe('usePracticePersonalization', () => {
  it('loads progress and recent history for smart selection', async () => {
    const progress = [{ itemType: 'kanji', itemId: 'water', incorrectCount: 2 }]
    const history = [{ itemType: 'kana', itemId: 'hiragana:a' }]
    const repositories = {
      listAllProgress: vi.fn().mockResolvedValue(progress),
      listQuizHistory: vi.fn().mockResolvedValue(history),
    }
    const { result } = renderHook(() => usePracticePersonalization(repositories), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current).toEqual({ progress, history, isLoading: false })
  })

  it('falls back to an empty profile when local storage cannot be read', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const repositories = {
      listAllProgress: vi.fn().mockRejectedValue(new Error('storage unavailable')),
      listQuizHistory: vi.fn().mockResolvedValue([]),
    }
    const { result } = renderHook(() => usePracticePersonalization(repositories), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current).toEqual({ progress: [], history: [], isLoading: false })
    consoleError.mockRestore()
  })
})
