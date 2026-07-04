'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const BAR_COUNT = 48

export function Waveform({ active, className }: { active: boolean; className?: string }) {
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(0.12))
  const raf = useRef<number>(0)

  useEffect(() => {
    if (!active) {
      setBars(Array(BAR_COUNT).fill(0.12))
      return
    }
    let t = 0
    const tick = () => {
      t += 0.18
      setBars(
        Array.from({ length: BAR_COUNT }, (_, i) => {
          const base = Math.sin(t + i * 0.5) * 0.5 + 0.5
          const jitter = Math.random() * 0.4
          return Math.max(0.08, Math.min(1, base * 0.6 + jitter))
        }),
      )
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [active])

  return (
    <div className={cn('flex h-full w-full items-center justify-center gap-[3px]', className)}>
      {bars.map((h, i) => (
        <span
          key={i}
          className={cn(
            'w-1 rounded-full transition-[height] duration-100',
            active ? 'bg-primary' : 'bg-muted-foreground/30',
          )}
          style={{ height: `${h * 100}%` }}
        />
      ))}
    </div>
  )
}
