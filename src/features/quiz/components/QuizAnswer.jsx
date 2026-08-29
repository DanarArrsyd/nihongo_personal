const japaneseCharacterPattern = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u

function findAnswerOption(question, value) {
  return question.options?.find((option) => Object.is(option.value, value))
}

export default function QuizAnswer({ question, value }) {
  if (typeof value === 'boolean') return value ? 'Benar' : 'Salah'

  const option = findAnswerOption(question, value)
  const text = String(option?.label ?? value)
  const language = option?.lang ?? (japaneseCharacterPattern.test(text) ? 'ja' : undefined)

  if (language !== 'ja') return text

  return (
    <span lang="ja" className="font-japanese">
      {text}
    </span>
  )
}
