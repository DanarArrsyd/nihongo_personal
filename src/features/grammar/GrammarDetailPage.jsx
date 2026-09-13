import { ArrowLeft, BookOpenText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import GrammarFormula from './components/GrammarFormula'
import RelatedGrammar from './components/RelatedGrammar'
import { getGrammarById, getRelatedGrammar } from './services/grammarData'

export default function GrammarDetailPage() {
  const { grammarId } = useParams()
  const item = getGrammarById(grammarId)

  if (!item) {
    return (
      <div className="page-frame">
        <p className="text-sm font-semibold tracking-[0.14em] text-accent uppercase">404 / Grammar</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-ink">
          Pola grammar tidak ditemukan
        </h1>
        <p className="mt-4 max-w-md leading-7 text-ink-muted">
          Pola ini belum tersedia dalam kurikulum dasar saat ini.
        </p>
        <Link
          to="/learn/grammar"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={17} aria-hidden="true" /> Kembali ke Grammar
        </Link>
      </div>
    )
  }

  const relatedGrammar = getRelatedGrammar(item)

  return (
    <div className="page-frame max-w-6xl">
      <Link
        to="/learn/grammar"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Kembali ke Grammar
      </Link>

      <div className="mt-7 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-6">
          <Card className="p-6 sm:p-8">
            <Badge variant="accent">{item.jlpt} curated seed</Badge>
            <h1 lang="ja" className="font-japanese mt-5 break-words text-4xl font-semibold tracking-[-0.04em] text-ink [overflow-wrap:anywhere] sm:text-6xl">
              {item.pattern}
            </h1>
            <p className="mt-3 break-words text-xl font-semibold leading-8 text-ink [overflow-wrap:anywhere]">{item.meaning}</p>

            <section className="mt-8 border-t border-border pt-7" aria-labelledby="formula-title">
              <p id="formula-title" className="text-xs font-bold tracking-[0.16em] text-ink-muted uppercase">
                Pola pembentukan
              </p>
              <div className="mt-4">
                <GrammarFormula structure={item.structure} />
              </div>
            </section>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-[-0.025em] text-ink">Penjelasan</h2>
            <p className="mt-4 leading-7 text-ink-muted">{item.explanation}</p>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold tracking-[-0.025em] text-ink">Contoh kalimat</h2>
            <ol className="mt-5 space-y-4">
              {item.examples.map((example) => (
                <li key={example.japanese} className="min-w-0 rounded-2xl border border-border bg-paper p-4 sm:p-5">
                  <p lang="ja" className="font-japanese break-words text-xl font-medium leading-relaxed text-ink [overflow-wrap:anywhere]">
                    {example.japanese}
                  </p>
                  <p
                    lang={example.reading ? 'ja' : undefined}
                    aria-label={example.reading ? undefined : 'Bacaan tidak tersedia'}
                    className="font-japanese mt-2 break-words text-sm leading-7 text-ink-muted [overflow-wrap:anywhere]"
                  >
                    {example.reading || '—'}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-ink">{example.meaning}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <aside>
          <Card className="xl:sticky xl:top-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-matcha-soft text-matcha">
                <BookOpenText size={19} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">Koneksi</p>
                <h2 className="mt-0.5 text-xl font-semibold tracking-[-0.025em] text-ink">Pola terkait</h2>
              </div>
            </div>
            <div className="mt-5">
              <RelatedGrammar items={relatedGrammar} />
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
