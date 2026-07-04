import type { Metadata } from 'next'
import { AppShell } from '@/components/app/app-shell'
import { ProfileView } from '@/components/profile/profile-view'

export const metadata: Metadata = {
  title: 'Profile — NeuroHire AI',
  description: 'Manage your NeuroHire AI account and interview preferences.',
}

export default function ProfilePage() {
  return (
    <AppShell title="Profile">
      <ProfileView />
    </AppShell>
  )
}
