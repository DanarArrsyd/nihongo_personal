import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import FlashcardSession from './FlashcardSession.jsx'
import FlashcardUnavailable from './components/FlashcardUnavailable.jsx'

const cards = [
  {
    id: 'flashcard-vocabulary-n5-vocab-001',
    source: { module: 'vocabulary', itemId: 'n5-vocab-001' },
    front: {
      eyebrow: 'Vocabulary',
      primary: { text: '食べる', lang: 'ja' },
      hint: 'Ingat bacaan dan artinya.',
    },
    back: {
      title: { text: 'たべる', lang: 'ja' },
      meaning: 'makan',
      details: [
        { label: 'Romaji', value: { text: 'taberu' } },
        { label: 'Jenis', value: { text: 'verb' } },
      ],
      example: {
        japanese: '私はパンを食べます。',
        reading: 'わたしはパンをたべます。',
        meaning: 'Saya makan roti.',
      },
    },
  },
  {
    id: 'flashcard-kanji-n5-kanji-001',
    source: { module: 'kanji', itemId: 'n5-kanji-001' },
    front: {
      eyebrow: 'Kanji',
      primary: { text: '飲', lang: 'ja' },
      hint: 'Ingat arti dan bacaannya.',
    },
    back: {
      title: { text: 'minum' },
      details: [
        { label: "On'yomi", value: { text: 'イン', lang: 'ja' } },
        { label: "Kun'yomi", value: { text: 'の.む', lang: 'ja' } },
      ],
    },
  },
]

function renderSession(props = {}) {
  return render(
    <FlashcardSession
      cards={cards}
      now={() => new Date('2026-08-30T12:00:00.000Z')}
      onRestart={() => cards}
      {...props}
    />,
  )
}

function reveal() {
  fireEvent.click(screen.getByRole('button', { name: 'Tampilkan jawaban' }))
}

