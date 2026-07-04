import { ScoreRing } from '@/components/score-ring'
import { Badge } from '@/components/ui/badge'
import { Brain, AudioLines, ScanFace, TrendingUp } from 'lucide-react'

const miniSkills = [
  { label: 'Technical Depth', value: 88, color: 'bg-primary' },
  { label: 'Communication', value: 82, color: 'bg-accent' },
  { label: 'Problem Solving', value: 79, color: 'bg-success' },
  { label: 'Clarity', value: 74, color: 'bg-chart-4' },
]

const spark = [30, 42, 38, 55, 60, 72, 68, 82, 86]

export function ProductMockup() {
  return (
    <div className="glass-strong relative rounded-2xl p-2 shadow-2xl shadow-black/40 ring-1 ring-white/5">
      <div className="rounded-xl border border-border bg-background/60 p-4 md:p-6">
        {/* top bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-chart-4/70" />
            <span className="size-2.5 rounded-full bg-success/70" />
            <span className="ml-3 text-sm font-medium text-muted-foreground">
              NeuroHire — Analysis Report
            </span>
          </div>
          <Badge variant="success">
            <TrendingUp className="size-3" />
            +7 pts
          </Badge>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* score */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card/50 p-5">
            <ScoreRing value={86} size={116} label="NeuroScore" />
          </div>

          {/* skills */}
          <div className="rounded-xl border border-border bg-card/50 p-5 md:col-span-2">
            <p className="text-sm font-medium text-foreground">Skill breakdown</p>
            <div className="mt-4 flex flex-col gap-3.5">
              {miniSkills.map((s) => (
                <div key={s.label}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-medium text-foreground">{s.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* bottom row */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: Brain, label: 'AnswerMind', value: '82', hint: 'Concept coverage' },
            { icon: AudioLines, label: 'SpeechIQ', value: '79', hint: 'Fluency' },
            { icon: ScanFace, label: 'VisionNet', value: '85', hint: 'Engagement' },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-4">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <m.icon className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-lg font-semibold leading-none text-foreground">{m.value}</p>
              </div>
              <svg viewBox="0 0 100 32" className="ml-auto h-8 w-20" aria-hidden="true">
                <polyline
                  points={spark.map((v, i) => `${(i / (spark.length - 1)) * 100},${32 - (v / 100) * 28}`).join(' ')}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
