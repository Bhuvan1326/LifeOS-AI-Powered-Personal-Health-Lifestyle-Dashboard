"use client"

import { Decision, DecisionStatus } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { 
  CheckCircle2, 
  Activity, 
  Clock, 
  AlertTriangle, 
  XCircle,
  ArrowRight,
  Apple,
  Dumbbell,
  Moon,
  Brain,
  Heart,
  Stethoscope
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const statusConfig: Record<DecisionStatus, { label: string; icon: typeof CheckCircle2; color: string; bgColor: string }> = {
  fresh: { label: "Fresh", icon: CheckCircle2, color: "text-[oklch(0.65_0.18_145)]", bgColor: "bg-[oklch(0.65_0.18_145/0.1)]" },
  stable: { label: "Stable", icon: Activity, color: "text-[oklch(0.55_0.15_160)]", bgColor: "bg-[oklch(0.55_0.15_160/0.1)]" },
  at_risk: { label: "At Risk", icon: Clock, color: "text-[oklch(0.7_0.18_65)]", bgColor: "bg-[oklch(0.7_0.18_65/0.1)]" },
  stale: { label: "Stale", icon: AlertTriangle, color: "text-[oklch(0.6_0.15_35)]", bgColor: "bg-[oklch(0.6_0.15_35/0.1)]" },
  invalidated: { label: "Invalidated", icon: XCircle, color: "text-[oklch(0.55_0.2_25)]", bgColor: "bg-[oklch(0.55_0.2_25/0.1)]" },
}

const categoryIcons = {
  nutrition: Apple,
  fitness: Dumbbell,
  sleep: Moon,
  mental_health: Brain,
  lifestyle: Heart,
  medical: Stethoscope,
}

interface DecisionCardProps {
  decision: Decision
}

export function DecisionCard({ decision }: DecisionCardProps) {
  const status = statusConfig[decision.status]
  const StatusIcon = status.icon
  const CategoryIcon = categoryIcons[decision.category] || Apple

  return (
    <Link href={`/decisions/${decision.id}`}>
      <Card className="group hover:border-primary/30 transition-all duration-300 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CategoryIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                  {decision.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground capitalize">
                  {decision.category.replace("_", " ")} • {decision.decision_type}
                </p>
              </div>
            </div>
            <Badge className={`${status.bgColor} ${status.color} border-0`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {decision.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {decision.description}
            </p>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium">{decision.current_confidence}%</span>
            </div>
            <Progress value={decision.current_confidence} className="h-2" />
            {decision.initial_confidence !== decision.current_confidence && (
              <p className="text-xs text-muted-foreground">
                Started at {decision.initial_confidence}% • {decision.initial_confidence - decision.current_confidence > 0 ? "Decreased" : "Increased"} by {Math.abs(decision.initial_confidence - decision.current_confidence)}%
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              Last reviewed {formatDistanceToNow(new Date(decision.last_reviewed_at), { addSuffix: true })}
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

interface DecisionStatsProps {
  decisions: Decision[]
}

export function DecisionStats({ decisions }: DecisionStatsProps) {
  const stats = {
    total: decisions.length,
    fresh: decisions.filter(d => d.status === "fresh").length,
    stable: decisions.filter(d => d.status === "stable").length,
    at_risk: decisions.filter(d => d.status === "at_risk").length,
    stale: decisions.filter(d => d.status === "stale").length,
    invalidated: decisions.filter(d => d.status === "invalidated").length,
    avgConfidence: decisions.length > 0 
      ? Math.round(decisions.reduce((sum, d) => sum + d.current_confidence, 0) / decisions.length)
      : 0,
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-sm text-muted-foreground">Total Decisions</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-[oklch(0.65_0.18_145)]">{stats.fresh + stats.stable}</div>
          <p className="text-sm text-muted-foreground">Healthy</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-[oklch(0.7_0.18_65)]">{stats.at_risk + stats.stale}</div>
          <p className="text-sm text-muted-foreground">Need Review</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.avgConfidence}%</div>
          <p className="text-sm text-muted-foreground">Avg Confidence</p>
        </CardContent>
      </Card>
    </div>
  )
}
