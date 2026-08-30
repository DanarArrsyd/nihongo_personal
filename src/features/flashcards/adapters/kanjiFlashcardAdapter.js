function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function joinReadings(readings) {
  if (!Array.isArray(readings)) return ''

  return readings.filter(hasText).join('、')
}

function joinMeanings(meanings) {
  if (!Array.isArray(meanings)) return ''

  return meanings.filter(hasText).join(', ')
}

export function createKanjiFlashcard(item) {
  const meanings = joinMeanings(item?.meaning)
  if (!hasText(item?.id) || !hasText(item.kanji) || !meanings) return null

  const onyomi = joinReadings(item.onyomi)
  const kunyomi = joinReadings(item.kunyomi)
  const details = [
    onyomi && { label: "On'yomi", value: { text: onyomi, lang: 'ja' } },
    kunyomi && { label: "Kun'yomi", value: { text: kunyomi, lang: 'ja' } },
    Number.isFinite(item.strokes) && item.strokes >= 0
      && { label: 'Jumlah goresan', value: { text: String(item.strokes) } },
    hasText(item.jlpt) && { label: 'JLPT', value: { text: item.jlpt } },
  ].filter(Boolean)

  return {
    id: `flashcard-kanji-${item.id}`,
    source: { module: 'kanji', itemId: item.id },
    front: {
      eyebrow: 'Kanji',
      primary: { text: item.kanji, lang: 'ja' },
      hint: 'Ingat arti dan bacaannya.',
    },
    back: {
      title: { text: meanings },
      details,
    },
  }
}
