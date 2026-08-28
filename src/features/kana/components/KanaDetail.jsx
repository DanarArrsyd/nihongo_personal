import { Check, Volume2 } from 'lucide-react'
import { useState } from 'react'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import { speakJapanese } from '../services/speech'

export default function KanaDetail({ isLearned, item, onToggleLearned }) {
  const [speechMessage, setSpeechMessage] = useState('')

  function pronounce() {
    const result = speakJapanese(item.character)
    setSpeechMessage(result.ok ? '' : result.message)
  }

  return (
    <Card aria-label="Character detail" className="sticky top-6 overflow-hidden">
      <div className="genko-grid -mx-5 -mt-5 grid min-h-56 place-items-center border-b border-border sm:-mx-6 sm:-mt-6">
        <span lang="ja" className="font-japanese text-8xl font-medium text-ink sm:text-9xl">{item.character}</span>
      </div>
      <div className="pt-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">Romaji</p>
            <p className="mt-1 text-2xl font-semibold">{item.romaji}</p>
          </div>
          <Badge variant={isLearned ? 'success' : 'neutral'}>{isLearned ? 'Learned' : 'New'}</Badge>
        </div>

        <div className="mt-6 grid gap-2">
          <button
            type="button"
            onClick={pronounce}
            aria-label={`Pronounce ${item.character}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold transition hover:border-gold hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Volume2 size={17} aria-hidden="true" /> Pronounce
          </button>
          <button
            type="button"
            onClick={() => onToggleLearned(item.id)}
            aria-label={`Mark ${item.character} as ${isLearned ? 'new' : 'learned'}`}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
              isLearned ? 'bg-matcha hover:bg-[#607357] focus-visible:outline-matcha' : 'bg-accent hover:bg-[#AD3F3A] focus-visible:outline-accent'
            }`}
          >
            <Check size={17} aria-hidden="true" /> {isLearned ? 'Marked as learned' : 'Mark as learned'}
          </button>
        </div>
        {speechMessage && <p role="status" className="mt-4 text-sm leading-6 text-ink-muted">{speechMessage}</p>}
      </div>
    </Card>
  )
}
