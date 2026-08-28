import { kanaCatalog } from '../../../data/kana/kanaCatalog'

const supportedScripts = new Set(['hiragana', 'katakana'])

function selectEntry(entry, script) {
  const [id, hiragana, katakana, romaji] = entry

  return {
    id,
    character: script === 'hiragana' ? hiragana : katakana,
    romaji,
  }
}

function selectGroup(group, script) {
  return {
    id: group.id,
    name: group.name,
    japaneseLabel: group.japaneseLabel,
    items: group.entries.map((entry) => selectEntry(entry, script)),
  }
}

export function getKanaGroups(script) {
  if (!supportedScripts.has(script)) return []
  return kanaCatalog.map((group) => selectGroup(group, script))
}

export function getKanaGroup(script, groupId) {
  const group = kanaCatalog.find((candidate) => candidate.id === groupId)
  if (!supportedScripts.has(script) || !group) return null
  return selectGroup(group, script)
}

export function getAllKana(script) {
  return getKanaGroups(script).flatMap((group) => group.items)
}

export function isSupportedScript(script) {
  return supportedScripts.has(script)
}
