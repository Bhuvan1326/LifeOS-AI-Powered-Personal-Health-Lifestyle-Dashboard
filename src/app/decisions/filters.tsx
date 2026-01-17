"use client"

import { useState } from "react"
import { Decision, DecisionCategory, DecisionStatus } from "@/lib/types"
import { DecisionCard } from "@/components/decision-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter,
  X,
  Apple,
  Dumbbell,
  Moon,
  Brain,
  Heart,
  Stethoscope,
  Plus
} from "lucide-react"
import Link from "next/link"

const categories: { value: DecisionCategory | "all"; label: string; icon?: typeof Apple }[] = [
  { value: "all", label: "All" },
  { value: "nutrition", label: "Nutrition", icon: Apple },
  { value: "fitness", label: "Fitness", icon: Dumbbell },
  { value: "sleep", label: "Sleep", icon: Moon },
  { value: "mental_health", label: "Mental Health", icon: Brain },
  { value: "lifestyle", label: "Lifestyle", icon: Heart },
  { value: "medical", label: "Medical", icon: Stethoscope },
]

const statuses: { value: DecisionStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "fresh", label: "Fresh" },
  { value: "stable", label: "Stable" },
  { value: "at_risk", label: "At Risk" },
  { value: "stale", label: "Stale" },
  { value: "invalidated", label: "Invalidated" },
]

interface DecisionFiltersProps {
  decisions: Decision[]
}

export function DecisionFilters({ decisions }: DecisionFiltersProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<DecisionCategory | "all">("all")
  const [selectedStatus, setSelectedStatus] = useState<DecisionStatus | "all">("all")

  const filteredDecisions = decisions.filter(decision => {
    const matchesSearch = search === "" || 
      decision.title.toLowerCase().includes(search.toLowerCase()) ||
      decision.description?.toLowerCase().includes(search.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || decision.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || decision.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const hasFilters = search !== "" || selectedCategory !== "all" || selectedStatus !== "all"

  function clearFilters() {
    setSearch("")
    setSelectedCategory("all")
    setSelectedStatus("all")
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search decisions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as DecisionStatus | "all")}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className="gap-1"
            >
              {cat.icon && <cat.icon className="w-3 h-3" />}
              {cat.label}
            </Button>
          ))}
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredDecisions.length} of {decisions.length} decisions
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="w-3 h-3" />
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {filteredDecisions.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecisions.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="max-w-sm mx-auto">
            {decisions.length === 0 ? (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No decisions yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start tracking your health and nutrition decisions.
                </p>
                <Link href="/decisions/new">
                  <Button>Create Your First Decision</Button>
                </Link>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No matching decisions</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters to find what you&apos;re looking for.
                </p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </>
            )}
          </div>
        </Card>
      )}
    </>
  )
}
