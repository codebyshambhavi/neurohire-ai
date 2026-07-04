import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex size-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5 text-primary" aria-hidden="true">
        <circle cx="12" cy="4" r="2" fill="currentColor" />
        <circle cx="5" cy="12" r="2" fill="currentColor" />
        <circle cx="19" cy="12" r="2" fill="currentColor" />
        <circle cx="12" cy="20" r="2" fill="currentColor" />
        <circle cx="12" cy="12" r="2.4" fill="currentColor" />
        <path
          d="M12 4v8m0 0L5 12m7 0l7 0m-7 0v8"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.55"
        />
      </svg>
    </div>
  )
}

export function Logo({
  className,
  showText = true,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      {showText && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          NeuroHire<span className="text-primary"> AI</span>
        </span>
      )}
    </div>
  )
}
