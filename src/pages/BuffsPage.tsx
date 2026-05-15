import { useQuery } from "convex/react";
import { Timer, AlertTriangle, Home, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatGold, formatTimeRemaining } from "@/lib/gameUtils";

export function BuffsPage() {
  const buffs = useQuery(api.gameData.getBuffs);
  const orphanage = useQuery(api.gameData.getOrphanage);

  if (buffs === undefined) {
    return (
      <div className="p-3 md:p-4 space-y-3">
        <div className="h-6 w-40 rounded bg-muted animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={`bskel-${i}`} className="game-card h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  const active = buffs.filter((b) => b.expiresAt > Date.now());
  const expired = buffs.filter((b) => b.expiresAt <= Date.now());

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      <div className="flex items-center gap-2">
        <Timer className="size-5 text-chart-2" />
        <h1 className="text-lg font-bold">Buffs & Timers</h1>
      </div>

      {active.length === 0 && expired.length === 0 ? (
        <div className="game-card text-center py-10">
          <Timer className="size-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No active buffs</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">Buffs will appear here when active</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1">
                Active ({active.length})
              </p>
              {active.map((buff) => (
                <BuffCard key={buff._id} buff={buff} />
              ))}
            </div>
          )}

          {expired.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1">
                Expired ({expired.length})
              </p>
              {expired.map((buff) => (
                <BuffCard key={buff._id} buff={buff} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Orphanage Section */}
      {orphanage && orphanage.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Home className="size-3.5 text-chart-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Orphanage Tiers
            </p>
          </div>
          {orphanage.map((tier) => (
            <div key={tier._id} className={`game-card ${tier.inProgress ? "border-chart-2/20" : ""}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Zap className={`size-3.5 ${tier.isActive ? "text-primary" : tier.inProgress ? "text-chart-2" : "text-muted-foreground"}`} />
                  <span className="text-sm font-semibold">{tier.tierName}</span>
                </div>
                {tier.isActive && <Badge className="text-[9px] bg-primary/15 text-primary border-0">ACTIVE</Badge>}
                {tier.inProgress && <Badge variant="secondary" className="text-[9px]">IN PROGRESS</Badge>}
                {!tier.isActive && !tier.inProgress && <Badge variant="outline" className="text-[9px] text-muted-foreground">LOCKED</Badge>}
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <Progress value={tier.percentage} className="h-1.5" />
                <span className="text-[10px] font-mono text-primary">{tier.percentage}%</span>
              </div>
              <div className="text-[10px] text-muted-foreground mb-1">
                {formatGold(tier.currentValue)} / {formatGold(tier.targetValue)}
              </div>
              <div className="flex flex-wrap gap-1">
                {tier.effects.map((effect) => (
                  <span key={effect} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/50 text-foreground/80">
                    {effect}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Timers tick in real time · Mock data
      </p>
    </div>
  );
}

function BuffCard({
  buff,
}: {
  buff: {
    _id: string;
    buffName: string;
    buffType: string;
    expiresAt: number;
    bonusPercent?: number;
    iconEmoji?: string;
  };
}) {
  const [timeLeft, setTimeLeft] = useState(formatTimeRemaining(buff.expiresAt));
  const isExpired = buff.expiresAt <= Date.now();
  const remaining = buff.expiresAt - Date.now();
  const isUrgent = !isExpired && remaining < 300000; // < 5 min

  useEffect(() => {
    if (isExpired) return;
    const interval = setInterval(() => {
      setTimeLeft(formatTimeRemaining(buff.expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [buff.expiresAt, isExpired]);

  const typeColor = {
    worship: "text-chart-2",
    sprint: "text-chart-5",
    vault: "text-chart-3",
    potion: "text-chart-4",
    crafting: "text-primary",
  }[buff.buffType] || "text-muted-foreground";

  return (
    <div
      className={`game-card ${isExpired ? "opacity-40" : ""} ${
        isUrgent ? "border-warning/40" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-xl shrink-0">{buff.iconEmoji || "✨"}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{buff.buffName}</span>
            <span className={`text-[9px] uppercase tracking-wider ${typeColor}`}>
              {buff.buffType}
            </span>
          </div>
          {buff.bonusPercent && (
            <p className="text-[11px] text-success mt-0.5">+{buff.bonusPercent}% bonus</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p
            className={`text-lg font-mono font-bold ${
              isExpired ? "text-destructive" : isUrgent ? "text-warning" : "text-primary"
            }`}
          >
            {timeLeft}
          </p>
          {isUrgent && !isExpired && (
            <div className="flex items-center gap-0.5 text-[9px] text-warning justify-end">
              <AlertTriangle className="size-2.5" />
              Expiring soon
            </div>
          )}
        </div>
      </div>

      {/* Progress bar showing time remaining */}
      {!isExpired && (
        <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isUrgent ? "bg-warning" : "bg-primary"
            }`}
            style={{
              width: `${Math.min(100, (remaining / 7200000) * 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
