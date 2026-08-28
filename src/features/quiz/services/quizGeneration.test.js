import { describe, expect, it } from 'vitest'

import { buildOptions, sampleUnique, shuffle } from './quizGeneration.js'

describe('quiz generation helpers', () => {
  it('shuffles a copy using the supplied random-number generator', () => {
    const source = ['a', 'b', 'c', 'd']

    expect(shuffle(source, () => 0)).toEqual(['b', 'c', 'd', 'a'])
    expect(source).toEqual(['a', 'b', 'c', 'd'])
  })

  it('samples unique entries only when the pool can satisfy the requested count', () => {
    const source = ['a', 'b', 'c', 'd']

    expect(sampleUnique(source, 2, () => 0)).toEqual(['b', 'c'])
    expect(sampleUnique(source, 5, () => 0)).toEqual([])
    expect(source).toEqual(['a', 'b', 'c', 'd'])
  })

  it('keeps the answer and removes duplicate option values before shuffling', () => {
    const options = buildOptions(
      { value: 'a', label: 'a' },
      [{ value: 'i', label: 'i' }, { value: 'a', label: 'duplicate' }],
      () => 0,
    )

    expect(options).toEqual([
      { value: 'i', label: 'i' },
      { value: 'a', label: 'a' },
    ])
  })
})
