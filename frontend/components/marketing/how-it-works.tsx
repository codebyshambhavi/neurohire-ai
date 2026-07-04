import { howItWorks } from '@/lib/mock-data'
import { Reveal } from '@/components/reveal'

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            From nervous to interview-ready
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            A simple loop that compounds. Practice, measure, improve, repeat.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.08}>
              <div className="relative h-full rounded-2xl border border-border bg-card/40 p-6">
                <span className="font-mono text-sm font-medium text-primary">{step.step}</span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
