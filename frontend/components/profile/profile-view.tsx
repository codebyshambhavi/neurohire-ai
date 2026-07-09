'use client'

import { useEffect, useState } from 'react'
import { Mail, MapPin, Trophy } from 'lucide-react'
import { achievements } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ScoreRing } from '@/components/score-ring'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

export function ProfileView() {
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
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/15 text-xl font-semibold text-primary ring-1 ring-primary/25">
              {initials}
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {user?.full_name || 'User'}
              </h2>

              <p className="text-sm text-muted-foreground">
                ML Engineer · Professional
              </p>

              <Badge className="mt-2">Pro plan</Badge>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" />
              <span>{user?.email || ''}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              <span>San Francisco, CA</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-border bg-card/50 p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Current NeuroScore
          </h3>

          <div className="mt-4">
            <ScoreRing value={86} size={168} label="NeuroScore" suffix="" />
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Based on your last 12 mock interviews.
          </p>
        </div>
      </div>


      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-card/50 p-6">

          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Account settings
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Update your profile details for personalized interview prep.
          </p>


          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(e) => e.preventDefault()}
          >

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  value={user?.full_name || ''}
                  readOnly
                />
              </div>


              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-role">Target role</Label>

                <Input
                  id="profile-role"
                  defaultValue="ML Engineer"
                />
              </div>

            </div>


            <div className="flex flex-col gap-2">

              <Label htmlFor="profile-email">
                Email
              </Label>

              <Input
                id="profile-email"
                type="email"
                value={user?.email || ''}
                readOnly
              />

            </div>


            <Button type="submit" className="mt-2 self-start">
              Save changes
            </Button>

          </form>
        </div>


        <div className="rounded-2xl border border-border bg-card/50 p-6">

          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-primary" />

            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Achievements
            </h3>
          </div>


          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {achievements.map((item) => (
              <li
                key={item.title}
                className={cn(
                  'rounded-xl border border-border p-4',
                  item.unlocked
                    ? 'bg-background/40'
                    : 'opacity-50',
                )}
              >
                <p className="text-sm font-medium text-foreground">
                  {item.title}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>

              </li>
            ))}
          </ul>

        </div>

      </div>
    </div>
  )
}