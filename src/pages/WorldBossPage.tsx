import { useQuery } from "convex/react";
import {
  AlertTriangle,
  Clock,
  Crown,
  Shield,
  Skull,
  Swords,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNumber, getHpBarColor } from "@/lib/gameUtils";
import { api } from "../../convex/_generated/api";

export function WorldBossPage() {
  const bosses = useQuery(api.gameData.getWorldBosses);
  const player = useQuery(api.gameData.getPlayerData);

  if (bosses === undefined || player === undefined) {
    return <BossSkeleton />;
  }

  if (bosses.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center gap-3 min-h-[50vh]">
        <Skull className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No world bosses active</p>
        <p className="text-[11px] text-muted-foreground/60">
          Connect API key to see live boss data
        </p>
      </div>
    );
  }

  // Sort by HP% ascending (lowest first = closest to dying)
  const sorted = [...bosses].sort((a, b) => {
    const aPct = a.currentHp / a.maxHp;
    const bPct = b.currentHp / b.maxHp;
    return aPct - bPct;
  });

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skull className="size-5 text-destructive" />
          <h1 className="text-lg font-bold">World Bosses</h1>
        </div>
        <Badge
          variant="outline"
          className="text-[11px] border-destructive/30 text-destructive"
        >
          {bosses.length} Active
        </Badge>
      </div>

      {/* Boss Cards */}
      <div className="space-y-2">
        {sorted.map(boss => {
          const hpPct = Math.round((boss.currentHp / boss.maxHp) * 100);
          const isLow = hpPct < 25;
          const playerLevel = player?.level ?? 0;
          const levelDiff = boss.level - playerLevel;
          const difficulty =
            levelDiff > 100
              ? "Extreme"
              : levelDiff > 50
                ? "Hard"
                : levelDiff > 0
                  ? "Medium"
                  : "Easy";
          const diffColor =
            levelDiff > 100
              ? "text-destructive"
              : levelDiff > 50
                ? "text-warning"
                : levelDiff > 0
                  ? "text-chart-3"
                  : "text-success";

          const enableDate = new Date(boss.enableTime * 1000);
          const elapsed = Date.now() - enableDate.getTime();
          const elapsedStr =
            elapsed < 3600000
              ? `${Math.floor(elapsed / 60000)}m`
              : elapsed < 86400000
                ? `${Math.floor(elapsed / 3600000)}h`
                : `${Math.floor(elapsed / 86400000)}d`;

          return (
            <div
              key={boss._id}
              className={`game-card ${isLow ? "border-destructive/30" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`size-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                    boss.isGod
                      ? "bg-rarity-celestial/15 border border-rarity-celestial/30"
                      : "bg-destructive/10 border border-destructive/20"
                  }`}
                >
                  {boss.isGod ? (
                    <Crown className="size-5 text-rarity-celestial" />
                  ) : (
                    <Skull className="size-5 text-destructive" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold truncate">{boss.name}</h2>
                    {boss.isGod && (
                      <Badge className="text-[9px] bg-rarity-celestial/15 text-rarity-celestial border-0">
                        GOD
                      </Badge>
                    )}
                    <span className={`text-[10px] font-medium ${diffColor}`}>
                      {difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                    <span>Lv. {boss.level}</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="size-2.5" />
                      {elapsedStr} ago
                    </span>
                  </div>

                  {/* HP Bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getHpBarColor(hpPct)}`}
                        style={{ width: `${hpPct}%` }}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-mono font-bold ${hpPct > 75 ? "text-success" : hpPct > 40 ? "text-warning" : "text-destructive"}`}
                    >
                      {hpPct}%
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {formatNumber(boss.currentHp)} / {formatNumber(boss.maxHp)}{" "}
                    HP
                  </div>

                  {isLow && (
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-warning">
                      <AlertTriangle className="size-3" />
                      <span>Low HP — attack now for kill credit!</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-2 text-[10px]">
                    <span className="flex items-center gap-1 text-chart-4">
                      <Swords className="size-3" /> STR {boss.str}
                    </span>
                    <span className="flex items-center gap-1 text-chart-1">
                      <Shield className="size-3" /> DEF {boss.def}
                    </span>
                    <span className="flex items-center gap-1 text-chart-5">
                      <Zap className="size-3" /> DEX {boss.dex}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Mock data · Boss HP updates with API refresh · Sorted by lowest HP first
      </p>
    </div>
  );
}

function BossSkeleton() {
  return (
    <div className="p-3 md:p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-32 rounded bg-muted animate-pulse" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={`bskel-${i}`} className="game-card h-28 animate-pulse" />
      ))}
    </div>
  );
}
