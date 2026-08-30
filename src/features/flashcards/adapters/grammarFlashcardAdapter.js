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

export function createGrammarFlashcard(item) {
  if (!hasText(item?.id) || !hasText(item.pattern) || !hasText(item.meaning)) return null

  const details = [
    hasText(item.structure) && { label: 'Struktur', value: { text: item.structure } },
    hasText(item.explanation) && { label: 'Penjelasan', value: { text: item.explanation } },
  ].filter(Boolean)
  const example = getExample(item.examples)

  return {
    id: `flashcard-grammar-${item.id}`,
    source: { module: 'grammar', itemId: item.id },
    front: {
      eyebrow: 'Grammar',
      primary: { text: item.pattern, lang: 'ja' },
      hint: 'Ingat arti dan polanya.',
    },
    back: {
      title: { text: item.meaning },
      details,
      ...(example && { example }),
    },
  }
}