function rate(label) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${label},`) }))
}

describe('FlashcardSession', () => {
  it('hides answer details until reveal', () => {
    renderSession()

    expect(screen.getByRole('heading', { name: '食べる' })).toBeVisible()
    expect(screen.queryByText('makan')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tampilkan jawaban' })).toBeVisible()
    expect(screen.getByRole('button', { name: /Again/ })).toBeDisabled()
  })

  it('reveals Japanese answer content and moves focus to it', () => {
    renderSession()
    reveal()

    const answer = screen.getByRole('heading', { name: 'たべる' })
    expect(answer).toHaveFocus()
    expect(answer).toHaveAttribute('lang', 'ja')
    expect(answer).toHaveClass('font-japanese')
    expect(screen.getByText('makan')).toBeVisible()
  })

  it.each([
    ['Again', 'again'],
    ['Hard', 'hard'],
    ['Good', 'good'],
    ['Easy', 'easy'],
  ])('records %s once and advances hidden to the next card', (label) => {
    renderSession()
    reveal()

    rate(label)

    expect(screen.getByRole('heading', { name: '飲' })).toHaveFocus()
    expect(screen.queryByText('minum')).not.toBeInTheDocument()
    expect(screen.getByText('Kartu 2 dari 2')).toBeVisible()
    expect(screen.getByRole('button', { name: /Again/ })).toBeDisabled()
  })

  it('locks a rating immediately so a double click records only one response', () => {
    const now = vi.fn(() => new Date('2026-08-30T12:00:00.000Z'))
    renderSession({ now })
    reveal()
    const goodButton = screen.getByRole('button', { name: 'Good, tombol 3' })

    fireEvent.click(goodButton)
    fireEvent.click(goodButton)

    expect(now).toHaveBeenCalledOnce()
    expect(screen.getByRole('heading', { name: '飲' })).toBeVisible()
  })

  it('shows exact rating distribution and one review item per response', () => {
    renderSession()
    reveal()
    rate('Again')
    reveal()
    rate('Easy')

    expect(screen.getByRole('heading', { name: 'Hasil flashcard' })).toBeVisible()
    const distribution = screen.getByRole('region', { name: 'Distribusi penilaian' })
    expect(within(distribution).getByLabelText('Again: 1')).toBeVisible()
    expect(within(distribution).getByLabelText('Hard: 0')).toBeVisible()
    expect(within(distribution).getByLabelText('Good: 0')).toBeVisible()
    expect(within(distribution).getByLabelText('Easy: 1')).toBeVisible()

    const review = screen.getByRole('region', { name: 'Kartu yang diselesaikan' })
    const items = within(review).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]).getByText('食べる')).toHaveAttribute('lang', 'ja')
    expect(within(items[0]).getByText('Again')).toHaveClass('text-ink')
    expect(within(items[1]).getByText('Easy')).toHaveClass('text-ink')
  })

  it('keeps result labels in ink and uses semantic icon colors', () => {
    renderSession()
    reveal()
    rate('Again')
    reveal()
    rate('Hard')

    const distribution = screen.getByRole('region', { name: 'Distribusi penilaian' })
    const again = within(distribution).getByLabelText('Again: 1')
    const hard = within(distribution).getByLabelText('Hard: 1')
    const good = within(distribution).getByLabelText('Good: 0')
    const easy = within(distribution).getByLabelText('Easy: 0')

    expect(within(again).getByText('Again')).toHaveClass('text-ink')
    expect(again.querySelector('svg')).toHaveClass('text-accent')
    expect(within(hard).getByText('Hard')).toHaveClass('text-ink')
    expect(hard.querySelector('svg')).toHaveClass('text-gold')
    expect(within(good).getByText('Good')).toHaveClass('text-ink')
    expect(good.querySelector('svg')).toHaveClass('text-blue-muted')
    expect(within(easy).getByText('Easy')).toHaveClass('text-ink')
    expect(easy.querySelector('svg')).toHaveClass('text-matcha')
  })

  it('restarts once with valid replacement cards and hides the new answer', () => {
    const replacement = [{
      id: 'flashcard-grammar-n5-grammar-001',
      source: { module: 'grammar', itemId: 'n5-grammar-001' },
      front: {
        eyebrow: 'Grammar',
        primary: { text: '～たい', lang: 'ja' },
        hint: 'Ingat arti dan polanya.',
      },
      back: {
        title: { text: 'ingin melakukan sesuatu' },
        details: [{ label: 'Struktur', value: { text: 'Verb stem + たい', lang: 'ja' } }],
      },
    }]
    const onRestart = vi.fn(() => replacement)
    renderSession({ onRestart })
    reveal()
    rate('Good')
    reveal()
    rate('Good')

    fireEvent.click(screen.getByRole('button', { name: 'Mulai lagi' }))

    expect(onRestart).toHaveBeenCalledOnce()
    expect(screen.getByRole('heading', { name: '～たい' })).toBeVisible()
    expect(screen.queryByText('ingin melakukan sesuatu')).not.toBeInTheDocument()
    expect(screen.getByText('Kartu 1 dari 1')).toBeVisible()

    reveal()
    expect(screen.getByRole('heading', { name: 'ingin melakukan sesuatu' })).toBeVisible()
  })

  it.each([
    ['meaning', {
      ...cards[0],
      back: { ...cards[0].back, meaning: { text: 'makan' } },
    }],
    ['example', {
      ...cards[0],
      back: {
        ...cards[0].back,
        example: {
          japanese: { text: '私はパンを食べます。' },
          reading: 'わたしはパンをたべます。',
          meaning: 'Saya makan roti.',
        },
      },
    }],
  ])('does not leave results when restart returns a malformed %s', (_label, malformedCard) => {
    const onRestart = vi.fn(() => [malformedCard])
    renderSession({ onRestart })
    reveal()
    rate('Good')
    reveal()
    rate('Good')

    fireEvent.click(screen.getByRole('button', { name: 'Mulai lagi' }))

    expect(onRestart).toHaveBeenCalledOnce()
    expect(screen.getByRole('heading', { name: 'Hasil flashcard' })).toBeVisible()
  })

  it('reveals a card when optional back content is omitted', () => {
    renderSession({ cards: [cards[1]] })

    reveal()

    expect(screen.getByRole('heading', { name: 'minum' })).toBeVisible()
    expect(screen.queryByRole('region', { name: 'Contoh kalimat' })).not.toBeInTheDocument()
  })

  it('uses Space only to reveal a hidden active card', () => {
    renderSession()

    expect(fireEvent.keyDown(document, { key: ' ', code: 'Space' })).toBe(false)
    expect(screen.getByRole('heading', { name: 'たべる' })).toHaveFocus()
    expect(fireEvent.keyDown(document, { key: ' ', code: 'Space' })).toBe(true)
    expect(screen.getByRole('heading', { name: '食べる' })).toBeVisible()
  })

  it.each([
    ['1', 'Again'],
    ['2', 'Hard'],
    ['3', 'Good'],
    ['4', 'Easy'],
  ])('uses shortcut %s for %s only after reveal', (key) => {
    renderSession()

    fireEvent.keyDown(document, { key })
    expect(screen.getByRole('heading', { name: '食べる' })).toBeVisible()
    fireEvent.keyDown(document, { key: ' ', code: 'Space' })
    fireEvent.keyDown(document, { key })

    expect(screen.getByRole('heading', { name: '飲' })).toHaveFocus()
  })

  it.each(['input', 'textarea', 'select', 'contenteditable']) (
    'ignores shortcuts from a %s target',
    (targetType) => {
      renderSession()
      reveal()
      const target = document.createElement(targetType === 'contenteditable' ? 'div' : targetType)
      if (targetType === 'contenteditable') target.setAttribute('contenteditable', 'true')
      document.body.append(target)
      target.focus()

      fireEvent.keyDown(target, { key: '1' })

      expect(screen.getByRole('heading', { name: 'たべる' })).toBeVisible()
      target.remove()
    },
  )

  it.each([
    ['empty', []],
    ['malformed', [{ id: 'broken-card' }]],
    ['unsupported-module', [{
      ...cards[0],
      source: { module: 'kana', itemId: 'hiragana:a' },
    }]],
    ['object-valued-meaning', [{
      ...cards[0],
      back: { ...cards[0].back, meaning: { text: 'makan' } },
    }]],
    ['malformed-example', [{
      ...cards[0],
      back: {
        ...cards[0].back,
        example: {
          japanese: '私はパンを食べます。',
          reading: null,
          meaning: 'Saya makan roti.',
        },
      },
    }]],
    ['malformed-details', [{
      ...cards[0],
      back: {
        ...cards[0].back,
        details: [{ label: 'Romaji', value: 'taberu' }],
      },
    }]],
  ])('renders recovery for an %s card set', (_label, invalidCards) => {
    renderSession({ cards: invalidCards })

    expect(screen.getByRole('heading', { name: 'Flashcard belum tersedia' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeVisible()
  })

  it('renders reusable unavailable actions without requiring routing context', () => {
    render(
      <FlashcardUnavailable
        title="Deck tidak ditemukan"
        description="Pilih deck flashcard yang tersedia."
        primaryAction={<button type="button">Pilih deck</button>}
        secondaryAction={<button type="button">Kembali ke Practice</button>}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Deck tidak ditemukan' })).toBeVisible()
    expect(screen.getByText('Pilih deck flashcard yang tersedia.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Pilih deck' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Kembali ke Practice' })).toBeVisible()
  })

  it('keeps controls touch-sized with visible focus styles', () => {
    renderSession()

    const revealButton = screen.getByRole('button', { name: 'Tampilkan jawaban' })
    const ratingButton = screen.getByRole('button', { name: 'Again, tombol 1' })
    expect(revealButton).toHaveClass('min-h-11')
    expect(revealButton.className).toContain('focus-visible:outline-2')
    expect(ratingButton).toHaveClass('min-h-11')
    expect(ratingButton.className).toContain('focus-visible:outline-2')
  })
})
