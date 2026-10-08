export default function KanjiDataNotice() {
  return (
    <p className="mt-8 text-xs leading-6 text-ink-muted">
      Reading and stroke references:{' '}
      <a href="https://www.edrdg.org/wiki/KANJIDIC_Project.html" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink">
        KANJIDIC2 · EDRDG
      </a>
      {' '}(
      <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink">
        CC BY-SA 4.0
      </a>
      ). Readings are selected for beginner study.
    </p>
  )
}
