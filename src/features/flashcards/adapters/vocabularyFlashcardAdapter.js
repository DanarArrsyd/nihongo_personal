function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function getExample(examples) {
  if (!Array.isArray(examples)) return null

  return examples.find((example) => (
    hasText(example?.japanese)
    && hasText(example.reading)
    && hasText(example.meaning)
  )) ?? null
}

export function createVocabularyFlashcard(item) {
  if (!hasText(item?.id) || !hasText(item.word) || !hasText(item.reading) || !hasText(item.meaning)) {
    return null
  }

  const details = [
    hasText(item.romaji) && { label: 'Romaji', value: { text: item.romaji } },
    hasText(item.type) && { label: 'Jenis', value: { text: item.type } },
  ].filter(Boolean)
  const example = getExample(item.examples)

  return {
    id: `flashcard-vocabulary-${item.id}`,
    source: { module: 'vocabulary', itemId: item.id },
    front: {
      eyebrow: 'Vocabulary',
      primary: { text: item.word, lang: 'ja' },
      hint: 'Ingat bacaan dan artinya.',
    },
    back: {
      title: { text: item.reading, lang: 'ja' },
      meaning: item.meaning,
      details,
      ...(example && { example }),
    },
  }
}
