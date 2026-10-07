import { act, fireEvent, render, screen } from '@testing-library/react'

import PwaStatus from './PwaStatus'

function createRegistration({ needRefresh = false, offlineReady = false } = {}) {
  const setNeedRefresh = vi.fn()
  const setOfflineReady = vi.fn()
  const updateServiceWorker = vi.fn()

  return {
    hook: () => ({
      needRefresh: [needRefresh, setNeedRefresh],
      offlineReady: [offlineReady, setOfflineReady],
      updateServiceWorker,
    }),
    setNeedRefresh,
    setOfflineReady,
    updateServiceWorker,
  }
}

describe('PwaStatus', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
  })

  it('offers a user-controlled service worker update', () => {
    const registration = createRegistration({ needRefresh: true })
    render(<PwaStatus useRegistration={registration.hook} />)

    expect(screen.getByText('Pembaruan tersedia')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Perbarui sekarang' }))
    expect(registration.updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('announces offline readiness and can dismiss the notice', () => {
    const registration = createRegistration({ offlineReady: true })
    render(<PwaStatus useRegistration={registration.hook} />)

    expect(screen.getByText('Siap digunakan offline')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Tutup status PWA' }))
    expect(registration.setOfflineReady).toHaveBeenCalledWith(false)
  })

  it('reports network loss without offering a dismiss action', () => {
    const registration = createRegistration()
    render(<PwaStatus useRegistration={registration.hook} />)

    act(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
      window.dispatchEvent(new Event('offline'))
    })

    expect(screen.getByText('Kamu sedang offline')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Tutup status PWA' })).not.toBeInTheDocument()
  })
})
