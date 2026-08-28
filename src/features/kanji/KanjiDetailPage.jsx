import { ArrowLeft, BookOpenText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import RelatedVocabulary from './components/RelatedVocabulary'
import { getKanjiById, getRelatedVocabulary } from './services/kanjiData'

function ReadingList({ items }) {
  if (items.length === 0) return <span aria-label="No reading">—</span>

  return (
    <span lang="ja" className="font-japanese">
      {items.join(' ・ ')}
    </span>
  )
}

export default function KanjiDetailPage() {
  const { kanjiId } = useParams()
  const item = getKanjiById(kanjiId)

  if (!item) {
    return (
      <div className="page-frame">
        <p className="text-sm font-semibold tracking-[0.14em] text-accent uppercase">404 / Kanji</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-ink">
          Kanji not found
        </h1>
        <p className="mt-4 max-w-md leading-7 text-ink-muted">
          This character is not part of the current beginner seed set.
        </p>
        <Link
          to="/learn/kanji"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={17} aria-hidden="true" /> Back to Kanji
        </Link>
      </div>
    )
  }

  const relatedVocabulary = getRelatedVocabulary(item)

  return (
    <div className="page-frame max-w-7xl">
      <Link
        to="/learn/kanji"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Back to Kanji
      </Link>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)]">
        <Card className="overflow-hidden p-0 sm:p-0">
          <div className="kanji-specimen-grid relative grid min-h-80 place-items-center sm:min-h-[30rem]">
            <div className="absolute top-5 left-5">
              <Badge variant="accent">{item.jlpt} seed</Badge>
            </div>
            <h1
              lang="ja"
              className="font-japanese text-[9rem] font-medium leading-none text-ink sm:text-[13rem]"
            >
              {item.kanji}
            </h1>
            <span className="absolute right-0 bottom-0 border-t border-l border-border bg-surface/95 px-4 py-2.5 text-xs font-bold tracking-[0.12em] text-ink-muted uppercase">
              {item.strokes} strokes
            </span>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 sm:p-8">
            <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">
              Character record
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Readings shown here prioritize this beginner seed set.
            </p>

            <dl className="mt-7 divide-y divide-border border-y border-border">
              <div className="grid gap-2 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline">
                <dt className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">Meaning</dt>
                <dd className="text-2xl font-semibold tracking-[-0.02em] text-ink">
                  {item.meaning.join(', ')}
                </dd>
              </div>
              <div className="grid gap-2 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline">
                <dt className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">On'yomi</dt>
                <dd className="text-lg font-medium text-ink">
                  <ReadingList items={item.onyomi} />
                </dd>
              </div>
              <div className="grid gap-2 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline">
                <dt className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">Kun'yomi</dt>
                <dd className="text-lg font-medium text-ink">
                  <ReadingList items={item.kunyomi} />
                </dd>
              </div>
              <div className="grid gap-2 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline">
                <dt className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">Level</dt>
                <dd className="font-semibold text-ink">JLPT {item.jlpt} curated seed</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-matcha-soft text-matcha">
                <BookOpenText size={19} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">
                  Word connections
                </p>
                <h2 className="mt-0.5 text-xl font-semibold tracking-[-0.025em] text-ink">
                  Related vocabulary
                </h2>
              </div>
            </div>
            <RelatedVocabulary items={relatedVocabulary} />
          </Card>
        </div>
      </div>
    </div>
  )
}
