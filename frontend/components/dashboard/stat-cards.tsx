'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Gauge, Sparkles, Clock } from 'lucide-react'
import { dashboardStats } from '@/lib/mock-data'

const icons = [Users, Gauge, Sparkles, Clock]

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {dashboardStats.map((stat, i) => {
        const Icon = icons[i]
        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-border bg-card/50 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4.5" />
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <TrendIcon className="size-3.5" />
                {stat.delta}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
