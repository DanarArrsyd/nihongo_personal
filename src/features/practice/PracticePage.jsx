import { ArrowRight, Blend, Keyboard, Repeat2, ScanText } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'

const scripts = [
  { id: 'hiragana', name: 'Hiragana', sample: 'あ', japanese: 'ひらがな' },
  { id: 'katakana', name: 'Katakana', sample: 'ア', japanese: 'カタカナ' },
]

const modes = [
  { icon: ScanText, name: 'Recognition', detail: 'Kana → romaji' },
  { icon: Repeat2, name: 'Reverse', detail: 'Romaji → kana' },
  { icon: Keyboard, name: 'Typing', detail: 'Type the reading' },
]

export default function PracticePage() {
  return (
    <div className="page-frame">
      <header className="max-w-3xl">
        <div className="mb-5 flex items-center gap-3">
          <span className="study-seal" aria-hidden="true">練習</span>
          <Badge variant="success">Active recall</Badge>
        </div>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Practice</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
          Latih Kana secara terarah atau gabungkan Kana, Vocabulary, Kanji, dan Grammar dalam satu sesi.
        </p>
      </header>

      <section className="mt-10" aria-labelledby="mixed-quiz-title">
        <Card className="relative overflow-hidden border-accent bg-accent-soft">
          <div className="genko-grid absolute inset-y-0 right-0 w-52 opacity-50" aria-hidden="true" />
          <div className="relative flex max-w-3xl flex-col items-start">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-accent uppercase">
              <Blend size={17} aria-hidden="true" /> 10 soal campuran
            </span>
            <h2 id="mixed-quiz-title" className="mt-3 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
              Satu sesi, empat materi
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
              Berpindah antara lima tipe soal untuk menguji ingatan dari berbagai arah.
            </p>
            <Link
              to="/practice/mixed"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#B9403C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Mulai Mixed Quiz <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </Card>
      </section>

      <div className="mt-10 grid gap-5 xl:grid-cols-2">
        {scripts.map((script) => (
          <Card key={script.id} className="relative overflow-hidden">
            <div className="genko-grid absolute inset-y-0 right-0 w-36 opacity-60" aria-hidden="true" />
            <div className="relative flex min-h-52 flex-col items-start">
              <p lang="ja" className="font-japanese text-sm text-accent">{script.japanese}</p>
              <div className="mt-2 flex w-full items-center justify-between gap-6">
                <h2 className="text-2xl font-semibold">{script.name}</h2>
                <span lang="ja" className="font-japanese text-6xl" aria-hidden="true">{script.sample}</span>
              </div>
              <Link
                to={`/practice/kana/${script.id}/recognition`}
                className="mt-auto inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Practice {script.name} <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <section className="mt-8 border-t border-border pt-7" aria-labelledby="practice-modes-title">
        <h2 id="practice-modes-title" className="text-lg font-semibold">Three ways to recall</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {modes.map(({ detail, icon: Icon, name }) => (
            <div key={name} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
              <Icon size={18} className="text-accent" aria-hidden="true" />
              <div><p className="text-sm font-semibold">{name}</p><p className="text-xs text-ink-muted">{detail}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
