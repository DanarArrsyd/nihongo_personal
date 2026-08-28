import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'

function renderRoute(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('Grammar learning', () => {
  it('opens Grammar from Learn', () => {
    renderRoute('/learn')

    expect(screen.getByRole('link', { name: 'Study Grammar' })).toHaveAttribute(
      'href',
      '/learn/grammar',
    )
  })

  it('shows the 12-pattern Grammar index', () => {
    renderRoute('/learn/grammar')

    expect(screen.getByRole('heading', { name: 'Grammar', level: 1 })).toBeVisible()
    expect(screen.getByText('12 patterns')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Study ～です — adalah; menyatakan identitas atau keadaan dengan sopan' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Study ～たいです — ingin melakukan sesuatu' })).toBeVisible()
  })

  it('filters the curriculum by JLPT level', () => {
    renderRoute('/learn/grammar')

    fireEvent.change(screen.getByRole('combobox', { name: 'JLPT level' }), {
      target: { value: 'N5' },
    })

    expect(screen.getAllByRole('link', { name: /^Study / })).toHaveLength(12)
  })
})
