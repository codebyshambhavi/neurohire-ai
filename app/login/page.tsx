import type { Metadata } from 'next'
import { AuthBranding } from '@/components/auth/auth-branding'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Sign in — NeuroHire AI',
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <AuthBranding />
      <AuthForm mode="login" />
    </main>
  )
}
