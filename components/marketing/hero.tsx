'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NeuralViz } from '@/components/neural-viz'
import { ProductMockup } from '@/components/marketing/product-mockup'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-20 md:pt-44">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-20 right-0 size-[400px] rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Badge>
              <Sparkles className="size-3.5" />
              Multimodal interview intelligence
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl"
          >
            Interview Intelligence{' '}
            <span className="text-glow text-primary">Beyond Resumes</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            Analyze your interviews with multimodal AI. Improve communication, technical depth, and
            confidence with personalized insights.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button size="lg" className="h-12 px-6 text-[15px]" render={<Link href="/interview" />}>
              Start Interview
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-[15px]"
              render={<Link href="/dashboard" />}
            >
              <Play className="size-4" />
              View Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex items-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex -space-x-2">
              {['bg-primary', 'bg-accent', 'bg-success', 'bg-chart-4'].map((c) => (
                <span
                  key={c}
                  className={`size-7 rounded-full ${c} ring-2 ring-background`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span>Trusted by 40,000+ candidates preparing to level up.</span>
          </motion.div>
        </div>

        {/* Neural visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-square w-full max-w-md"
        >
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />
          <NeuralViz className="relative animate-float-slow" />
        </motion.div>
      </div>

      {/* Product mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mt-16 max-w-5xl px-6"
      >
        <div className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 bg-gradient-to-b from-primary/10 to-transparent blur-2xl" />
        <ProductMockup />
      </motion.div>
    </section>
  )
}
