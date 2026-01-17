"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Apple, 
  Dumbbell, 
  Moon, 
  Brain, 
  Heart, 
  Stethoscope,
  Sparkles,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { DecisionCategory, RiskLevel, ImpactLevel } from "@/lib/types"

const categories: { value: DecisionCategory; label: string; icon: typeof Apple }[] = [
  { value: "nutrition", label: "Nutrition", icon: Apple },
  { value: "fitness", label: "Fitness", icon: Dumbbell },
  { value: "sleep", label: "Sleep", icon: Moon },
  { value: "mental_health", label: "Mental Health", icon: Brain },
  { value: "lifestyle", label: "Lifestyle", icon: Heart },
  { value: "medical", label: "Medical", icon: Stethoscope },
]

const decisionTypes = [
  "Diet Change",
  "Supplement",
  "Meal Plan",
  "Exercise Routine",
  "Sleep Schedule",
  "Stress Management",
  "Medical Treatment",
  "Habit Formation",
  "Other",
]

const riskLevels: { value: RiskLevel; label: string; description: string }[] = [
  { value: "low", label: "Low", description: "Minimal potential negative impact" },
  { value: "medium", label: "Medium", description: "Some potential for negative outcomes" },
  { value: "high", label: "High", description: "Significant potential consequences" },
  { value: "critical", label: "Critical", description: "Major health implications" },
]

const impactLevels: { value: ImpactLevel; label: string; description: string }[] = [
  { value: "low", label: "Low", description: "Minor effect on overall health" },
  { value: "medium", label: "Medium", description: "Moderate effect on health goals" },
  { value: "high", label: "High", description: "Significant impact on wellbeing" },
  { value: "critical", label: "Critical", description: "Transformative health change" },
]

export default function NewDecisionPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<DecisionCategory>("nutrition")
  const [decisionType, setDecisionType] = useState("")
  const [confidence, setConfidence] = useState(75)
  const [risk, setRisk] = useState<RiskLevel>("medium")
  const [impact, setImpact] = useState<ImpactLevel>("medium")
  const [context, setContext] = useState("")
  const [reasoning, setReasoning] = useState("")
  const [assumptions, setAssumptions] = useState<string[]>([""])
  const [deadline, setDeadline] = useState("")

  function addAssumption() {
    setAssumptions([...assumptions, ""])
  }

  function removeAssumption(index: number) {
    setAssumptions(assumptions.filter((_, i) => i !== index))
  }

  function updateAssumption(index: number, value: string) {
    const updated = [...assumptions]
    updated[index] = value
    setAssumptions(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/signin")
        return
      }

      const { data: decision, error: decisionError } = await supabase
        .from("decisions")
        .insert({
          user_id: user.id,
          title,
          description: description || null,
          category,
          decision_type: decisionType,
          initial_confidence: confidence,
          current_confidence: confidence,
          perceived_risk: risk,
          perceived_impact: impact,
          context: context || null,
          reasoning: reasoning || null,
          deadline: deadline || null,
          status: "fresh",
        })
        .select()
        .single()

      if (decisionError) throw decisionError

      const validAssumptions = assumptions.filter(a => a.trim())
      if (validAssumptions.length > 0) {
        const { error: assumptionsError } = await supabase
          .from("assumptions")
          .insert(
            validAssumptions.map(content => ({
              decision_id: decision.id,
              content,
            }))
          )
        if (assumptionsError) console.error("Error creating assumptions:", assumptionsError)
      }

      const { error: eventError } = await supabase
        .from("decision_events")
        .insert({
          decision_id: decision.id,
          event_type: "created",
          description: "Decision was created",
          new_status: "fresh",
        })
      if (eventError) console.error("Error creating event:", eventError)

      router.push(`/decisions/${decision.id}`)
    } catch (err) {
      console.error("Error creating decision:", err)
      setError("Failed to create decision. Please try again.")
      setLoading(false)
    }
  }

  const CategoryIcon = categories.find(c => c.value === category)?.icon || Apple

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">New Health Decision</h1>
            <p className="text-muted-foreground mt-1">
              Record a new health or nutrition decision to track over time
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>What decision are you making?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Decision Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Switch to Mediterranean diet"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your decision in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as DecisionCategory)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className="w-4 h-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Decision Type *</Label>
                    <Select value={decisionType} onValueChange={setDecisionType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {decisionTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Confidence Level
                </CardTitle>
                <CardDescription>How confident are you in this decision?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Low confidence</span>
                    <span className="text-2xl font-bold">{confidence}%</span>
                    <span className="text-sm text-muted-foreground">High confidence</span>
                  </div>
                  <Slider
                    value={[confidence]}
                    onValueChange={(v) => setConfidence(v[0])}
                    min={0}
                    max={100}
                    step={5}
                    className="py-4"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    {confidence < 40 && "You have significant doubts about this decision"}
                    {confidence >= 40 && confidence < 70 && "You're moderately confident in this decision"}
                    {confidence >= 70 && confidence < 90 && "You're fairly confident this is the right choice"}
                    {confidence >= 90 && "You're highly confident in this decision"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk & Impact Assessment</CardTitle>
                <CardDescription>Evaluate the potential consequences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Perceived Risk</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {riskLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setRisk(level.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          risk === level.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium text-sm">{level.label}</div>
                        <div className="text-xs text-muted-foreground">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Perceived Impact</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {impactLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setImpact(level.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          impact === level.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-medium text-sm">{level.label}</div>
                        <div className="text-xs text-muted-foreground">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Context & Reasoning</CardTitle>
                <CardDescription>Help your future self understand this decision</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="context">Context</Label>
                  <Textarea
                    id="context"
                    placeholder="What circumstances led to this decision? What's your current situation?"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasoning">Reasoning</Label>
                  <Textarea
                    id="reasoning"
                    placeholder="Why did you choose this option? What factors influenced your decision?"
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Target Date (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Assumptions</CardTitle>
                <CardDescription>What conditions must hold true for this decision to be valid?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {assumptions.map((assumption, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Assumption ${index + 1}, e.g., "I have access to fresh produce"`}
                      value={assumption}
                      onChange={(e) => updateAssumption(index, e.target.value)}
                    />
                    {assumptions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAssumption(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAssumption}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Assumption
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={loading || !title || !decisionType}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4" />
                    Create Decision
                  </span>
                )}
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
