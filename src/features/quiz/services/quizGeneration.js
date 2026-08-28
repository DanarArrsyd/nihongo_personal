export function shuffle(items, rng = Math.random) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(rng() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled
}

export function sampleUnique(items, count, rng = Math.random) {
  if (items.length < count) return []
  return shuffle(items, rng).slice(0, count)
}

export function buildOptions(answerOption, distractorOptions, rng = Math.random) {
  const options = [answerOption, ...distractorOptions].filter((option, index, allOptions) => (
    allOptions.findIndex((candidate) => candidate.value === option.value) === index
  ))

  return shuffle(options, rng)
}
