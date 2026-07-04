"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import {
  Brain,
  AudioLines,
  ScanFace,
  Sparkles,
  ThumbsUp,
  Target,
  Dumbbell,
  Download,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScoreRing } from "@/components/score-ring"
import { ReportRadar } from "@/components/report/radar"
import { MetricBar } from "@/components/report/metric-bar"
import { api, type InterviewResponse, type ReportResponse } from "@/lib/api"

const sectionMeta = [
  { key: "answermind", name: "AnswerMind", tagline: "Language & reasoning", icon: Brain },
  { key: "speechiq", name: "SpeechIQ", tagline: "Voice & delivery", icon: AudioLines },
  { key: "visionnet", name: "VisionNet", tagline: "Visual engagement", icon: ScanFace },
] as const

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card/60 backdrop-blur-xl ${className}`}>{children}</div>
  )
}

export function ReportView({ interviewId }: { interviewId: string | null }) {
  const [report, setReport] = useState<ReportResponse | null>(null)
  const [interview, setInterview] = useState<InterviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!interviewId) {
      setError("No interview was selected. Open a completed interview to view its report.")
      setLoading(false)
      return
    }

    const currentInterviewId = interviewId
    let cancelled = false

    async function loadReport() {
      try {
        const [reportData, interviewData] = await Promise.all([
          api.report(currentInterviewId),
          api.interview(currentInterviewId),
        ])

        if (!cancelled) {
          setReport(reportData)
          setInterview(interviewData)
        }
      } catch (caughtError: unknown) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "Unable to load this report.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadReport()

    return () => {
      cancelled = true
    }
  }, [interviewId])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="max-w-md text-center text-sm text-muted-foreground" role="alert">
          {error ?? "This report is not available yet."}
        </p>
      </div>
    )
  }

  const isPending = report.status === "pending"
  const createdAt = new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(report.created_at),
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge>{interview ? `${interview.role_label} · ${interview.difficulty_label}` : "Interview"}</Badge>
            <span className="text-sm text-muted-foreground">{createdAt}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Analysis Report</h1>
          <p className="text-sm text-muted-foreground">Multimodal breakdown of your latest session.</p>
        </div>
        <Button variant="outline" className="gap-2 self-start bg-transparent" disabled={isPending}>
          <Download className="size-4" /> Export PDF
        </Button>
      </div>

      {/* Overall score + radar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <GlassCard className="flex flex-col items-center justify-center gap-4 p-8">
          <span className="text-sm font-medium text-muted-foreground">Overall NeuroScore</span>
          {report.neuroscore === null ? (
            <div className="flex size-[168px] items-center justify-center rounded-full border-[10px] border-muted text-sm text-muted-foreground">
              Pending
            </div>
          ) : (
            <ScoreRing value={report.neuroscore} size={168} suffix="/ 100" />
          )}
          <div className="flex items-center gap-2 text-sm text-success">
            <Sparkles className="size-4" />
            <span>{isPending ? "Analysis is still processing" : "Analysis complete"}</span>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Skill Radar</h2>
          {report.radar.length > 0 ? (
            <ReportRadar data={report.radar} />
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              Radar analysis is pending.
            </div>
          )}
        </GlassCard>
      </div>

      {/* Breakdown sections */}
      <div className="grid gap-6 md:grid-cols-3">
        {sectionMeta.map((section, i) => {
          const Icon = section.icon
          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <GlassCard className="flex h-full flex-col gap-5 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{section.name}</span>
                    <span className="text-xs text-muted-foreground">{section.tagline}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {report.breakdown[section.key].map((m) => (
                    <MetricBar key={m.label} label={m.label} value={m.value} />
                  ))}
                  {report.breakdown[section.key].length === 0 && (
                    <p className="text-sm text-muted-foreground">Analysis pending.</p>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* AI feedback */}
      <div className="grid gap-6 md:grid-cols-3">
        <FeedbackCard
          icon={ThumbsUp}
          title="Strengths"
          tone="text-success"
          ring="bg-success/10"
          items={report.feedback.strengths}
        />
        <FeedbackCard
          icon={Target}
          title="Areas to Improve"
          tone="text-chart-4"
          ring="bg-chart-4/10"
          items={report.feedback.improve}
        />
        <FeedbackCard
          icon={Dumbbell}
          title="Recommended Practice"
          tone="text-primary"
          ring="bg-primary/10"
          items={report.feedback.practice}
        />
      </div>

      {/* CTA */}
      <GlassCard className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-medium">Ready for another round?</h3>
          <p className="text-sm text-muted-foreground">Apply this feedback in your next AI mock interview.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/interview/create">
            Start new interview <ArrowRight className="size-4" />
          </Link>
        </Button>
      </GlassCard>
    </div>
  )
}

function FeedbackCard({
  icon: Icon,
  title,
  tone,
  ring,
  items,
}: {
  icon: typeof ThumbsUp
  title: string
  tone: string
  ring: string
  items: string[]
}) {
  return (
    <GlassCard className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <div className={`flex size-9 items-center justify-center rounded-lg ${ring} ${tone}`}>
          <Icon className="size-4" />
        </div>
        <span className="font-medium">{title}</span>
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <Check className={`mt-0.5 size-4 shrink-0 ${tone}`} />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">Feedback will appear when analysis is complete.</p>
      )}
    </GlassCard>
  )
}
