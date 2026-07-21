'use client'

import { useEffect, useState } from 'react'
import { Mail, Trophy } from 'lucide-react'
import { achievements } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ScoreRing } from '@/components/score-ring'
import { cn } from '@/lib/utils'
import { api, type User } from '@/lib/api'

export function ProfileView() {
  const [user, setUser] = useState<User | null>(null)
  const [dashboard, setDashboard] = useState<any>(null)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Interview Candidate')

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, dashboardData] = await Promise.all([
          api.me(),
          api.dashboard(),
        ])

        setUser(userData)
        setDashboard(dashboardData)

        setName(userData.full_name)
        setEmail(userData.email)
      } catch (err) {
        console.error(err)
      }
    }

    loadData()
  }, [])

  async function handleSave() {
    if (!user) return

    try {
      setSaving(true)

      const updatedUser = await api.updateProfile({
        full_name: name,
        target_role: role,
      })

      setUser(updatedUser)
      setName(updatedUser.full_name)
      setEmail(updatedUser.email)

      setEditing(false)
    } catch (err) {
      console.error(err)
      alert('Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const initials =
    user?.full_name
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'U'

  const latestScore = dashboard?.performance?.at(-1)?.score ?? 0

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
                {role}
              </p>

              <Badge className="mt-2">
                Free Plan
              </Badge>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-border bg-card/50 p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Current NeuroScore
          </h3>

          <div className="mt-4">
            <ScoreRing
              value={latestScore}
              size={168}
              label="NeuroScore"
              suffix=""
            />
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Based on your latest analyzed interview.
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
                <Label>Full name</Label>

                <Input
                  value={name}
                  disabled={!editing}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Target role</Label>

                <Input
                  value={role}
                  disabled={!editing}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Email</Label>

              <Input
                value={email}
                disabled
              />
            </div>

            <div className="mt-2 flex gap-3">
              {editing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setName(user?.full_name ?? '')
                      setEmail(user?.email ?? '')
                      setRole('Interview Candidate')
                      setEditing(false)
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>
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