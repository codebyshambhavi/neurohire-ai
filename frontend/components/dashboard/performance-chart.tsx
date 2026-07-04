'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PerformancePoint } from '@/lib/api'
import { Badge } from '@/components/ui/badge'

type TooltipEntry = {
  color?: string
  dataKey?: string | number
  value?: string | number
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.dataKey === 'score' ? 'NeuroScore' : 'Communication'}: {p.value}
        </p>
      ))}
    </div>
  )
}

export function PerformanceChart({ performance }: { performance: PerformancePoint[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Performance Analytics</h3>
          <p className="text-sm text-muted-foreground">NeuroScore improvement over time</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" /> NeuroScore
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-accent" /> Communication
          </span>
          {performance.length > 1 && (
            <Badge variant="success">
              {performance.at(-1)!.score - performance[0].score >= 0 ? '+' : ''}
              {performance.at(-1)!.score - performance[0].score} pts
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        {performance.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Performance analytics will appear after a scored interview.
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performance} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[40, 100]}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)' }} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="url(#fillScore)"
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="communication"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
