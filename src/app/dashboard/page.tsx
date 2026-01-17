import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { DecisionCard, DecisionStats } from "@/components/decision-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Sparkles, AlertTriangle, TrendingDown, RefreshCw } from "lucide-react"
import { Decision, Insight } from "@/lib/types"
import { redirect } from "next/navigation"

async function getDecisions(userId: string): Promise<Decision[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching decisions:", error)
    return []
  }

  return data || []
}

async function getInsights(userId: string): Promise<Insight[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("insights")
    .select("*, decisions!inner(*)")
    .eq("decisions.user_id", userId)
    .eq("is_dismissed", false)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching insights:", error)
    return []
  }

  return data || []
}

export default async function DashboardPage() {
  const supabase = await createClient()
  // Use getSession (local JWT check) instead of getUser (network call)
  // Middleware already verified the user, so this is just to get the user ID
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect("/auth/signin")
  }
  
  const user = session.user

  const decisions = await getDecisions(user.id)
  const insights = await getInsights(user.id)
  
  const needsAttention = decisions.filter(d => d.status === "at_risk" || d.status === "stale")
  const recentDecisions = decisions.slice(0, 6)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Track and manage your health decisions
              </p>
            </div>
            <Link href="/decisions/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Decision
              </Button>
            </Link>
          </div>

          <DecisionStats decisions={decisions} />

          {needsAttention.length > 0 && (
            <Card className="border-[oklch(0.7_0.18_65/0.5)] bg-[oklch(0.7_0.18_65/0.05)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-[oklch(0.7_0.18_65)]" />
                  Decisions Needing Attention
                </CardTitle>
                <CardDescription>
                  These decisions may need your review based on time or confidence decay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {needsAttention.slice(0, 3).map((decision) => (
                    <DecisionCard key={decision.id} decision={decision} />
                  ))}
                </div>
                {needsAttention.length > 3 && (
                  <Link href="/decisions?filter=needs_review" className="block mt-4">
                    <Button variant="outline" className="w-full">
                      View all {needsAttention.length} decisions needing attention
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Insights
                </CardTitle>
                <CardDescription>
                  Personalized recommendations based on your decision patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div 
                      key={insight.id}
                      className={`p-4 rounded-lg border ${
                        insight.severity === "critical" 
                          ? "bg-destructive/5 border-destructive/20" 
                          : insight.severity === "warning"
                          ? "bg-[oklch(0.7_0.18_65/0.05)] border-[oklch(0.7_0.18_65/0.2)]"
                          : "bg-muted/50 border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {insight.insight_type === "confidence_decay" && <TrendingDown className="w-5 h-5 text-[oklch(0.7_0.18_65)] mt-0.5" />}
                        {insight.insight_type === "needs_review" && <RefreshCw className="w-5 h-5 text-primary mt-0.5" />}
                        {!["confidence_decay", "needs_review"].includes(insight.insight_type) && <Sparkles className="w-5 h-5 text-primary mt-0.5" />}
                        <div>
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Decisions</h2>
              {decisions.length > 6 && (
                <Link href="/decisions">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
              )}
            </div>
            
            {recentDecisions.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentDecisions.map((decision) => (
                  <DecisionCard key={decision.id} decision={decision} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No decisions yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start tracking your health and nutrition decisions to get AI-powered insights and recommendations.
                  </p>
                  <Link href="/decisions/new">
                    <Button>Create Your First Decision</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
