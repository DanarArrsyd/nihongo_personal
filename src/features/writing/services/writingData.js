import { kanaStrokeCatalog } from '../../../data/writing/kanaStrokes.js'

const supportedScripts = new Set(['hiragana', 'katakana'])

export function getWritingKana(script) {
  if (!supportedScripts.has(script)) return []
  return kanaStrokeCatalog.filter((entry) => entry.script === script)
}

export function getWritingKanaById(script, kanaId) {
  return getWritingKana(script).find((entry) => entry.id === kanaId) ?? null
}

export function isSupportedWritingScript(script) {
  return supportedScripts.has(script)
}
