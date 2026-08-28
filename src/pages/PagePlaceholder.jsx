import { ArrowRight } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'

export default function PagePlaceholder({ description, index, japanese, title }) {
  return (
    <div className="page-frame">
      <header className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="accent">Workspace {index}</Badge>
          <span className="h-px w-10 bg-border" aria-hidden="true" />
          <span className="font-japanese text-sm font-medium text-ink-muted">{japanese}</span>
        </div>
        <h1 className="mt-7 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">{description}</p>
      </header>

      <Card className="relative mt-10 min-h-72 overflow-hidden sm:mt-14 sm:min-h-80">
        <div className="absolute inset-y-0 right-0 hidden w-2/5 border-l border-border bg-paper-deep/65 sm:block" aria-hidden="true">
          <span className="absolute right-10 top-9 font-japanese text-[6rem] font-bold leading-none text-border/55">{japanese.slice(0, 1)}</span>
          <span className="absolute bottom-9 right-10 h-px w-24 bg-accent/45" />
        </div>
        <div className="relative z-10 flex min-h-60 max-w-md flex-col justify-end sm:min-h-68">
          <p className="text-[0.68rem] font-bold tracking-[0.18em] text-ink-muted uppercase">Space prepared</p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-ink">Ready for focused study</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            This section is intentionally quiet until its learning tools are added in the next milestones.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-accent">
            <span>Structure in place</span>
            <ArrowRight aria-hidden="true" size={16} />
          </div>
        </div>
      </Card>
    </div>
  )
}
