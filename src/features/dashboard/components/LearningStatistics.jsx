import { BookOpenText, Languages, LibraryBig, RotateCcw } from 'lucide-react'
import Card from '../../../components/ui/Card'
import SectionHeading from './SectionHeading'

const statisticMeta = {
  vocabulary: { icon: Languages, color: 'text-accent', background: 'bg-accent-soft' },
  kanji: { icon: LibraryBig, color: 'text-matcha', background: 'bg-matcha-soft' },
  grammar: { icon: BookOpenText, color: 'text-gold', background: 'bg-[#F2E7D8]' },
  reviews: { icon: RotateCcw, color: 'text-blue-muted', background: 'bg-[#E4EAEE]' },
}

export default function LearningStatistics({ statistics }) {
  return (
    <Card aria-label="Learning statistics" className="h-full">
      <SectionHeading eyebrow="Study record" title="Learning statistics" />
      <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
        {statistics.map((statistic) => {
          const { background, color, icon: Icon } = statisticMeta[statistic.id]

          return (
            <li key={statistic.id} className="min-h-32 bg-surface p-4 sm:p-5">
              <span className={`grid size-8 place-items-center rounded-lg ${background} ${color}`}>
                <Icon aria-hidden="true" size={16} strokeWidth={1.9} />
              </span>
              <p className="mt-5 text-2xl font-semibold tracking-[-0.04em] tabular-nums text-ink">{statistic.value}</p>
              <p className="mt-1 text-xs leading-5 text-ink-muted">{statistic.label}</p>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
