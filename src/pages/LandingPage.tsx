import { useConvexAuth } from "convex/react";
import { ArrowRight, Eye, Shield, Swords, Timer, Brain, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.25_0.015_60)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.25_0.015_60)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary">
            <Lock className="size-3" />
            Read-Only · API-Only · 100% Compliant
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            <span className="text-gold">SMMO</span>
            <br />
            <span className="text-foreground/80">Companion</span>
          </h1>

          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your strategic advisor for SimpleMMO. Dual-AI powered insights, Guild PvP tools,
            buff tracking, and equipment analysis — all read-only, all compliant.
          </p>

          {!isAuthenticated && !isLoading && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" className="text-sm h-10 px-5 bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link to="/signup">
                  Enter the Realm
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-sm h-10 px-5 border-primary/30 text-primary hover:bg-primary/10"
                asChild
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          )}
          {isAuthenticated && (
            <div className="pt-2">
              <Button size="lg" className="text-sm h-10 px-5 bg-primary text-primary-foreground" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-[10px] font-medium text-gold-dim tracking-widest uppercase mb-2">
              Tools
            </p>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Everything You Need
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
            <FeatureCard
              icon={<Eye className="size-4 text-chart-1" />}
              title="Player Dashboard"
              description="HP, XP, gold, level, and all vital stats at a glance"
              color="chart-1"
            />
            <FeatureCard
              icon={<Swords className="size-4 text-chart-4" />}
              title="Guild PvP Tool"
              description="Target generation, war tracking, and blacklist management"
              color="chart-4"
            />
            <FeatureCard
              icon={<Timer className="size-4 text-chart-2" />}
              title="Buff Tracker"
              description="Sprint, worship, vault, and potion timers with alerts"
              color="chart-2"
            />
            <FeatureCard
              icon={<Shield className="size-4 text-chart-3" />}
              title="Equipment View"
              description="See all gear slots, rarity, and empty slot detection"
              color="chart-3"
            />
            <FeatureCard
              icon={<Brain className="size-4 text-chart-5" />}
              title="AI Advisor"
              description="Dual-AI strategic recommendations powered by Gemini + GPT"
              color="chart-5"
            />
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 flex flex-col justify-center">
              <p className="font-semibold text-sm text-primary mb-1">Ready to start?</p>
              <p className="text-[11px] text-muted-foreground mb-2">Join and connect your API key</p>
              <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary/10 w-fit" asChild>
                <Link to="/signup">
                  Get Started <ArrowRight className="size-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className={`group rounded-lg bg-card border p-4 transition-all hover:border-${color}/30`}>
      <div className={`inline-flex size-8 items-center justify-center rounded-md bg-${color}/10 mb-3`}>
        {icon}
      </div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-muted-foreground text-[11px] leading-relaxed">{description}</p>
    </div>
  );
}
