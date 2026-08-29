import { Link } from 'react-router-dom'
import EmptyState from '../../../components/feedback/EmptyState'

export default function QuizUnavailable({
  title = 'Quiz belum tersedia',
  description = 'Kembali ke Practice untuk memilih latihan lain.',
  backTo = '/practice',
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={(
        <Link
          to={backTo}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B9403C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Kembali ke Practice
        </Link>
      )}
    />
  )
}
