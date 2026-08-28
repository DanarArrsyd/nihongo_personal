import { afterEach, describe, expect, it, vi } from 'vitest'
import { speakJapanese } from './speech'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Japanese pronunciation', () => {
  it('speaks text with the ja-JP language', () => {
    class FakeUtterance {
      constructor(text) {
        this.text = text
      }
    }
    const spoken = []
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak: (utterance) => spoken.push(utterance) })

    expect(speakJapanese('あ')).toEqual({ ok: true })
    expect(spoken).toHaveLength(1)
    expect(spoken[0]).toMatchObject({ text: 'あ', lang: 'ja-JP', rate: 0.85 })
  })

  it('returns a clear failure when speech synthesis is unavailable', () => {
    vi.stubGlobal('SpeechSynthesisUtterance', undefined)
    vi.stubGlobal('speechSynthesis', undefined)

    expect(speakJapanese('あ')).toEqual({
      ok: false,
      message: 'Japanese pronunciation is not available in this browser.',
    })
  })
})
