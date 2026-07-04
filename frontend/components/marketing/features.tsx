import { features } from '@/lib/mock-data'
import { Reveal } from '@/components/reveal'
import { cn } from '@/lib/utils'

const accentMap: Record<string, string> = {
  primary: 'bg-primary/10 text-primary ring-primary/20',
  accent: 'bg-accent/10 text-accent ring-accent/20',
  success: 'bg-success/10 text-success ring-success/20',
  chart4: 'bg-chart-4/10 text-chart-4 ring-chart-4/20',
}

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">The intelligence stack</p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Four AI models. One readiness score.
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Every interview is analyzed across language, voice, and vision, then fused into a single
            calibrated NeuroScore.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {features.map((f, i) => (
            <Reveal key={f.id} delay={i * 0.08}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card/40 p-7 transition-colors hover:border-primary/30">
                <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/5 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                <div
                  className={cn(
                    'flex size-12 items-center justify-center rounded-xl ring-1',
                    accentMap[f.accent],
                  )}
                >
                  <f.icon className="size-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-foreground">{f.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{f.tagline}</p>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
