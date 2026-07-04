'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Code2,
  BrainCircuit,
  BarChart3,
  Briefcase,
  GraduationCap,
  UserCog,
  Zap,
  Gauge,
  Flame,
  MessageSquare,
  Layers,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Option = { id: string; label: string; desc: string; icon: LucideIcon }

const roles: Option[] = [
  { id: 'swe', label: 'Software Engineer', desc: 'DSA, systems, coding', icon: Code2 },
  { id: 'ml', label: 'ML Engineer', desc: 'Modeling, MLOps, math', icon: BrainCircuit },
  { id: 'da', label: 'Data Analyst', desc: 'SQL, stats, insight', icon: BarChart3 },
  { id: 'pm', label: 'Product Manager', desc: 'Strategy, execution', icon: Briefcase },
]

const experience: Option[] = [
  { id: 'student', label: 'Student', desc: 'In school or bootcamp', icon: GraduationCap },
  { id: 'intern', label: 'Intern', desc: 'Early hands-on experience', icon: Zap },
  { id: 'pro', label: 'Professional', desc: 'Working in the field', icon: UserCog },
]

const difficulty: Option[] = [
  { id: 'beginner', label: 'Beginner', desc: 'Warm-up fundamentals', icon: Gauge },
  { id: 'intermediate', label: 'Intermediate', desc: 'Realistic challenge', icon: Flame },
  { id: 'advanced', label: 'Advanced', desc: 'Senior-level depth', icon: Layers },
]

const types: Option[] = [
  { id: 'technical', label: 'Technical', desc: 'Concepts & problem solving', icon: Code2 },
  { id: 'behavioral', label: 'Behavioral', desc: 'Stories & soft skills', icon: MessageSquare },
  { id: 'mixed', label: 'Mixed', desc: 'A balanced blend', icon: Layers },
]

function OptionGrid({
  options,
  selected,
  onSelect,
  columns = 'sm:grid-cols-3',
}: {
  options: Option[]
  selected: string
  onSelect: (id: string) => void
  columns?: string
}) {
  return (
    <div className={cn('grid grid-cols-1 gap-3', columns)}>
      {options.map((opt) => {
        const active = selected === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            aria-pressed={active}
            className={cn(
              'group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
              active
                ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/30'
                : 'border-border bg-card/40 hover:border-primary/30 hover:bg-card/70',
            )}
          >
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
              )}
            >
              <opt.icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">{opt.label}</span>
              <span className="block text-xs text-muted-foreground">{opt.desc}</span>
            </span>
            {active && (
              <span className="absolute right-3 top-3 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

const sections = [
  { key: 'role', title: 'Target Role', subtitle: 'What position are you preparing for?' },
  { key: 'exp', title: 'Experience Level', subtitle: 'Where are you in your career?' },
  { key: 'diff', title: 'Difficulty', subtitle: 'How challenging should it be?' },
  { key: 'type', title: 'Interview Type', subtitle: 'What kind of questions do you want?' },
] as const

export function CreateInterview() {
  const router = useRouter()
  const [role, setRole] = useState('ml')
  const [exp, setExp] = useState('pro')
  const [diff, setDiff] = useState('intermediate')
  const [type, setType] = useState('technical')

  const optionMap = { role: roles, exp: experience, diff: difficulty, type: types }
  const valueMap = { role, exp, diff, type }
  const setterMap = { role: setRole, exp: setExp, diff: setDiff, type: setType }

  const summary = [
    roles.find((r) => r.id === role)?.label,
    experience.find((e) => e.id === exp)?.label,
    difficulty.find((d) => d.id === diff)?.label,
    types.find((t) => t.id === type)?.label,
  ]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        {sections.map((section, i) => (
          <motion.div
            key={section.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-xs text-primary">0{i + 1}</span>
              <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
              <span className="text-sm text-muted-foreground">— {section.subtitle}</span>
            </div>
            <OptionGrid
              options={optionMap[section.key]}
              selected={valueMap[section.key]}
              onSelect={setterMap[section.key]}
              columns={section.key === 'role' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}
            />
          </motion.div>
        ))}
      </div>

      {/* Summary rail */}
      <div className="lg:sticky lg:top-24 lg:h-fit">
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <h3 className="text-base font-semibold text-foreground">Session summary</h3>
          <p className="text-sm text-muted-foreground">Review before you begin</p>

          <dl className="mt-5 flex flex-col gap-3.5">
            {sections.map((s, i) => (
              <div key={s.key} className="flex items-center justify-between gap-3">
                <dt className="text-sm text-muted-foreground">{s.title}</dt>
                <dd className="text-sm font-medium text-foreground">{summary[i]}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 rounded-xl border border-border bg-background/40 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. questions</span>
              <span className="font-medium text-foreground">8</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Est. duration</span>
              <span className="font-medium text-foreground">~25 min</span>
            </div>
          </div>

          <Button size="lg" className="mt-5 h-11 w-full" render={<Link href="/interview" />}>
            Begin Interview
            <ArrowRight className="size-4" />
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Camera and microphone access will be requested.
          </p>
        </div>
      </div>
    </div>
  )
}
