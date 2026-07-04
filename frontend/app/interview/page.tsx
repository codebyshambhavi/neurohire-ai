import type { Metadata } from 'next'
import { InterviewRoom } from '@/components/interview/interview-room'

export const metadata: Metadata = {
  title: 'Interview Room — NeuroHire AI',
  description: 'Your live AI-powered mock interview session.',
}

export default async function InterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ interviewId?: string }>
}) {
  const { interviewId } = await searchParams

  return <InterviewRoom interviewId={interviewId ?? null} />
}
