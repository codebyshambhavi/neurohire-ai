'use client'

import Link from 'next/link'
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'
import { recentInterviews, type Interview } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const difficultyVariant: Record<Interview['difficulty'], 'muted' | 'default' | 'accent'> = {
  Beginner: 'muted',
  Intermediate: 'default',
  Advanced: 'accent',
}

function scoreColor(score: number) {
  if (score >= 85) return 'text-success'
  if (score >= 75) return 'text-primary'
  return 'text-chart-4'
}

export function InterviewsTable() {
  return (
    <div className="rounded-2xl border border-border bg-card/50">
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Recent Interviews</h3>
          <p className="text-sm text-muted-foreground">Your latest AI-analyzed sessions</p>
        </div>
        <Link
          href="/report"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Difficulty</th>
              <th className="px-6 py-3 font-medium">Score</th>
              <th className="px-6 py-3 font-medium">Improvement</th>
            </tr>
          </thead>
          <tbody>
            {recentInterviews.map((iv) => (
              <tr
                key={iv.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40"
              >
                <td className="px-6 py-4 font-medium text-foreground">{iv.role}</td>
                <td className="px-6 py-4 text-muted-foreground">{iv.date}</td>
                <td className="px-6 py-4">
                  <Badge variant={difficultyVariant[iv.difficulty]}>{iv.difficulty}</Badge>
                </td>
                <td className={cn('px-6 py-4 font-semibold', scoreColor(iv.score))}>{iv.score}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'flex items-center gap-1 font-medium',
                      iv.improvement >= 0 ? 'text-success' : 'text-destructive',
                    )}
                  >
                    {iv.improvement >= 0 ? (
                      <TrendingUp className="size-3.5" />
                    ) : (
                      <TrendingDown className="size-3.5" />
                    )}
                    {iv.improvement > 0 ? '+' : ''}
                    {iv.improvement}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
