'use client'

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import { Bell, Menu, Plus, Search, X } from 'lucide-react'
import { AppSidebar } from '@/components/app/sidebar'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

export function AppShell({
  children,
  title,
}: {
  children: ReactNode
  title?: string
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    api.me()
      .then(setUser)
      .catch(console.error)
  }, [])

  const initials =
    user?.full_name
      ?.split(' ')
      .map((word: string) => word[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-sidebar lg:block">
        <AppSidebar />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-sidebar lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>

            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>


          {title && (
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h1>
          )}


          <div className="ml-auto flex items-center gap-2">

            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                placeholder="Search..."
                className="h-9 w-52 rounded-lg border border-input bg-input/40 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary/60"
              />
            </div>


            <Button variant="outline" size="icon" aria-label="Notifications">
              <Bell className="size-4" />
            </Button>


            <Button size="lg" className="hidden sm:inline-flex" asChild>
              <Link href="/interview/create">
                <Plus className="size-4" />
                New Interview
              </Link>
            </Button>


            <Link
              href="/profile"
              className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary ring-1 ring-primary/25"
              aria-label="Profile"
            >
              {initials}
            </Link>

          </div>
        </header>


        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>

      </div>
    </div>
  )
}