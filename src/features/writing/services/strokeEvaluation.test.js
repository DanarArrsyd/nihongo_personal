import { evaluateStroke, getPolylineLength, resamplePolyline } from './strokeEvaluation.js'

const reference = [
  { x: 10, y: 10 },
  { x: 30, y: 20 },
  { x: 50, y: 30 },
  { x: 70, y: 35 },
]

describe('strokeEvaluation', () => {
  it('measures and resamples a drawn polyline', () => {
    expect(getPolylineLength([{ x: 0, y: 0 }, { x: 3, y: 4 }])).toBe(5)
    expect(resamplePolyline(reference, 5)).toHaveLength(5)
    expect(resamplePolyline(reference, 5)[0]).toEqual(reference[0])
    expect(resamplePolyline(reference, 5).at(-1)).toEqual(reference.at(-1))
  })

  it('accepts a close stroke drawn in the expected direction', () => {
    expect(evaluateStroke([
      { x: 11, y: 11 },
      { x: 31, y: 21 },
      { x: 51, y: 30 },
      { x: 69, y: 36 },
    ], reference)).toMatchObject({ accepted: true, code: 'accepted' })
  })

  it('rejects reversed, short, and off-path strokes with useful feedback', () => {
    expect(evaluateStroke([...reference].reverse(), reference)).toMatchObject({ accepted: false, code: 'wrong-start' })
    expect(evaluateStroke([{ x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 }], reference))
      .toMatchObject({ accepted: false, code: 'too-short' })
    expect(evaluateStroke([
      { x: 10, y: 10 },
      { x: 30, y: 70 },
      { x: 50, y: 80 },
      { x: 70, y: 35 },
    ], reference)).toMatchObject({ accepted: false, code: 'off-path' })
  })
})
