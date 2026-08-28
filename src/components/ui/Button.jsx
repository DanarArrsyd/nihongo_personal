const variants = {
  primary: 'bg-accent text-white shadow-[0_8px_22px_rgba(201,74,69,0.18)] hover:bg-[#B9403C]',
  secondary: 'border border-border bg-surface text-ink hover:border-[#C9C0B2] hover:bg-white',
  ghost: 'text-ink-muted hover:bg-paper-deep hover:text-ink',
}

export default function Button({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
