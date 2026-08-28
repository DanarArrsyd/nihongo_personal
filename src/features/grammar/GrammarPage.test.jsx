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

  it('shows Grammar details, examples, and related links', () => {
    renderRoute('/learn/grammar/n5-grammar-012')

    expect(screen.getByRole('heading', { name: '～たいです', level: 1 })).toBeVisible()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getByText('Verb stem')).toBeVisible()
    expect(screen.getByRole('group', { name: 'Verb stem + たいです' })).toBeVisible()
    expect(screen.getByText('ingin melakukan sesuatu')).toBeVisible()
    expect(screen.getByText('寿司を食べたいです。')).toBeVisible()
    expect(screen.getByText('すしをたべたいです。')).toBeVisible()
    expect(screen.getByText('Saya ingin makan sushi.')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Open grammar ～を' })).toHaveAttribute(
      'href',
      '/learn/grammar/n5-grammar-006',
    )
  })

  it('marks Japanese formula segments with Japanese language metadata', () => {
    renderRoute('/learn/grammar/n5-grammar-002')

    expect(screen.getByRole('group', { name: 'Noun + ではありません' })).toBeVisible()
    expect(screen.getByText('ではありません')).toHaveAttribute('lang', 'ja')
    expect(screen.getByText('ではありません')).toHaveClass('font-japanese')
  })

  it('shows safe recovery for an invalid Grammar ID', () => {
    renderRoute('/learn/grammar/not-real')

    expect(screen.getByRole('heading', { name: 'Pola grammar tidak ditemukan' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Kembali ke Grammar' })).toHaveAttribute(
      'href',
      '/learn/grammar',
    )
  })
})
