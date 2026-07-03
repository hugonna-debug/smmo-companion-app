import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ChevronRight,
  Eye,
  EyeOff,
  Filter,
  ShieldAlert,
  ShieldCheck,
  SkipForward,
  Swords,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatGold, formatNumber, getWarStatus } from "@/lib/gameUtils";
import { api } from "../../convex/_generated/api";

export function PvpPage() {
  const wars = useQuery(api.gameData.getGuildWars);
  const targets = useQuery(api.gameData.getPvpTargets);
  const player = useQuery(api.gameData.getPlayerData);
  const toggleBlacklist = useMutation(api.gameData.toggleGuildBlacklist);
  const skipTarget = useMutation(api.gameData.skipTarget);

  const [activeTab, setActiveTab] = useState<"wars" | "targets">("wars");
  const [showFilters, setShowFilters] = useState(false);
  // Filters matching real SMMO Colosseum
  const [minLevel, setMinLevel] = useState("");
  const [maxLevel, setMaxLevel] = useState("");
  const [guildEnemiesOnly, setGuildEnemiesOnly] = useState(true);
  const [hideSafeMode, setHideSafeMode] = useState(true);
  const [minGold, setMinGold] = useState("");

  if (wars === undefined || targets === undefined || player === undefined) {
    return <PvpSkeleton />;
  }

  const activeWars = wars.filter(w => !w.isBlacklisted);
  const blacklisted = wars.filter(w => w.isBlacklisted);
  const totalOurScore = activeWars.reduce((sum, w) => sum + w.ourScore, 0);
  const totalEnemyScore = activeWars.reduce((sum, w) => sum + w.enemyScore, 0);

  // Active war guild IDs for enemy-only filter
  const enemyGuildIds = activeWars.map(w => w.enemyGuildId);

  // Filter targets — matching real SMMO Colosseum filters
  const filteredTargets = (targets || []).filter(t => {
    if (t.isSkipped) return false;
    // Level range
    const min = minLevel ? Number.parseInt(minLevel, 10) : 0;
    const max = maxLevel ? Number.parseInt(maxLevel, 10) : 999999;
    if (t.targetLevel < min || t.targetLevel > max) return false;
    // Guild enemies only
    if (guildEnemiesOnly && !enemyGuildIds.includes(t.targetGuildId))
      return false;
    // Safe mode filter
    if (hideSafeMode && t.targetSafeMode) return false;
    // Minimum gold
    const goldMin = minGold ? Number.parseInt(minGold, 10) : 0;
    if (t.targetGold < goldMin) return false;
    // Exclude targets from blacklisted guilds
    const blacklistedIds = blacklisted.map(w => w.enemyGuildId);
    if (blacklistedIds.includes(t.targetGuildId)) return false;
    return true;
  });

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="size-5 text-chart-4" />
          <h1 className="text-lg font-bold">Guild PvP</h1>
        </div>
        {player?.guildName && (
          <Badge
            variant="outline"
            className="text-[11px] border-primary/30 text-primary"
          >
            ⚜ {player.guildName}
          </Badge>
        )}
      </div>

      {/* Summary bar */}
      <div className="game-card flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Wars
          </p>
          <p className="text-lg font-bold text-primary">{activeWars.length}</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Our Total
          </p>
          <p className="text-lg font-bold text-success">
            {formatNumber(totalOurScore)}
          </p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Enemy Total
          </p>
          <p className="text-lg font-bold text-destructive">
            {formatNumber(totalEnemyScore)}
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
        <button
          type="button"
          onClick={() => setActiveTab("wars")}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
            activeTab === "wars"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Guild Wars ({wars.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("targets")}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
            activeTab === "targets"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Targets ({filteredTargets.length})
        </button>
      </div>

      {/* Wars Tab */}
      {activeTab === "wars" && (
        <div className="space-y-1.5">
          {wars.length === 0 ? (
            <div className="game-card text-center py-8">
              <ShieldAlert className="size-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No active guild wars
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">
                Connect your API key to load real war data
              </p>
            </div>
          ) : (
            <>
              {/* Active Wars */}
              {activeWars.map(war => {
                const status = getWarStatus(war.ourScore, war.enemyScore);
                return (
                  <div key={war._id} className="game-card">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate">
                            {war.enemyGuildName}
                          </span>
                          <span
                            className={`text-[10px] font-medium ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Trophy className="size-3 text-success" />
                            <span className="text-[11px] font-mono text-success">
                              {war.ourScore}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            vs
                          </span>
                          <div className="flex items-center gap-1">
                            <Trophy className="size-3 text-destructive" />
                            <span className="text-[11px] font-mono text-destructive">
                              {war.enemyScore}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] text-muted-foreground hover:text-destructive"
                        onClick={() => toggleBlacklist({ warId: war._id })}
                      >
                        <EyeOff className="size-3" />
                        Hide
                      </Button>
                    </div>
                    {/* War score bar */}
                    <div className="mt-2 h-1.5 rounded-full bg-destructive/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-success transition-all"
                        style={{
                          width: `${(war.ourScore / (war.ourScore + war.enemyScore)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Blacklisted Wars */}
              {blacklisted.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                    Blacklisted ({blacklisted.length})
                  </p>
                  {blacklisted.map(war => (
                    <div
                      key={war._id}
                      className="game-card opacity-50 flex items-center justify-between"
                    >
                      <span className="text-sm text-muted-foreground">
                        {war.enemyGuildName}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={() => toggleBlacklist({ warId: war._id })}
                      >
                        <Eye className="size-3" />
                        Show
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Targets Tab */}
      {activeTab === "targets" && (
        <div className="space-y-2">
          {/* Filters — Colosseum style */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] border-border w-full justify-start"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="size-3" />
            Filters
            <span className="ml-auto text-[10px] text-muted-foreground">
              {filteredTargets.length} targets from {activeWars.length} wars
            </span>
          </Button>

          {showFilters && (
            <div className="game-card space-y-3">
              {/* Level range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    className="text-[10px] text-muted-foreground"
                    htmlFor="minLvl"
                  >
                    Minimum Level
                  </label>
                  <input
                    id="minLvl"
                    type="number"
                    value={minLevel}
                    onChange={e => setMinLevel(e.target.value)}
                    placeholder="200"
                    className="w-full mt-0.5 h-8 text-xs bg-input border border-border rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label
                    className="text-[10px] text-muted-foreground"
                    htmlFor="maxLvl"
                  >
                    Max Level
                  </label>
                  <input
                    id="maxLvl"
                    type="number"
                    value={maxLevel}
                    onChange={e => setMaxLevel(e.target.value)}
                    placeholder="999999"
                    className="w-full mt-0.5 h-8 text-xs bg-input border border-border rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Guild Enemies toggle */}
              <div className="flex items-center justify-between">
                <label
                  className="text-[11px] text-muted-foreground"
                  htmlFor="guildEnemies"
                >
                  Guild Enemies (In War)
                </label>
                <button
                  id="guildEnemies"
                  type="button"
                  role="switch"
                  aria-checked={guildEnemiesOnly}
                  aria-label="Toggle Guild Enemies (In War) filter"
                  onClick={() => setGuildEnemiesOnly(!guildEnemiesOnly)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    guildEnemiesOnly ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${
                      guildEnemiesOnly ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Hide Safe Mode toggle */}
              <div className="flex items-center justify-between">
                <label
                  className="text-[11px] text-muted-foreground"
                  htmlFor="safeModeFilter"
                >
                  Hide Safe Mode Players
                </label>
                <button
                  id="safeModeFilter"
                  type="button"
                  role="switch"
                  aria-checked={hideSafeMode}
                  aria-label="Toggle Hide Safe Mode Players filter"
                  onClick={() => setHideSafeMode(!hideSafeMode)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    hideSafeMode ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${
                      hideSafeMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Minimum Gold */}
              <div>
                <label
                  className="text-[10px] text-muted-foreground"
                  htmlFor="minGold"
                >
                  Minimum Gold
                </label>
                <input
                  id="minGold"
                  type="number"
                  value={minGold}
                  onChange={e => setMinGold(e.target.value)}
                  placeholder="0"
                  className="w-full mt-0.5 h-8 text-xs bg-input border border-border rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* Target List */}
          {filteredTargets.length === 0 ? (
            <div className="game-card text-center py-6">
              <Swords className="size-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No targets available
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">
                Adjust filters or refresh data
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredTargets.map((target, index) => (
                <div key={target._id} className="game-card">
                  <div className="flex items-start gap-2">
                    <div className="size-6 rounded-md bg-chart-4/10 flex items-center justify-center text-[10px] font-bold text-chart-4 shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">
                          {target.targetName}
                        </span>
                        {target.targetSafeMode && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-success/20 text-success font-medium flex items-center gap-0.5">
                            <ShieldCheck className="size-2.5" />
                            SAFE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                        <span>Lv. {formatNumber(target.targetLevel)}</span>
                        <span className="text-primary/70">
                          ⚜ {target.targetGuildName}
                        </span>
                        <span className="text-gold-dim">
                          💰 {formatGold(target.targetGold)}
                        </span>
                      </div>
                      {/* HP bar — RED like real SMMO */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-destructive transition-all"
                            style={{ width: `${target.targetHpPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-destructive">
                          {target.targetHpPercent}%
                        </span>
                      </div>
                      {target.targetHpPercent < 30 && (
                        <div className="flex items-center gap-1 mt-1 text-[9px] text-warning">
                          <AlertTriangle className="size-2.5" />
                          Low HP — high-value target
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-primary hover:bg-primary/10"
                        title="Attack this target"
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => skipTarget({ targetId: target._id })}
                        title="Skip"
                      >
                        <SkipForward className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Mock data · Rate limit: 40 req/min · Targets generated dynamically to
        avoid rate limits
      </p>
    </div>
  );
}

function PvpSkeleton() {
  return (
    <div className="p-3 md:p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-32 rounded bg-muted animate-pulse" />
      </div>
      <div className="game-card h-16 animate-pulse" />
      <div className="flex gap-1 h-8 rounded-lg bg-muted animate-pulse" />
      {[...Array(4)].map((_, i) => (
        <div key={`pskel-${i}`} className="game-card h-20 animate-pulse" />
      ))}
    </div>
  );
}
