import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  Ban,
  ChevronRight,
  Clock,
  Crosshair,
  Filter,
  Pause,
  Play,
  ShieldCheck,
  SkipForward,
  Target,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatGold, formatNumber } from "@/lib/gameUtils";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

type TabKey = "queue" | "blacklist";

export function PvpAssistantPage() {
  const queue = useQuery(api.gameData.getPvpAssistantQueue);
  const blacklist = useQuery(api.gameData.getPvpBlacklist);
  const player = useQuery(api.gameData.getPlayerData);
  const rateLimit = useQuery(api.pvp.getRateLimit);
  
  const updateStatus = useMutation(api.gameData.updatePvpTargetStatus);
  const addToBlacklist = useMutation(api.gameData.addToPvpBlacklist);
  const removeBlacklist = useMutation(api.gameData.removeFromPvpBlacklist);
  const fetchTargets = useMutation(api.pvp.fetchPvpTargets);

  const [activeTab, setActiveTab] = useState<TabKey>("queue");
  const [showFilters, setShowFilters] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [minLevel, setMinLevel] = useState("");
  const [maxLevel, setMaxLevel] = useState("");
  const [minGold, setMinGold] = useState("");
  const [maxHpPercent, setMaxHpPercent] = useState("");
  const [hideSafe, setHideSafe] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<number | null>(null);

  const filteredQueue = useMemo(() => {
    if (!queue) return [];
    return queue
      .filter((t: Doc<"pvpAssistantQueue">) => {
        if (t.status === "completed" || t.status === "skipped") return false;
        const min = minLevel ? Number.parseInt(minLevel) : 0;
        const max = maxLevel ? Number.parseInt(maxLevel) : 999999;
        if (t.targetLevel < min || t.targetLevel > max) return false;
        if (hideSafe && t.targetSafeMode) return false;
        const goldMin = minGold ? Number.parseInt(minGold) : 0;
        if (t.targetGold < goldMin) return false;
        const hpMax = maxHpPercent ? Number.parseInt(maxHpPercent) : 100;
        const hpPct =
          t.targetMaxHp > 0
            ? Math.round((t.targetHp / t.targetMaxHp) * 100)
            : 100;
        if (hpPct > hpMax) return false;
        if (priorityFilter && t.priority !== priorityFilter) return false;
        return true;
      })
      .sort((a: Doc<"pvpAssistantQueue">, b: Doc<"pvpAssistantQueue">) => {
        // Sort by priority first (1=high), then by HP% ascending (low HP = easy kill)
        if (a.priority !== b.priority) return a.priority - b.priority;
        const aHp = a.targetMaxHp > 0 ? a.targetHp / a.targetMaxHp : 1;
        const bHp = b.targetMaxHp > 0 ? b.targetHp / b.targetMaxHp : 1;
        return aHp - bHp;
      });
  }, [
    queue,
    minLevel,
    maxLevel,
    minGold,
    maxHpPercent,
    hideSafe,
    priorityFilter,
  ]);

  const handleNextTarget = async () => {
    if (filteredQueue.length === 0) return;
    const next = filteredQueue[0];
    
    // Mark as attacking
    await updateStatus({
      targetId: next._id,
      status: "attacking",
    });

    // In a real app, this might open the SMMO attack page or perform an action
    window.open(`https://web.simple-mmo.com/user/attack/${next.targetPlayerId}`, "_blank");
  };

  const handleFetchNew = async () => {
    try {
      setIsFetching(true);
      await fetchTargets({
        minLevel: minLevel ? Number(minLevel) : undefined,
        maxLevel: maxLevel ? Number(maxLevel) : undefined,
      });
    } catch (error) {
      console.error("Failed to fetch targets:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const completedCount =
    queue?.filter((t: Doc<"pvpAssistantQueue">) => t.status === "completed")
      .length ?? 0;

  if (queue === undefined || blacklist === undefined || player === undefined) {
    return (
      <div className="p-3 md:p-4 space-y-3">
        <div className="h-6 w-48 rounded bg-muted animate-pulse" />
        <div className="game-card h-16 animate-pulse" />
        <div className="flex gap-1 h-8 rounded-lg bg-muted animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={`paskel-${i}`} className="game-card h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="size-5 text-chart-4" />
          <h1 className="text-lg font-bold">PvP Assistant</h1>
        </div>
        {/* Next Target (Manual) */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleFetchNew}
            disabled={isFetching || (rateLimit?.remaining ?? 0) <= 0}
          >
            {isFetching ? "Fetching..." : "Fetch New"}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs bg-chart-4 hover:bg-chart-4/80 text-white"
            onClick={handleNextTarget}
            disabled={filteredQueue.length === 0}
          >
            <ChevronRight className="size-3.5 mr-1" />
            Next Target
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="game-card flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Queued
          </p>
          <p className="text-lg font-bold text-primary">
            {filteredQueue.length}
          </p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Completed
          </p>
          <p className="text-lg font-bold text-success">{completedCount}</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Blacklisted
          </p>
          <p className="text-lg font-bold text-destructive">
            {blacklist.length}
          </p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Rate Limit
          </p>
          <p className={`text-lg font-bold ${ (rateLimit?.remaining ?? 0) < 5 ? "text-destructive" : "text-info" }`}>
            {rateLimit?.remaining ?? "--"}/{rateLimit?.limit ?? "40"}
          </p>
        </div>
      </div>

      {/* Manual Control Notice */}
      <div className="game-card border-chart-4/30 bg-chart-4/5 py-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-3.5 text-chart-4" />
          <span className="text-[11px] text-chart-4 font-medium">
            TOS Compliant: All actions require manual input. No automated loops.
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
            activeTab === "queue"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Target Queue ({filteredQueue.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("blacklist")}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
            activeTab === "blacklist"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Blacklist ({blacklist.length})
        </button>
      </div>

      {/* Queue Tab */}
      {activeTab === "queue" && (
        <div className="space-y-2">
          {/* Filters */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] border-border w-full justify-start"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="size-3" />
            Smart Filters
            <span className="ml-auto text-[10px] text-muted-foreground">
              {filteredQueue.length} of{" "}
              {
                queue.filter(
                  (t: Doc<"pvpAssistantQueue">) =>
                    t.status !== "completed" && t.status !== "skipped",
                ).length
              }{" "}
              targets
            </span>
          </Button>

          {showFilters && (
            <div className="game-card space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    className="text-[10px] text-muted-foreground"
                    htmlFor="paMinLvl"
                  >
                    Min Level
                  </label>
                  <input
                    id="paMinLvl"
                    type="number"
                    value={minLevel}
                    onChange={e => setMinLevel(e.target.value)}
                    placeholder="1"
                    className="w-full mt-0.5 h-8 text-xs bg-input border border-border rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label
                    className="text-[10px] text-muted-foreground"
                    htmlFor="paMaxLvl"
                  >
                    Max Level
                  </label>
                  <input
                    id="paMaxLvl"
                    type="number"
                    value={maxLevel}
                    onChange={e => setMaxLevel(e.target.value)}
                    placeholder="999999"
                    className="w-full mt-0.5 h-8 text-xs bg-input border border-border rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    className="text-[10px] text-muted-foreground"
                    htmlFor="paMinGold"
                  >
                    Min Gold
                  </label>
                  <input
                    id="paMinGold"
                    type="number"
                    value={minGold}
                    onChange={e => setMinGold(e.target.value)}
                    placeholder="0"
                    className="w-full mt-0.5 h-8 text-xs bg-input border border-border rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label
                    className="text-[10px] text-muted-foreground"
                    htmlFor="paMaxHp"
                  >
                    Max HP %
                  </label>
                  <input
                    id="paMaxHp"
                    type="number"
                    value={maxHpPercent}
                    onChange={e => setMaxHpPercent(e.target.value)}
                    placeholder="100"
                    className="w-full mt-0.5 h-8 text-xs bg-input border border-border rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label
                  className="text-[11px] text-muted-foreground"
                  htmlFor="paSafe"
                >
                  Hide Safe Mode
                </label>
                <button
                  id="paSafe"
                  type="button"
                  onClick={() => setHideSafe(!hideSafe)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${hideSafe ? "bg-primary" : "bg-muted"}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${hideSafe ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-medium block">
                  Priority
                </span>
                <div className="flex gap-1 mt-1">
                  {[null, 1, 2, 3].map(p => (
                    <Button
                      key={`p-${p}`}
                      variant={priorityFilter === p ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 text-[10px] flex-1"
                      onClick={() => setPriorityFilter(p)}
                    >
                      {p === null
                        ? "All"
                        : p === 1
                          ? "🔴 High"
                          : p === 2
                            ? "🟡 Med"
                            : "⚪ Low"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Target Queue */}
          {filteredQueue.length === 0 ? (
            <div className="game-card text-center py-6">
              <Target className="size-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Queue empty</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">
                Add targets or adjust filters
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredQueue.map(
                (target: Doc<"pvpAssistantQueue">, index: number) => {
                  const hpPct =
                    target.targetMaxHp > 0
                      ? Math.round((target.targetHp / target.targetMaxHp) * 100)
                      : 100;
                  const isLowHp = hpPct < 30;
                  const strAdvantage = player?.totalStr
                    ? player.totalStr - (target.targetStr ?? 0)
                    : 0;

                  return (
                    <div
                      key={target._id}
                      className={`game-card ${target.status === "attacking" ? "border-primary/40" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        {/* Priority + index */}
                        <div
                          className={`size-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                            target.priority === 1
                              ? "bg-destructive/10 text-destructive"
                              : target.priority === 2
                                ? "bg-warning/10 text-warning"
                                : "bg-muted/30 text-muted-foreground"
                          }`}
                        >
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
                            {target.status === "attacking" && (
                              <span className="text-[9px] px-1 py-0.5 rounded bg-primary/20 text-primary font-medium animate-pulse">
                                ATTACKING
                              </span>
                            )}
                          </div>

                          {/* Stats row */}
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground flex-wrap">
                            <span>Lv. {formatNumber(target.targetLevel)}</span>
                            {target.targetGuildName && (
                              <span className="text-primary/70">
                                ⚜ {target.targetGuildName}
                              </span>
                            )}
                            <span className="text-gold-dim">
                              💰 {formatGold(target.targetGold)}
                            </span>
                          </div>

                          {/* Stat comparison */}
                          <div className="flex items-center gap-3 mt-1 text-[10px]">
                            {target.targetStr !== undefined && (
                              <span className="text-chart-4">
                                ⚔ {formatNumber(target.targetStr)}
                              </span>
                            )}
                            {target.targetDef !== undefined && (
                              <span className="text-chart-3">
                                🛡 {formatNumber(target.targetDef)}
                              </span>
                            )}
                            {strAdvantage !== 0 && (
                              <span
                                className={
                                  strAdvantage > 0
                                    ? "text-success"
                                    : "text-destructive"
                                }
                              >
                                {strAdvantage > 0 ? "+" : ""}
                                {formatNumber(strAdvantage)} STR vs you
                              </span>
                            )}
                          </div>

                          {/* HP bar */}
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-destructive transition-all"
                                style={{ width: `${hpPct}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-destructive">
                              {hpPct}%
                            </span>
                          </div>

                          {/* Kill history + alerts */}
                          <div className="flex items-center gap-3 mt-1 text-[10px]">
                            {target.allyKills !== undefined &&
                              target.allyKills > 0 && (
                                <span className="text-success">
                                  ✓ {target.allyKills} kills by us
                                </span>
                              )}
                            {target.enemyKills !== undefined &&
                              target.enemyKills > 0 && (
                                <span className="text-destructive">
                                  ✗ {target.enemyKills} kills on us
                                </span>
                              )}
                            {target.attempts > 0 && (
                              <span className="text-muted-foreground">
                                <Clock className="size-2.5 inline mr-0.5" />
                                {target.attempts} attempts
                              </span>
                            )}
                          </div>

                          {isLowHp && (
                            <div className="flex items-center gap-1 mt-1 text-[9px] text-warning">
                              <AlertTriangle className="size-2.5" />
                              Low HP — high-priority target
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-primary hover:bg-primary/10"
                            title="Attack next"
                            onClick={() =>
                              updateStatus({
                                targetId: target._id,
                                status: "attacking",
                              })
                            }
                          >
                            <ChevronRight className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-warning"
                            title="Skip"
                            onClick={() =>
                              updateStatus({
                                targetId: target._id,
                                status: "skipped",
                              })
                            }
                          >
                            <SkipForward className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            title="Blacklist"
                            onClick={() =>
                              addToBlacklist({ targetId: target._id })
                            }
                          >
                            <Ban className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      )}

      {/* Blacklist Tab */}
      {activeTab === "blacklist" && (
        <div className="space-y-1.5">
          {blacklist.length === 0 ? (
            <div className="game-card text-center py-6">
              <Ban className="size-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Blacklist empty</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">
                Blacklisted players won't appear in your queue
              </p>
            </div>
          ) : (
            blacklist.map((entry: Doc<"pvpBlacklist">) => (
              <div key={entry._id} className="game-card opacity-80">
                <div className="flex items-center gap-3">
                  <Ban className="size-4 text-destructive shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold">
                      {entry.targetName}
                    </span>
                    {entry.reason && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {entry.reason}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] text-muted-foreground hover:text-success"
                    onClick={() => removeBlacklist({ blacklistId: entry._id })}
                  >
                    <Trash2 className="size-3" />
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Mock data · Rate limit: 40 req/min · Queue processes targets
        automatically
      </p>
    </div>
  );
}
