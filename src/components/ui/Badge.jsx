const variants = {
  neutral: 'border-border bg-paper text-ink-muted',
  accent: 'border-[#E9C3BF] bg-accent-soft text-[#983732]',
  success: 'border-[#CCD8C5] bg-matcha-soft text-[#52654A]',
}

export default function Badge({ children, className = '', variant = 'neutral' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.7rem] font-bold tracking-[0.12em] uppercase ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
