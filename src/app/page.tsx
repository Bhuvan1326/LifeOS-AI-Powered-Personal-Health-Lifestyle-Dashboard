import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Leaf, 
  Activity, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Decivue</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-chart-2/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Decision Intelligence
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
              Track Your Health Decisions{" "}
              <span className="text-primary">Before They Go Stale</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Decivue helps you record nutrition and health choices, track their confidence over time, 
              and get AI-powered alerts when decisions need your attention.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="h-14 px-8 text-lg">
                  Start Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: CheckCircle2, label: "Fresh", value: "85%", color: "text-[oklch(0.65_0.18_145)]" },
              { icon: Activity, label: "Stable", value: "12%", color: "text-[oklch(0.55_0.15_160)]" },
              { icon: Clock, label: "At Risk", value: "2%", color: "text-[oklch(0.7_0.18_65)]" },
              { icon: AlertTriangle, label: "Needs Review", value: "1%", color: "text-[oklch(0.6_0.15_35)]" },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="p-6 rounded-2xl bg-card border border-border/50 text-center"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Decision Intelligence for Your Health
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stop making the same nutrition mistakes. Decivue tracks your health decisions 
              and helps you understand when they need attention.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Decision Lifecycle",
                description: "Watch your decisions evolve from Fresh to Stable to At Risk. Understand when choices need review before they become problems.",
                features: ["Time-aware tracking", "Confidence decay", "Automatic status updates"]
              },
              {
                icon: TrendingUp,
                title: "Health Insights",
                description: "AI-powered analysis identifies patterns in your nutrition decisions and suggests when to revisit your choices.",
                features: ["Pattern detection", "Personalized alerts", "Actionable recommendations"]
              },
              {
                icon: Shield,
                title: "Assumption Tracking",
                description: "Record the assumptions behind each decision. When conditions change, you'll know which decisions to reconsider.",
                features: ["Assumption validation", "Conflict detection", "Dependency mapping"]
              },
            ].map((feature, i) => (
              <div 
                key={i}
                className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              How Decivue Works
            </h2>

            <div className="space-y-12">
              {[
                {
                  step: "01",
                  title: "Record Your Decision",
                  description: "Log health and nutrition decisions with context, assumptions, and your initial confidence level. Decivue captures the reasoning behind each choice."
                },
                {
                  step: "02",
                  title: "Track Over Time",
                  description: "Watch as your decisions move through their lifecycle. Confidence naturally decays over time, and Decivue monitors for signs of instability."
                },
                {
                  step: "03",
                  title: "Get Timely Alerts",
                  description: "Receive AI-powered insights when a decision needs review. Decivue prompts you to revisit, revise, or reaffirm before problems emerge."
                },
                {
                  step: "04",
                  title: "Make Better Choices",
                  description: "Use historical patterns and conflict detection to make informed decisions. Learn from past choices and avoid repeating mistakes."
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-8 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Making Better Health Decisions Today
          </h2>
          <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto">
            Join Decivue and never let a health decision quietly become wrong again. 
            Track, analyze, and optimize your nutrition choices with AI-powered intelligence.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Decivue</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Decision Intelligence for Personal Health & Nutrition
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
