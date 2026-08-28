const unavailableMessage = 'Japanese pronunciation is not available in this browser.'

export function speakJapanese(text) {
  const engine = globalThis.speechSynthesis
  const Utterance = globalThis.SpeechSynthesisUtterance

  if (!engine || typeof engine.speak !== 'function' || typeof Utterance !== 'function') {
    return { ok: false, message: unavailableMessage }
  }

  try {
    const utterance = new Utterance(text)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.85
    engine.cancel?.()
    engine.speak(utterance)
    return { ok: true }
  } catch {
    return { ok: false, message: unavailableMessage }
  }
}
