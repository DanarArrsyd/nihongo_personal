import { ArrowLeft, Dumbbell } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import ProgressBar from '../../components/ui/ProgressBar'
import GroupNavigation from './components/GroupNavigation'
import KanaDetail from './components/KanaDetail'
import KanaGrid from './components/KanaGrid'
import ScriptSwitcher from './components/ScriptSwitcher'
import { getAllKana, getKanaGroup, getKanaGroups, isSupportedScript } from './services/kanaData'

const scriptNames = { hiragana: 'Hiragana', katakana: 'Katakana' }

export function KanaEntryRedirect() {
  const { script } = useParams()
  return <Navigate replace to={`/learn/kana/${script}/vowels`} />
}

export default function KanaLearningPage() {
  const { groupId, script } = useParams()
  const group = getKanaGroup(script, groupId)
  const groups = getKanaGroups(script)
  const allKana = getAllKana(script)
  const [selectedId, setSelectedId] = useState(null)
  const [learnedIds, setLearnedIds] = useState(() => new Set())

  if (!isSupportedScript(script) || !group) {
    return (
      <div className="page-frame">
        <p className="text-sm font-semibold tracking-[0.14em] text-accent uppercase">404 / Kana</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Kana path not found</h1>
        <p className="mt-4 text-ink-muted">This script or sound group is not available.</p>
        <Link to="/learn" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white">
          <ArrowLeft size={17} aria-hidden="true" /> Back to Learn
        </Link>
      </div>
    )
  }

  const selectedItem = group.items.find((item) => item.id === selectedId) ?? group.items[0]
  const learnedCount = learnedIds.size
  const progress = Math.round((learnedCount / allKana.length) * 100)

  function toggleLearned(id) {
    setLearnedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="page-frame">
      <Link to="/learn" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent">
        <ArrowLeft size={16} aria-hidden="true" /> All learning paths
      </Link>

      <header className="mt-6 flex flex-col justify-between gap-6 border-b border-border pb-8 xl:flex-row xl:items-end">
        <div>
          <p lang="ja" className="font-japanese text-sm font-medium text-accent">{script === 'hiragana' ? 'ひらがな' : 'カタカナ'}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{scriptNames[script]}</h1>
          <p className="mt-3 max-w-xl leading-7 text-ink-muted">Study each sound, listen to its pronunciation, and mark it when it feels familiar.</p>
        </div>
        <ScriptSwitcher groupId={groupId} />
      </header>

      <div className="mt-7 grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside>
          <p className="mb-3 text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">Sound groups</p>
          <GroupNavigation groups={groups} script={script} />
        </aside>

        <div className="min-w-0">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
            <section>
              <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p lang="ja" className="font-japanese text-sm text-accent">{group.japaneseLabel}</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{group.name}</h2>
                </div>
                <p className="text-sm font-medium tabular-nums text-ink-muted">{learnedCount} of {allKana.length} learned</p>
              </div>
              <KanaGrid items={group.items} learnedIds={learnedIds} selectedId={selectedItem.id} onSelect={setSelectedId} />

              <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
                <ProgressBar label={`${scriptNames[script]} session progress`} value={progress} />
                <Link
                  to={`/practice/kana/${script}/recognition`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                >
                  <Dumbbell size={16} aria-hidden="true" /> Practice this script
                </Link>
              </div>
            </section>

            <aside>
              <KanaDetail item={selectedItem} isLearned={learnedIds.has(selectedItem.id)} onToggleLearned={toggleLearned} />
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
