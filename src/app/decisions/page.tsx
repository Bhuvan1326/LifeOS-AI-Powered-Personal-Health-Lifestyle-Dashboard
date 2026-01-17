import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { DecisionCard } from "@/components/decision-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Search, Filter } from "lucide-react"
import { Decision } from "@/lib/types"
import { redirect } from "next/navigation"
import { DecisionFilters } from "./filters"

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

export default async function DecisionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  const decisions = await getDecisions(user.id)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">All Decisions</h1>
              <p className="text-muted-foreground mt-1">
                View and manage all your health decisions
              </p>
            </div>
            <Link href="/decisions/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Decision
              </Button>
            </Link>
          </div>

          <DecisionFilters decisions={decisions} />
        </div>
      </main>
    </div>
  )
}
