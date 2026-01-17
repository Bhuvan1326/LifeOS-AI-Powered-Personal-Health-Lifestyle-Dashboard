"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { 
  ArrowLeft, 
  CheckCircle2, 
  Activity, 
  Clock, 
  AlertTriangle, 
  XCircle,
  Apple,
  Dumbbell,
  Moon,
  Brain,
  Heart,
  Stethoscope,
  Calendar,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Check,
  Sparkles,
  Edit,
  Trash2
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { Decision, DecisionStatus, Assumption, DecisionEvent, Insight, DecisionCategory } from "@/lib/types"
import { use } from "react"

const statusConfig: Record<DecisionStatus, { label: string; icon: typeof CheckCircle2; color: string; bgColor: string; description: string }> = {
  fresh: { label: "Fresh", icon: CheckCircle2, color: "text-[oklch(0.65_0.18_145)]", bgColor: "bg-[oklch(0.65_0.18_145/0.1)]", description: "Recently made, actively monitored" },
  stable: { label: "Stable", icon: Activity, color: "text-[oklch(0.55_0.15_160)]", bgColor: "bg-[oklch(0.55_0.15_160/0.1)]", description: "Proven reliable over time" },
  at_risk: { label: "At Risk", icon: Clock, color: "text-[oklch(0.7_0.18_65)]", bgColor: "bg-[oklch(0.7_0.18_65/0.1)]", description: "May need review soon" },
  stale: { label: "Stale", icon: AlertTriangle, color: "text-[oklch(0.6_0.15_35)]", bgColor: "bg-[oklch(0.6_0.15_35/0.1)]", description: "Needs immediate attention" },
  invalidated: { label: "Invalidated", icon: XCircle, color: "text-[oklch(0.55_0.2_25)]", bgColor: "bg-[oklch(0.55_0.2_25/0.1)]", description: "No longer valid" },
}

