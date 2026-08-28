import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'

export default function NotFoundPage() {
  return (
    <div className="page-frame flex min-h-screen items-center">
      <Card className="w-full max-w-2xl">
        <p className="font-japanese text-6xl font-bold text-accent-soft" aria-hidden="true">迷</p>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-ink">Page not found</h1>
        <p className="mt-3 max-w-md leading-7 text-ink-muted">The study path you followed does not exist.</p>
        <Link
          to="/"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Back to dashboard
        </Link>
      </Card>
    </div>
  )
}
