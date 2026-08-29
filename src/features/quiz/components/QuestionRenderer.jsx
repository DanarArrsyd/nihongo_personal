import ChoiceQuestion from './ChoiceQuestion'
import QuizUnavailable from './QuizUnavailable'
import RecognitionQuestion from './RecognitionQuestion'
import SentenceCompletionQuestion from './SentenceCompletionQuestion'
import TypingQuestion from './TypingQuestion'

export default function QuestionRenderer(props) {
  const { question } = props

  switch (question?.type) {
    case 'multiple_choice':
    case 'reverse_multiple_choice':
      return <ChoiceQuestion {...props} />
    case 'typing':
      return <TypingQuestion key={question.id} {...props} />
    case 'recognition':
      return <RecognitionQuestion {...props} />
    case 'sentence_completion':
      return <SentenceCompletionQuestion {...props} />
    default:
      return <QuizUnavailable title="Tipe soal tidak didukung" />
  }
}
