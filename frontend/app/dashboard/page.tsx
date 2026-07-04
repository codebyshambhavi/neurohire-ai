'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { StatCards } from '@/components/dashboard/stat-cards'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { SkillBreakdown } from '@/components/dashboard/skill-breakdown'
import { InterviewsTable } from '@/components/dashboard/interviews-table'
import { Recommendations } from '@/components/dashboard/recommendations'
import { ScoreRing } from '@/components/score-ring'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api, type DashboardSummaryResponse, type User } from '@/lib/api'

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardSummaryResponse | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      try {
        const [dashboardData, userData] = await Promise.all([api.dashboard(), api.me()])
        if (!cancelled) {
          setDashboard(dashboardData)
          setUser(userData)
        }
      } catch (caughtError: unknown) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load your dashboard.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <AppShell title="Dashboard">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </AppShell>
    )
  }

  if (error || !dashboard) {
    return (
      <AppShell title="Dashboard">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="max-w-md text-center text-sm text-muted-foreground" role="alert">
            {error ?? 'Your dashboard is unavailable right now.'}
          </p>
        </div>
      </AppShell>
    )
  }

  const latestPerformance = dashboard.performance.at(-1)
  const latestInterview = dashboard.recent_interviews[0]

  return (
    <AppShell title="Dashboard">
      {/* Welcome + readiness */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 lg:col-span-2">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
          <Badge>
            <Sparkles className="size-3.5" />
            Multimodal analysis active
          </Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}
          </h2>
          <p className="mt-2 max-w-md text-pretty text-muted-foreground">
            {latestPerformance
              ? 'Track your latest interview performance and continue building your readiness.'
              : 'Complete an interview to begin building your performance analytics and recommendations.'}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="h-11" asChild>
              <Link href="/interview/create">
                Start new interview
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            {latestInterview && (
              <Button variant="outline" size="lg" className="h-11" asChild>
                <Link href={`/report?interviewId=${encodeURIComponent(latestInterview.id)}`}>View last report</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/50 p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Interview Readiness</h3>
          <div className="mt-4">
            {latestPerformance ? (
              <ScoreRing value={latestPerformance.score} size={168} label="NeuroScore" />
            ) : (
              <div className="flex size-[168px] items-center justify-center rounded-full border-[10px] border-muted text-sm text-muted-foreground">
                No score yet
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {latestPerformance
              ? 'Based on your latest analyzed interview.'
              : 'Readiness appears after your first analyzed interview.'}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6">
        <StatCards stats={dashboard.stats} />
      </section>

      {/* Analytics + skills */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceChart performance={dashboard.performance} />
        </div>
        <SkillBreakdown skills={dashboard.skill_breakdown} />
      </section>

      {/* Table + recommendations */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InterviewsTable interviews={dashboard.recent_interviews} />
        </div>
        <Recommendations recommendations={dashboard.recommendations} />
      </section>
    </AppShell>
  )
}
