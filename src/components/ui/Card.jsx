export default function Card({ children, className = '', quiet = false, ...props }) {
  return (
    <div
      role={props['aria-label'] ? 'region' : undefined}
      className={`rounded-2xl border p-5 sm:p-6 ${
        quiet ? 'border-transparent bg-paper-deep' : 'border-border bg-surface shadow-[0_12px_40px_rgba(64,54,41,0.05)]'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
