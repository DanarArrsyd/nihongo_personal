import { useRef, useState } from 'react'
import { Eye, EyeOff, RotateCcw, Undo2 } from 'lucide-react'

import Button from '../../../components/ui/Button.jsx'
import { evaluateStroke } from '../services/strokeEvaluation.js'

const VIEWBOX_SIZE = 109

function eventPoint(event) {
  const bounds = event.currentTarget.getBoundingClientRect()
  return {
    x: ((event.clientX - bounds.left) / bounds.width) * VIEWBOX_SIZE,
    y: ((event.clientY - bounds.top) / bounds.height) * VIEWBOX_SIZE,
  }
}

function pointsAttribute(points) {
  return points.map((point) => `${point.x},${point.y}`).join(' ')
}

function WritingCanvasSession({
  character,
  numbers,
  onComplete,
  referencePoints,
  referenceSampler,
  strokes,
}) {
  const pathRefs = useRef([])
  const activePointsRef = useRef([])
  const failedAttemptsRef = useRef(0)
  const completedRef = useRef(false)
  const [acceptedStrokes, setAcceptedStrokes] = useState([])
  const [activePoints, setActivePoints] = useState([])
  const [feedback, setFeedback] = useState({ type: 'neutral', message: 'Mulai dari angka 1, lalu ikuti garis sesuai urutan.' })
  const [showGuide, setShowGuide] = useState(true)

  const currentStrokeIndex = acceptedStrokes.length
  const isComplete = currentStrokeIndex === strokes.length

  function reset() {
    activePointsRef.current = []
    failedAttemptsRef.current = 0
    completedRef.current = false
    setAcceptedStrokes([])
    setActivePoints([])
    setFeedback({ type: 'neutral', message: 'Papan dibersihkan. Mulai lagi dari stroke pertama.' })
  }

  function undo() {
    completedRef.current = false
    setAcceptedStrokes((current) => current.slice(0, -1))
    setFeedback({ type: 'neutral', message: 'Stroke terakhir dihapus.' })
  }

  function startStroke(event) {
    if (isComplete || (event.pointerType === 'mouse' && event.button !== 0)) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const point = eventPoint(event)
    activePointsRef.current = [point]
    setActivePoints([point])
  }

  function extendStroke(event) {
    if (!activePointsRef.current.length) return
    const point = eventPoint(event)
    activePointsRef.current = [...activePointsRef.current, point]
    setActivePoints(activePointsRef.current)
  }

  function finishStroke(event) {
    if (!activePointsRef.current.length) return
    const userPoints = [...activePointsRef.current, eventPoint(event)]
    const referenceStrokePoints = referenceSampler
      ? referenceSampler({ strokeIndex: currentStrokeIndex, path: pathRefs.current[currentStrokeIndex] })
      : referencePoints[currentStrokeIndex]
    const result = evaluateStroke(userPoints, referenceStrokePoints)

    activePointsRef.current = []
    setActivePoints([])
    setFeedback({ type: result.accepted ? 'success' : 'error', message: result.message })

    if (!result.accepted) {
      failedAttemptsRef.current += 1
      return
    }

    const nextStrokes = [...acceptedStrokes, userPoints]
    setAcceptedStrokes(nextStrokes)

    if (nextStrokes.length === strokes.length && !completedRef.current) {
      completedRef.current = true
      setFeedback({ type: 'success', message: `${character} selesai. Semua stroke sudah sesuai urutan.` })
      onComplete?.({ attempts: failedAttemptsRef.current + 1 })
    }
  }

  function cancelStroke() {
    activePointsRef.current = []
    setActivePoints([])
  }

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-[36rem] overflow-hidden rounded-3xl border border-border bg-[#FFFEFB] shadow-[0_18px_60px_rgba(64,54,41,0.08)]">
        <svg
          aria-label={`Area latihan menulis ${character}`}
          className="size-full touch-none select-none"
          role="application"
          tabIndex="0"
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          onPointerCancel={cancelStroke}
          onPointerDown={startStroke}
          onPointerMove={extendStroke}
          onPointerUp={finishStroke}
        >
          <title>{`Tulis karakter ${character} mengikuti urutan stroke`}</title>
          <rect width="109" height="109" fill="#FFFEFB" />
          <g aria-hidden="true" stroke="#DDD6C9" strokeWidth="0.55">
            <line x1="54.5" x2="54.5" y1="0" y2="109" strokeDasharray="2 2" />
            <line x1="0" x2="109" y1="54.5" y2="54.5" strokeDasharray="2 2" />
            <line x1="0" x2="109" y1="0" y2="109" opacity="0.45" />
            <line x1="109" x2="0" y1="0" y2="109" opacity="0.45" />
          </g>

          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {strokes.map((stroke, index) => {
              const isDone = index < currentStrokeIndex
              const isCurrent = index === currentStrokeIndex
              return (
                <path
                  key={stroke}
                  ref={(node) => { pathRefs.current[index] = node }}
                  d={stroke}
                  opacity={showGuide ? (isDone ? 0.12 : isCurrent ? 0.72 : 0.2) : 0}
                  stroke={isCurrent ? '#C94A45' : '#B9B1A5'}
                  strokeDasharray={isCurrent ? '2.5 2.5' : undefined}
                  strokeWidth={isCurrent ? 2.6 : 2}
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </g>

          {showGuide ? numbers.map((number, index) => (
            <g key={`${number.value}-${number.x}`} aria-hidden="true" opacity={index < currentStrokeIndex ? 0.25 : 1}>
              <circle cx={number.x} cy={number.y - 2.3} fill={index === currentStrokeIndex ? '#C94A45' : '#77736B'} r="3.7" />
              <text x={number.x} y={number.y - 1} fill="white" fontSize="4.5" fontWeight="700" textAnchor="middle">
                {number.value}
              </text>
            </g>
          )) : null}

          {acceptedStrokes.map((points, index) => (
            <polyline
              key={`accepted-${index}`}
              fill="none"
              points={pointsAttribute(points)}
              stroke="#262522"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          ))}
          {activePoints.length ? (
            <polyline
              fill="none"
              points={pointsAttribute(activePoints)}
              stroke="#C94A45"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          ) : null}
        </svg>

        <div aria-hidden="true" className="pointer-events-none absolute top-4 right-4 rounded-full border border-border bg-surface/90 px-3 py-1 text-xs font-semibold text-ink-muted backdrop-blur">
          {Math.min(currentStrokeIndex + 1, strokes.length)} / {strokes.length} stroke
        </div>
      </div>

      <p
        aria-live="polite"
        className={`mt-4 min-h-12 rounded-xl border px-4 py-3 text-sm leading-6 ${
          feedback.type === 'error'
            ? 'border-accent/25 bg-accent-soft text-[#8F3531]'
            : feedback.type === 'success'
              ? 'border-matcha/25 bg-matcha-soft text-[#516549]'
              : 'border-border bg-paper-deep text-ink-muted'
        }`}
      >
        {feedback.message}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button variant="secondary" onClick={() => setShowGuide((current) => !current)}>
          {showGuide ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          {showGuide ? 'Sembunyikan pola' : 'Tampilkan pola'}
        </Button>
        <Button disabled={!acceptedStrokes.length} variant="secondary" onClick={undo}>
          <Undo2 size={17} aria-hidden="true" /> Urungkan
        </Button>
        <Button className="col-span-2" variant="ghost" onClick={reset}>
          <RotateCcw size={17} aria-hidden="true" /> Ulangi karakter
        </Button>
      </div>
    </div>
  )
}

export default function WritingCanvas(props) {
  return <WritingCanvasSession key={`${props.character}:${props.strokes.join('|')}`} {...props} />
}
