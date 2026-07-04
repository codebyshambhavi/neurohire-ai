'use client'

import { motion } from 'framer-motion'
import type { SkillBreakdownItem } from '@/lib/api'

const colors = ['bg-primary', 'bg-accent', 'bg-success', 'bg-chart-4']

export function SkillBreakdown({ skills }: { skills: SkillBreakdownItem[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-6">
      <h3 className="text-base font-semibold text-foreground">Skill Breakdown</h3>
      <p className="text-sm text-muted-foreground">Your current competency profile</p>

      <div className="mt-6 flex flex-col gap-5">
        {skills.map((s, i) => (
          <div key={s.skill}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-foreground/90">{s.skill}</span>
              <span className="font-medium text-foreground">{s.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className={`h-full rounded-full ${colors[i % colors.length]}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${s.value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground">Skill analytics will appear after a scored interview.</p>
        )}
      </div>
    </div>
  )
}
