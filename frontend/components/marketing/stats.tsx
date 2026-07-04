import { stats } from '@/lib/mock-data'
import { Reveal } from '@/components/reveal'

export function Stats() {
  return (
    <section className="relative py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="glass grid grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div className="flex flex-col items-center justify-center gap-1 p-8 text-center">
                <span className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  {s.value}
                </span>
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
