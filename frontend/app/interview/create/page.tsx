import type { Metadata } from 'next'
import { AppShell } from '@/components/app/app-shell'
import { CreateInterview } from '@/components/interview/create-interview'

export const metadata: Metadata = {
  title: 'Create Interview — NeuroHire AI',
}

export default function CreateInterviewPage() {
  return (
    <AppShell title="Create Interview">
      <div className="mb-6">
        <p className="max-w-xl text-muted-foreground">
          Configure your mock interview. Our AI adapts questions to your role, experience, and
          difficulty, then analyzes every answer across voice, vision, and language.
        </p>
      </div>
      <CreateInterview />
    </AppShell>
  )
}
