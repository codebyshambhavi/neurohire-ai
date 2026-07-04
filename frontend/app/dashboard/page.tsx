import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { StatCards } from '@/components/dashboard/stat-cards'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { SkillBreakdown } from '@/components/dashboard/skill-breakdown'
import { InterviewsTable } from '@/components/dashboard/interviews-table'
import { Recommendations } from '@/components/dashboard/recommendations'
import { ScoreRing } from '@/components/score-ring'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
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
            Welcome back, Alex
          </h2>
          <p className="mt-2 max-w-md text-pretty text-muted-foreground">
            You are trending up. Your NeuroScore improved 7 points this week, driven by stronger
            answer structure and clearer delivery.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="h-11" asChild>
              <Link href="/interview/create">
                Start new interview
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-11" asChild>
              <Link href="/report">View last report</Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/50 p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Interview Readiness</h3>
          <div className="mt-4">
            <ScoreRing value={86} size={168} label="NeuroScore" />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            You are in the top 12% of candidates for your target role.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6">
        <StatCards />
      </section>

      {/* Analytics + skills */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <SkillBreakdown />
      </section>

      {/* Table + recommendations */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InterviewsTable />
        </div>
        <Recommendations />
      </section>
    </AppShell>
  )
}
