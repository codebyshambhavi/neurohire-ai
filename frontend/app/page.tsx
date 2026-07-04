import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/marketing/navbar'
import { Hero } from '@/components/marketing/hero'
import { Features } from '@/components/marketing/features'
import { Stats } from '@/components/marketing/stats'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { Pricing } from '@/components/marketing/pricing'
import { Footer } from '@/components/marketing/footer'
import { Reveal } from '@/components/reveal'
import { Button } from '@/components/ui/button'
import { NeuralViz } from '@/components/neural-viz'

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing />

      {/* Final CTA */}
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="glass-strong relative overflow-hidden rounded-3xl px-8 py-16 text-center md:px-16 md:py-20">
              <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
                <div className="absolute -right-20 -top-20 size-80 opacity-60">
                  <NeuralViz />
                </div>
              </div>
              <div className="pointer-events-none absolute left-1/2 top-0 size-[400px] -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]" />
              <h2 className="relative mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                Your next interview deserves an unfair advantage
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
                Run your first AI-analyzed mock interview in minutes and see exactly where to
                improve.
              </p>
              <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" className="h-12 px-6 text-[15px]" asChild>
                  <Link href="/interview/create">
                    Start Interview
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-6 text-[15px]" asChild>
                  <Link href="/signup">Create free account</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  )
}
