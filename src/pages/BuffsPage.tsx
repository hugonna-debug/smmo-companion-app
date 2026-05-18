import { useQuery } from "convex/react";
import {
  ChevronDown,
  ChevronRight,
  Footprints,
  Home,
  Shield,
  Sparkles,
  Target,
  Timer,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatGold, formatTimeRemaining } from "@/lib/gameUtils";
import { api } from "../../convex/_generated/api";

// Category display info matching real SMMO Active Modifiers page
const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  travel: {
    label: "Travel",
    icon: <Footprints className="size-4" />,
    color: "text-chart-5",
  },
  chest: {
    label: "Chest",
    icon: <Target className="size-4" />,
    color: "text-gold-accent",
  },
  battle: {
    label: "Battle",
    icon: <Shield className="size-4" />,
    color: "text-destructive",
  },
  quest: {
    label: "Quest",
    icon: <Sparkles className="size-4" />,
    color: "text-blue-400",
  },
};

const MODIFIER_LABELS: Record<string, string> = {
  step_speed: "Step Speed",
  experience: "Experience",
  drop_rate: "Drop Rate",
  gold: "Gold",
};

export function BuffsPage() {
  const modifiers = useQuery(api.gameData.getActiveModifiers);
  const orphanage = useQuery(api.gameData.getOrphanage);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  if (modifiers === undefined) {
    return (
      <div className="p-3 md:p-4 space-y-3">
        <div className="h-6 w-40 rounded bg-muted animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={`bskel-${i}`} className="game-card h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  // Group modifiers by category
  const categories = ["travel", "chest", "battle", "quest"];
  const byCat: Record<
    string,
    typeof modifiers extends (infer T)[] | null ? T[] : never[]
  > = {};
  for (const cat of categories) {
    byCat[cat] = (modifiers || []).filter(m => m.category === cat);
  }

  // Count total active modifiers
  const totalMods = (modifiers || []).length;

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      {/* Header - matches SMMO "Your Stats" > Active Modifiers */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="size-5 text-chart-2" />
          <h1 className="text-lg font-bold">Active Modifiers</h1>
        </div>
        {totalMods > 0 && (
          <Badge
            variant="outline"
            className="text-[10px] border-primary/30 text-primary"
          >
            {totalMods} active
          </Badge>
        )}
      </div>

      {/* Modifier Categories (matching real SMMO layout) */}
      {totalMods === 0 ? (
        <div className="game-card text-center py-10">
          <Timer className="size-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No active modifiers</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            Modifiers from Temple, Potions, Orphanage, Sanctuary appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map(cat => {
            const catMods = byCat[cat];
            if (!catMods || catMods.length === 0) return null;
            const meta = CATEGORY_META[cat];
            const isExpanded = expandedCat === cat;

            return (
              <div key={cat} className="game-card">
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => setExpandedCat(isExpanded ? null : cat)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={meta.color}>{meta.icon}</span>
                    <span className="text-sm font-bold">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {catMods.length} modifier{catMods.length > 1 ? "s" : ""}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Modifier rows (always visible as summary) */}
                <div className="mt-2 space-y-2">
                  {catMods.map(mod => (
                    <ModifierRow
                      key={mod._id}
                      mod={mod}
                      isExpanded={isExpanded}
                      color={meta.color}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Orphanage Section */}
      {orphanage && orphanage.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Home className="size-4 text-chart-2" />
            <p className="text-sm font-bold">Orphanage</p>
          </div>
          {orphanage.map(tier => (
            <div
              key={tier._id}
              className={`game-card ${tier.inProgress ? "border-chart-2/20" : ""}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Zap
                    className={`size-3.5 ${tier.isActive ? "text-primary" : tier.inProgress ? "text-chart-2" : "text-muted-foreground"}`}
                  />
                  <span className="text-sm font-semibold">{tier.tierName}</span>
                </div>
                {tier.isActive && (
                  <Badge className="text-[9px] bg-success/15 text-success border-0">
                    COMPLETE
                  </Badge>
                )}
                {tier.inProgress && (
                  <Badge variant="secondary" className="text-[9px]">
                    IN PROGRESS
                  </Badge>
                )}
                {!tier.isActive && !tier.inProgress && (
                  <Badge
                    variant="outline"
                    className="text-[9px] text-muted-foreground"
                  >
                    LOCKED
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <Progress value={tier.percentage} className="h-1.5" />
                <span className="text-[10px] font-mono text-primary">
                  {tier.percentage}%
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground mb-1">
                {formatGold(tier.currentValue)} / {formatGold(tier.targetValue)}
                {tier.inProgress && (
                  <span className="ml-2 text-chart-2">
                    {formatGold(tier.targetValue - tier.currentValue)} remaining
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {tier.effects.map(effect => (
                  <span
                    key={effect}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/50 text-foreground/80"
                  >
                    {effect}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Timers tick in real time · Matching SMMO Active Modifiers page
      </p>
    </div>
  );
}

function ModifierRow({
  mod,
  isExpanded,
  color,
}: {
  mod: {
    _id: string;
    modifierType: string;
    totalPercent: number;
    sourceCount: number;
    sources: Array<{
      name: string;
      percent: number;
      expiresAt?: number;
      isPermanent: boolean;
    }>;
  };
  isExpanded: boolean;
  color: string;
}) {
  return (
    <div className="bg-secondary/20 rounded-lg p-2.5">
      {/* Summary row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium">
            {MODIFIER_LABELS[mod.modifierType] || mod.modifierType}
          </span>
          <span className="text-[10px] text-muted-foreground">
            ×{mod.sourceCount}
          </span>
        </div>
        <span className={`text-sm font-bold ${color}`}>
          +{mod.totalPercent}%
        </span>
      </div>

      {/* Expanded: show individual sources with timers */}
      {isExpanded && mod.sources.length > 0 && (
        <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-muted-foreground/10">
          {mod.sources.map((source, i) => (
            <SourceItem key={`${mod._id}-src-${i}`} source={source} />
          ))}
        </div>
      )}
    </div>
  );
}

function SourceItem({
  source,
}: {
  source: {
    name: string;
    percent: number;
    expiresAt?: number;
    isPermanent: boolean;
  };
}) {
  const [timeLeft, setTimeLeft] = useState(
    source.expiresAt ? formatTimeRemaining(source.expiresAt) : "",
  );
  const isExpired = source.expiresAt ? source.expiresAt <= Date.now() : false;

  useEffect(() => {
    if (!source.expiresAt || isExpired || source.isPermanent) return;
    const interval = setInterval(() => {
      setTimeLeft(formatTimeRemaining(source.expiresAt!));
    }, 1000);
    return () => clearInterval(interval);
  }, [source.expiresAt, isExpired, source.isPermanent]);

  return (
    <div
      className={`flex items-center justify-between text-[11px] ${isExpired ? "opacity-40" : ""}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{source.name}</span>
        <span className="text-success font-medium">+{source.percent}%</span>
      </div>
      {source.isPermanent ? (
        <span className="text-[10px] text-primary font-mono">∞</span>
      ) : source.expiresAt ? (
        <span
          className={`text-[10px] font-mono ${isExpired ? "text-destructive" : "text-primary"}`}
        >
          {timeLeft}
        </span>
      ) : null}
    </div>
  );
}