const categoryIcons: Record<DecisionCategory, typeof Apple> = {
  nutrition: Apple,
  fitness: Dumbbell,
  sleep: Moon,
  mental_health: Brain,
  lifestyle: Heart,
  medical: Stethoscope,
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DecisionDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  
  const [decision, setDecision] = useState<Decision | null>(null)
  const [assumptions, setAssumptions] = useState<Assumption[]>([])
  const [events, setEvents] = useState<DecisionEvent[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [newConfidence, setNewConfidence] = useState(0)
  const [reviewNotes, setReviewNotes] = useState("")
  const [reviewAction, setReviewAction] = useState<"reaffirm" | "revise" | "invalidate">("reaffirm")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadDecision() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/signin")
        return
      }

      const [decisionRes, assumptionsRes, eventsRes, insightsRes] = await Promise.all([
        supabase.from("decisions").select("*").eq("id", id).single(),
        supabase.from("assumptions").select("*").eq("decision_id", id).order("created_at"),
        supabase.from("decision_events").select("*").eq("decision_id", id).order("created_at", { ascending: false }),
        supabase.from("insights").select("*").eq("decision_id", id).eq("is_dismissed", false).order("created_at", { ascending: false }),
      ])

      if (decisionRes.error || !decisionRes.data) {
        router.push("/dashboard")
        return
      }

      setDecision(decisionRes.data)
      setNewConfidence(decisionRes.data.current_confidence)
      setAssumptions(assumptionsRes.data || [])
      setEvents(eventsRes.data || [])
      setInsights(insightsRes.data || [])
      setLoading(false)
    }

    loadDecision()
  }, [id, router, supabase])

  async function handleReview() {
    if (!decision) return
    setSubmitting(true)

    const updates: Partial<Decision> = {
      last_reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    let eventType = ""
    let eventDescription = ""
    let newStatus: DecisionStatus = decision.status

    if (reviewAction === "reaffirm") {
      eventType = "reaffirmed"
      eventDescription = reviewNotes || "Decision was reaffirmed"
      updates.current_confidence = newConfidence
      if (decision.status === "at_risk" || decision.status === "stale") {
        newStatus = "stable"
      }
    } else if (reviewAction === "revise") {
      eventType = "revised"
      eventDescription = reviewNotes || "Decision was revised"
      updates.current_confidence = newConfidence
      newStatus = "fresh"
    } else if (reviewAction === "invalidate") {
      eventType = "invalidated"
      eventDescription = reviewNotes || "Decision was invalidated"
      newStatus = "invalidated"
      updates.current_confidence = 0
    }

    updates.status = newStatus

    await supabase.from("decisions").update(updates).eq("id", decision.id)

    await supabase.from("decision_events").insert({
      decision_id: decision.id,
      event_type: eventType,
      description: eventDescription,
      confidence_change: newConfidence - decision.current_confidence,
      previous_status: decision.status,
      new_status: newStatus,
    })

    setDecision({ ...decision, ...updates } as Decision)
    setEvents([{
      id: crypto.randomUUID(),
      decision_id: decision.id,
      event_type: eventType,
      description: eventDescription,
      confidence_change: newConfidence - decision.current_confidence,
      previous_status: decision.status,
      new_status: newStatus,
      metadata: {},
      created_at: new Date().toISOString(),
    }, ...events])
    
    setReviewDialogOpen(false)
    setReviewNotes("")
    setSubmitting(false)
  }

  async function handleValidateAssumption(assumptionId: string) {
    await supabase.from("assumptions").update({
      is_validated: true,
      validation_date: new Date().toISOString(),
    }).eq("id", assumptionId)

    setAssumptions(assumptions.map(a => 
      a.id === assumptionId ? { ...a, is_validated: true, validation_date: new Date().toISOString() } : a
    ))
  }

  async function handleDismissInsight(insightId: string) {
    await supabase.from("insights").update({ is_dismissed: true }).eq("id", insightId)
    setInsights(insights.filter(i => i.id !== insightId))
  }

  if (loading || !decision) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-64 bg-muted rounded" />
              <div className="h-64 bg-muted rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  const status = statusConfig[decision.status]
  const StatusIcon = status.icon
  const CategoryIcon = categoryIcons[decision.category] || Apple
  const confidenceChange = decision.current_confidence - decision.initial_confidence

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CategoryIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{decision.title}</h1>
                  <p className="text-sm text-muted-foreground capitalize">
                    {decision.category.replace("_", " ")} • {decision.decision_type}
                  </p>
                </div>
              </div>
            </div>
            <Badge className={`${status.bgColor} ${status.color} border-0 text-sm px-3 py-1`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {status.label}
            </Badge>
          </div>

          {decision.description && (
            <p className="text-muted-foreground">{decision.description}</p>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Confidence Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold">{decision.current_confidence}%</span>
                  {confidenceChange !== 0 && (
                    <div className={`flex items-center gap-1 text-sm ${
                      confidenceChange > 0 ? "text-[oklch(0.65_0.18_145)]" : "text-[oklch(0.55_0.2_25)]"
                    }`}>
                      {confidenceChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {confidenceChange > 0 ? "+" : ""}{confidenceChange}% since start
                    </div>
                  )}
                </div>
                <Progress value={decision.current_confidence} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Started at {decision.initial_confidence}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Decision Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-lg ${status.bgColor}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusIcon className={`w-5 h-5 ${status.color}`} />
                    <span className={`font-medium ${status.color}`}>{status.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{status.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Risk Level</p>
                    <p className="font-medium capitalize">{decision.perceived_risk}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Impact Level</p>
                    <p className="font-medium capitalize">{decision.perceived_impact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Review Decision
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Review Decision</DialogTitle>
                  <DialogDescription>
                    Update your confidence level and decide how to proceed
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">New Confidence Level</span>
                      <span className="text-lg font-bold">{newConfidence}%</span>
                    </div>
                    <Slider
                      value={[newConfidence]}
                      onValueChange={(v) => setNewConfidence(v[0])}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Action</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "reaffirm", label: "Reaffirm", icon: Check },
                        { value: "revise", label: "Revise", icon: Edit },
                        { value: "invalidate", label: "Invalidate", icon: Trash2 },
                      ].map((action) => (
                        <button
                          key={action.value}
                          onClick={() => setReviewAction(action.value as typeof reviewAction)}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            reviewAction === action.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <action.icon className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-xs">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Notes (Optional)</span>
                    <Textarea
                      placeholder="Why are you making this change?"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleReview} disabled={submitting}>
                    {submitting ? "Saving..." : "Save Review"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((insight) => (
                  <div 
                    key={insight.id}
                    className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
                      insight.severity === "critical" 
                        ? "bg-destructive/5 border-destructive/20" 
                        : insight.severity === "warning"
                        ? "bg-[oklch(0.7_0.18_65/0.05)] border-[oklch(0.7_0.18_65/0.2)]"
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    <div>
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDismissInsight(insight.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {(decision.context || decision.reasoning) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Context & Reasoning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {decision.context && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Context</h4>
                    <p className="text-sm text-muted-foreground">{decision.context}</p>
                  </div>
                )}
                {decision.reasoning && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Reasoning</h4>
                    <p className="text-sm text-muted-foreground">{decision.reasoning}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {assumptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Assumptions</CardTitle>
                <CardDescription>
                  Conditions that must hold true for this decision to remain valid
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {assumptions.map((assumption) => (
                  <div 
                    key={assumption.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        assumption.is_validated 
                          ? "bg-[oklch(0.65_0.18_145/0.1)]" 
                          : "bg-muted"
                      }`}>
                        {assumption.is_validated && <Check className="w-4 h-4 text-[oklch(0.65_0.18_145)]" />}
                      </div>
                      <span className={assumption.is_validated ? "" : "text-muted-foreground"}>
                        {assumption.content}
                      </span>
                    </div>
                    {!assumption.is_validated && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleValidateAssumption(assumption.id)}
                      >
                        Validate
                      </Button>
                    )}
                    {assumption.is_validated && assumption.validation_date && (
                      <span className="text-xs text-muted-foreground">
                        Validated {formatDistanceToNow(new Date(assumption.validation_date), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        event.event_type === "created" ? "bg-primary/10" :
                        event.event_type === "reaffirmed" ? "bg-[oklch(0.65_0.18_145/0.1)]" :
                        event.event_type === "revised" ? "bg-[oklch(0.7_0.18_65/0.1)]" :
                        event.event_type === "invalidated" ? "bg-destructive/10" :
                        "bg-muted"
                      }`}>
                        {event.event_type === "created" && <Sparkles className="w-4 h-4 text-primary" />}
                        {event.event_type === "reaffirmed" && <Check className="w-4 h-4 text-[oklch(0.65_0.18_145)]" />}
                        {event.event_type === "revised" && <Edit className="w-4 h-4 text-[oklch(0.7_0.18_65)]" />}
                        {event.event_type === "invalidated" && <XCircle className="w-4 h-4 text-destructive" />}
                      </div>
                      {index < events.length - 1 && <div className="w-px h-full bg-border mt-2" />}
                    </div>
                    <div className="pb-6">
                      <p className="font-medium text-sm capitalize">{event.event_type.replace("_", " ")}</p>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                      {event.confidence_change !== 0 && (
                        <p className={`text-xs mt-1 ${
                          event.confidence_change > 0 ? "text-[oklch(0.65_0.18_145)]" : "text-[oklch(0.55_0.2_25)]"
                        }`}>
                          Confidence: {event.confidence_change > 0 ? "+" : ""}{event.confidence_change}%
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(event.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            Created {format(new Date(decision.created_at), "MMMM d, yyyy")} • 
            Last reviewed {formatDistanceToNow(new Date(decision.last_reviewed_at), { addSuffix: true })}
          </div>
        </div>
      </main>
    </div>
  )
}
