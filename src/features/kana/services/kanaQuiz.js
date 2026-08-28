const supportedModes = new Set(['recognition', 'reverse', 'typing'])

function valueForMode(item, mode, target) {
  if (mode === 'reverse' && target === 'prompt') return item.romaji
  if (mode === 'reverse' && target === 'answer') return item.character
  if (target === 'prompt') return item.character
  return item.romaji
}

export function createKanaQuestion({ item, mode, distractors = [] }) {
  if (!supportedModes.has(mode)) {
    throw new RangeError(`Unsupported Kana practice mode: ${mode}`)
  }

  const answer = valueForMode(item, mode, 'answer')
  const options = mode === 'typing'
    ? []
    : [...new Set([answer, ...distractors.map((entry) => valueForMode(entry, mode, 'answer'))])]

  return {
    type: mode === 'typing' ? 'typing' : 'multiple_choice',
    mode,
    prompt: valueForMode(item, mode, 'prompt'),
    answer,
    options,
  }
}

export function checkKanaAnswer(question, answer) {
  if (typeof answer !== 'string') return false
  return answer.trim().toLocaleLowerCase() === question.answer.toLocaleLowerCase()
}

export function isSupportedPracticeMode(mode) {
  return supportedModes.has(mode)
}
