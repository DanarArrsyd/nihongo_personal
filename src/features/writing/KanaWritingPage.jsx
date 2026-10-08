import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Info, PenLine } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import { createStudySession } from '../../services/studySession.js'
import PracticeModePicker from '../kana/components/PracticeModePicker.jsx'
import WritingCanvas from './components/WritingCanvas.jsx'
import { recordWritingCompletion } from './services/writingPersistence.js'
import {
  getWritingKana,
  getWritingKanaById,
  isSupportedWritingScript,
} from './services/writingData.js'

const scriptNames = { hiragana: 'Hiragana', katakana: 'Katakana' }

export default function KanaWritingPage({ persistCompletion = recordWritingCompletion }) {
  const { kanaId = 'a', script } = useParams()
  const navigate = useNavigate()
  const items = getWritingKana(script)
  const item = getWritingKanaById(script, kanaId)
  const itemIndex = items.findIndex((candidate) => candidate.id === item?.id)
  const previousItem = itemIndex > 0 ? items[itemIndex - 1] : null
  const nextItem = itemIndex >= 0 && itemIndex < items.length - 1 ? items[itemIndex + 1] : null
  const session = useMemo(() => item ? createStudySession({
    kind: 'quiz',
    module: `kana:${script}:writing`,
  }) : null, [item, script])
  const itemKey = `${script}:${item?.id}`
  const [saveState, setSaveState] = useState({ key: itemKey, status: 'idle' })
  const currentSaveState = saveState.key === itemKey ? saveState.status : 'idle'

  if (!isSupportedWritingScript(script) || !item) {
    return (
      <div className="page-frame">
        <p className="text-sm font-semibold tracking-[0.14em] text-accent uppercase">404 / Writing</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Writing path not found</h1>
        <p className="mt-4 text-ink-muted">Karakter ini belum tersedia untuk latihan menulis.</p>
        <Link to="/practice" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white">
          <ArrowLeft size={17} aria-hidden="true" /> Kembali ke Practice
        </Link>
      </div>
    )
  }

  async function completeCharacter({ attempts }) {
    setSaveState({ key: itemKey, status: 'saving' })
    try {
      await persistCompletion({ attempts, itemId: item.id, session })
      setSaveState({ key: itemKey, status: 'saved' })
    } catch {
      setSaveState({ key: itemKey, status: 'error' })
    }
  }

  function openItem(id) {
    navigate(`/practice/writing/kana/${script}/${id}`)
  }

  return (
    <div className="page-frame max-w-[90rem]">
      <Link
        to="/practice"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Practice overview
      </Link>

      <header className="mt-6 flex flex-col justify-between gap-6 border-b border-border pb-7 xl:flex-row xl:items-end">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
              <PenLine size={20} aria-hidden="true" />
            </span>
            <p lang="ja" className="font-japanese text-sm font-semibold text-accent">書き方 · Kakikata</p>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{scriptNames[script]} writing</h1>
          <p className="mt-3 text-sm leading-6 text-ink-muted sm:text-base sm:leading-7">
            Ikuti urutan stroke menggunakan jari, stylus, atau mouse. Sistem memeriksa titik awal, arah, dan bentuk dasar setiap goresan.
          </p>
        </div>
        <PracticeModePicker script={script} />
      </header>

      <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
        <label className="block min-w-0 flex-1">
          <span className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">Pilih karakter</span>
          <select
            aria-label="Pilih karakter untuk ditulis"
            className="mt-2 min-h-11 w-full rounded-xl border border-border bg-paper px-3 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:max-w-sm"
            value={item.id}
            onChange={(event) => openItem(event.target.value)}
          >
            {items.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.character} · {candidate.romaji}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button disabled={!previousItem} variant="secondary" onClick={() => openItem(previousItem.id)}>
            <ArrowLeft size={16} aria-hidden="true" /> Sebelumnya
          </Button>
          <Button disabled={!nextItem} variant="secondary" onClick={() => openItem(nextItem.id)}>
            Berikutnya <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="writing-board-heading" className="min-w-0 rounded-3xl border border-border bg-surface p-4 sm:p-7">
          <div className="mb-5 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">Karakter aktif</p>
              <h2 id="writing-board-heading" className="mt-1 flex items-baseline gap-3 text-3xl font-semibold text-ink">
                <span lang="ja" className="font-japanese text-5xl text-accent">{item.character}</span>
                <span>{item.romaji}</span>
              </h2>
            </div>
            <span className="rounded-full bg-paper-deep px-3 py-1 text-xs font-semibold text-ink-muted">
              {item.strokes.length} stroke
            </span>
          </div>

          <WritingCanvas
            key={`${script}:${item.id}`}
            character={item.character}
            numbers={item.numbers}
            referencePoints={item.referencePoints}
            strokes={item.strokes}
            onComplete={completeCharacter}
          />

          {currentSaveState === 'saving' ? <p role="status" className="mt-4 text-sm text-ink-muted">Menyimpan latihan…</p> : null}
          {currentSaveState === 'saved' ? (
            <div role="status" className="mt-4 flex flex-col gap-3 rounded-2xl border border-matcha/25 bg-matcha-soft p-4 text-[#516549] sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 size={18} aria-hidden="true" /> Progress menulis tersimpan.</p>
              {nextItem ? (
                <Button variant="secondary" onClick={() => openItem(nextItem.id)}>Latih {nextItem.character} berikutnya <ArrowRight size={16} aria-hidden="true" /></Button>
              ) : null}
            </div>
          ) : null}
          {currentSaveState === 'error' ? (
            <p role="alert" className="mt-4 rounded-xl border border-accent/25 bg-accent-soft px-4 py-3 text-sm text-[#8F3531]">
              Karakter selesai, tetapi progress belum tersimpan. Coba ulangi sebelum meninggalkan halaman.
            </p>
          ) : null}
        </section>

        <aside className="space-y-5">
          <Card>
            <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">Cara latihan</p>
            <ol className="mt-5 space-y-4">
              {[
                ['1', 'Mulai dari nomor', 'Sentuh titik angka stroke yang aktif.'],
                ['2', 'Ikuti arahnya', 'Tarik satu goresan tanpa mengangkat jari.'],
                ['3', 'Perbaiki bila perlu', 'Feedback muncul langsung setelah tiap stroke.'],
              ].map(([number, title, detail]) => (
                <li key={number} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent">{number}</span>
                  <div><p className="text-sm font-semibold text-ink">{title}</p><p className="mt-1 text-xs leading-5 text-ink-muted">{detail}</p></div>
                </li>
              ))}
            </ol>
          </Card>

          <div className="flex gap-3 rounded-2xl border border-border bg-paper-deep p-4">
            <Info className="mt-0.5 shrink-0 text-muted-blue" size={18} aria-hidden="true" />
            <p className="text-xs leading-5 text-ink-muted">
              Penilaian dibuat toleran untuk belajar, bukan untuk kaligrafi. Fokus utama adalah urutan dan arah stroke.
            </p>
          </div>

          <p className="px-1 text-xs leading-5 text-ink-muted">
            Stroke data: <a className="font-semibold underline decoration-border underline-offset-4 hover:text-ink" href="https://kanjivg.tagaini.net/" target="_blank" rel="noreferrer">KanjiVG</a>, CC BY-SA 3.0.
          </p>
        </aside>
      </div>
    </div>
  )
}
