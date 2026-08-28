export default function LoadingState({ label = 'Loading' }) {
  return (
    <div role="status" className="space-y-5">
      <span className="sr-only">{label}</span>
      <div data-testid="loading-skeletons" aria-hidden="true" className="animate-pulse space-y-3 motion-reduce:animate-none">
        <div className="h-4 w-28 rounded-full bg-paper-deep" />
        <div className="h-8 w-2/3 rounded-xl bg-paper-deep" />
        <div className="h-4 w-full max-w-lg rounded-full bg-paper-deep" />
      </div>
    </div>
  )
}
