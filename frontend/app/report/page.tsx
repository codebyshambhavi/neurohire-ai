import type { Metadata } from "next"
import { AppShell } from "@/components/app/app-shell"
import { ReportView } from "@/components/report/report-view"

export const metadata: Metadata = {
  title: "Analysis Report — NeuroHire AI",
  description: "Detailed multimodal AI analysis of your interview performance.",
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ interviewId?: string }>
}) {
  const { interviewId } = await searchParams

  return (
    <AppShell>
      <ReportView interviewId={interviewId ?? null} />
    </AppShell>
  )
}
