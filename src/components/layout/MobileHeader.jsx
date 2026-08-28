import { Menu, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import Brand from './Brand'
import NavigationLinks from './NavigationLinks'

export default function MobileHeader({ isOpen, onClose, onOpen }) {
  const openButtonRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  function closeAndRestoreFocus() {
    onClose()
    openButtonRef.current?.focus()
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-border bg-paper/95 px-4 backdrop-blur-md sm:px-6 lg:hidden">
        <Brand />
        <button
          ref={openButtonRef}
          type="button"
          aria-label="Open navigation"
          aria-expanded={isOpen}
          onClick={onOpen}
          className="grid size-11 place-items-center rounded-xl border border-border bg-surface text-ink transition-colors hover:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Menu aria-hidden="true" size={21} />
        </button>
      </header>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeAndRestoreFocus}
            className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute inset-y-0 right-0 flex w-[min(88vw,22rem)] flex-col border-l border-border bg-surface p-5 shadow-[-20px_0_60px_rgba(38,37,34,0.12)]"
          >
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                aria-label="Close navigation"
                autoFocus
                onClick={closeAndRestoreFocus}
                className="grid size-11 place-items-center rounded-xl text-ink-muted hover:bg-paper-deep hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <X aria-hidden="true" size={21} />
              </button>
            </div>
            <div className="mt-10">
              <NavigationLinks onNavigate={closeAndRestoreFocus} />
            </div>
            <p className="mt-auto border-t border-border pt-5 font-japanese text-sm text-ink-muted">日本語を、自分のペースで。</p>
          </aside>
        </div>
      ) : null}
    </>
  )
}
