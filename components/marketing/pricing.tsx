import Link from 'next/link'
import { Check } from 'lucide-react'
import { pricing } from '@/lib/mock-data'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Pricing</p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Plans that scale with your prep
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Start free. Upgrade when you are ready for full multimodal analysis.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {pricing.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08} className="h-full">
              <div
                className={cn(
                  'relative flex h-full flex-col rounded-2xl border p-7',
                  plan.highlighted
                    ? 'border-primary/40 bg-card/70 shadow-xl shadow-primary/5'
                    : 'border-border bg-card/40',
                )}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-7">Most popular</Badge>
                )}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  <span className="mb-1 text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 flex flex-col gap-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-foreground/90">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 h-11 w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  render={<Link href="/signup" />}
                >
                  {plan.cta}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
