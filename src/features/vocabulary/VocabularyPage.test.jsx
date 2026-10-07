import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'
import PersistenceProvider from '../persistence/PersistenceProvider'

vi.mock('../../db/progressRepository', () => ({
  listAllProgress: () => Promise.resolve([]),
  listProgress: () => Promise.resolve([]),
  setProgressStatus: () => Promise.resolve(),
}))

vi.mock('../../db/favoritesRepository', () => ({
  listFavorites: () => Promise.resolve([]),
  setFavorite: () => Promise.resolve(),
}))

async function renderRoute(path) {
  const view = render(
    <MemoryRouter initialEntries={[path]}>
      <PersistenceProvider>
        <App />
      </PersistenceProvider>
    </MemoryRouter>,
  )

  const loadingState = screen.queryByTestId('loading-skeletons')
  if (loadingState) await waitForElementToBeRemoved(loadingState)

  return view
}

describe('Vocabulary learning', () => {
  it('opens Vocabulary from Learn', async () => {
    await renderRoute('/learn')

    expect(screen.getByRole('link', { name: 'Study Vocabulary' })).toHaveAttribute(
      'href',
      '/learn/vocabulary',
    )
  })

  it('shows the N5 vocabulary index', async () => {
    await renderRoute('/learn/vocabulary')

    expect(screen.getByRole('heading', { name: 'Vocabulary', level: 1 })).toBeVisible()
    expect(screen.getByText('30 words')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Study 食べる' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Study 元気' })).toBeVisible()
  })

  it.each(['食べ', 'たべ', 'TABERU', 'makan'])(
    'searches vocabulary using %s',
    async (query) => {
      await renderRoute('/learn/vocabulary')

      fireEvent.change(screen.getByRole('searchbox', { name: 'Search vocabulary' }), {
        target: { value: query },
      })

      expect(screen.getByRole('link', { name: 'Study 食べる' })).toBeVisible()
      expect(screen.queryByRole('link', { name: 'Study 飲む' })).not.toBeInTheDocument()
    },
  )

  it('filters vocabulary by word type', async () => {
    await renderRoute('/learn/vocabulary')

    fireEvent.change(screen.getByRole('combobox', { name: 'Word type' }), {
      target: { value: 'adjective' },
    })

    expect(screen.getByText('4 words')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Study 大きい' })).toBeVisible()
    expect(screen.queryByRole('link', { name: 'Study 食べる' })).not.toBeInTheDocument()
  })

  it('recovers from an empty search', async () => {
    await renderRoute('/learn/vocabulary')

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search vocabulary' }), {
      target: { value: 'tidak-ada' },
    })

    expect(screen.getByRole('heading', { name: 'No vocabulary found' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByText('30 words')).toBeVisible()
  })

  it('shows vocabulary detail and example sentence', async () => {
    await renderRoute('/learn/vocabulary/n5-vocab-001')

    expect(screen.getByRole('heading', { name: '食べる', level: 1 })).toBeVisible()
    expect(screen.getByText('たべる')).toBeVisible()
    expect(screen.getByText('taberu')).toBeVisible()
    expect(screen.getByText('makan')).toBeVisible()
    expect(screen.getByText('私はパンを食べます。')).toBeVisible()
    expect(screen.getByText('Saya makan roti.')).toBeVisible()
  })

  it('keeps favorite and learning status during route navigation', async () => {
    await renderRoute('/learn/vocabulary/n5-vocab-001')

    fireEvent.click(screen.getByRole('button', { name: 'Add 食べる to favorites' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Learning status' }), {
      target: { value: 'learning' },
    })
    fireEvent.click(screen.getByRole('link', { name: 'Back to Vocabulary' }))
    fireEvent.click(screen.getByRole('link', { name: 'Study 食べる' }))

    expect(screen.getByRole('button', { name: 'Remove 食べる from favorites' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('combobox', { name: 'Learning status' })).toHaveValue('learning')
  })

  it('shows pronunciation fallback without browser speech support', async () => {
    await renderRoute('/learn/vocabulary/n5-vocab-001')

    fireEvent.click(screen.getByRole('button', { name: 'Pronounce 食べる' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Japanese pronunciation is not available in this browser.',
    )
  })

  it('shows safe recovery for an invalid vocabulary ID', async () => {
    await renderRoute('/learn/vocabulary/not-real')

    expect(screen.getByRole('heading', { name: 'Vocabulary not found' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Back to Vocabulary' })).toHaveAttribute(
      'href',
      '/learn/vocabulary',
    )
  })
})
