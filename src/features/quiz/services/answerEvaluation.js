export function normalizeAnswer(value) {
  return typeof value === 'string'
    ? value.normalize('NFKC').trim().toLocaleLowerCase()
    : value
}

export function evaluateAnswer(question, userAnswer) {
  const answer = question?.answer
  if (!answer) return false
  const accepted = answer.acceptedValues ?? [answer.value]
  if (typeof answer.value === 'boolean') {
    return typeof userAnswer === 'boolean' && userAnswer === answer.value
  }
  const normalizedUserAnswer = normalizeAnswer(userAnswer)
  return accepted.some((value) => normalizeAnswer(value) === normalizedUserAnswer)
}
