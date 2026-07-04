'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Plus, FileBarChart, User, Video, LogOut, Sparkles } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Create Interview', href: '/interview/create', icon: Plus },
  { label: 'Interview Room', href: '/interview', icon: Video },
  { label: 'Analysis Report', href: '/report', icon: FileBarChart },
  { label: 'Profile', href: '/profile', icon: User },
]

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <Link href="/" className="px-2 py-2">
        <Logo />
      </Link>

      <nav className="mt-2 flex flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="size-4 text-primary" />
            Upgrade to Pro
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Unlock unlimited interviews and full multimodal analysis.
          </p>
          <Button size="sm" className="mt-3 w-full" asChild>
            <Link href="/#pricing">View plans</Link>
          </Button>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4.5" />
          Sign out
        </Link>
      </div>
    </div>
  )
}
