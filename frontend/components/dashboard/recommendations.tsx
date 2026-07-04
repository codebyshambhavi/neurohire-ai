import { Sparkles, ArrowRight } from 'lucide-react'
import { recommendations } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'

export function Recommendations() {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-6">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="size-4" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-foreground">AI Recommendations</h3>
          <p className="text-xs text-muted-foreground">Personalized next steps</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {recommendations.map((rec) => (
          <div
            key={rec.title}
            className="group rounded-xl border border-border bg-background/40 p-4 transition-colors hover:border-primary/30"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">{rec.title}</h4>
              <Badge variant="muted">{rec.tag}</Badge>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{rec.detail}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Generate practice plan
        <ArrowRight className="size-4" />
      </button>
    </div>
  )
}
