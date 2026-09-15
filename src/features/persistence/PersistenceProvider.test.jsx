import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import PersistenceNotice from './PersistenceNotice'
import PersistenceProvider from './PersistenceProvider'
import { usePersistenceStatus } from './PersistenceContext'

const warningMessage = 'Penyimpanan lokal sedang bermasalah. Perubahan sesi ini mungkin tidak tersimpan setelah aplikasi ditutup.'

function PersistenceControls({ failure }) {
  const { reportFailure } = usePersistenceStatus()
  const [count, setCount] = useState(0)

  return (
    <>
      <button type="button" onClick={() => reportFailure(failure)}>
        Simulate storage failure
      </button>
      <button type="button" onClick={() => setCount((current) => current + 1)}>
        Continue studying ({count})
      </button>
    </>
  )
}

describe('PersistenceProvider', () => {
  it('reports and dismisses a storage warning without blocking children', () => {
    const error = new Error('blocked')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <PersistenceProvider>
        <PersistenceNotice />
        <PersistenceControls failure={error} />
      </PersistenceProvider>,
    )

    const continueStudying = screen.getByRole('button', { name: /Continue studying/ })
    fireEvent.click(continueStudying)
    expect(continueStudying).toHaveTextContent('Continue studying (1)')

    fireEvent.click(screen.getByRole('button', { name: 'Simulate storage failure' }))
    expect(screen.getByRole('status')).toHaveTextContent(warningMessage)
    expect(consoleError).toHaveBeenCalledWith(error)

    fireEvent.click(continueStudying)
    expect(continueStudying).toHaveTextContent('Continue studying (2)')

    fireEvent.click(screen.getByRole('button', { name: 'Tutup peringatan penyimpanan' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    fireEvent.click(continueStudying)
    expect(continueStudying).toHaveTextContent('Continue studying (3)')

    consoleError.mockRestore()
  })
})
