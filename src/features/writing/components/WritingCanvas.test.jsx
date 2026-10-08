import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import WritingCanvas from './WritingCanvas.jsx'

const referencePoints = [[
  { x: 10, y: 10 },
  { x: 30, y: 20 },
  { x: 50, y: 30 },
  { x: 70, y: 35 },
]]

describe('WritingCanvas', () => {
  it('accepts a pointer stroke and completes the character', () => {
    const onComplete = vi.fn()
    render(
      <WritingCanvas
        character="ノ"
        numbers={[{ x: 10, y: 12, value: 1 }]}
        onComplete={onComplete}
        referencePoints={referencePoints}
        strokes={['M10,10c20,10,40,20,60,25']}
      />,
    )

    const canvas = screen.getByRole('application', { name: 'Area latihan menulis ノ' })
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 109, height: 109 })

    fireEvent.pointerDown(canvas, { button: 0, clientX: 10, clientY: 10, pointerId: 1, pointerType: 'mouse' })
    fireEvent.pointerMove(canvas, { clientX: 30, clientY: 20, pointerId: 1, pointerType: 'mouse' })
    fireEvent.pointerMove(canvas, { clientX: 50, clientY: 30, pointerId: 1, pointerType: 'mouse' })
    fireEvent.pointerUp(canvas, { clientX: 70, clientY: 35, pointerId: 1, pointerType: 'mouse' })

    expect(screen.getByText('ノ selesai. Semua stroke sudah sesuai urutan.')).toBeVisible()
    expect(onComplete).toHaveBeenCalledWith({ attempts: 1 })
    expect(screen.getByRole('button', { name: 'Urungkan' })).toBeEnabled()
  })

  it('can hide the stroke guide and reset feedback', () => {
    render(
      <WritingCanvas
        character="ノ"
        numbers={[{ x: 10, y: 12, value: 1 }]}
        referencePoints={referencePoints}
        strokes={['M10,10c20,10,40,20,60,25']}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sembunyikan pola' }))
    expect(screen.getByRole('button', { name: 'Tampilkan pola' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Ulangi karakter' }))
    expect(screen.getByText('Papan dibersihkan. Mulai lagi dari stroke pertama.')).toBeVisible()
  })
})
