import Link from 'next/link'
import { Quote } from 'lucide-react'
import { Logo } from '@/components/logo'
import { NeuralViz } from '@/components/neural-viz'

const highlights = [
  '120+ signals captured per session',
  'Multimodal scoring across voice, vision & language',
  'Personalized practice plans that compound',
]

export function AuthBranding() {
  return (
    <div className="relative hidden overflow-hidden bg-sidebar lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -left-20 top-1/3 size-[420px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-[300px] rounded-full bg-accent/10 blur-[120px]" />

      <Link href="/" className="relative">
        <Logo />
      </Link>

      <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 opacity-70">
        <NeuralViz className="animate-float-slow" />
      </div>

      <div className="relative">
        <div className="glass-strong rounded-2xl p-6">
          <Quote className="size-6 text-primary" />
          <p className="mt-3 text-pretty text-lg font-medium leading-relaxed text-foreground">
            NeuroHire turned my vague interview anxiety into a clear list of things to fix. My score
            jumped from 61 to 88 in three weeks.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
              AR
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Ava Reyes</p>
              <p className="text-xs text-muted-foreground">ML Engineer, hired at a top lab</p>
            </div>
          </div>
        </div>

        <ul className="mt-6 flex flex-col gap-2.5">
          {highlights.map((h) => (
            <li key={h} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
