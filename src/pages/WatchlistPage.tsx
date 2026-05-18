import { useMutation, useQuery } from "convex/react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Crosshair,
  Eye,
  Heart,
  Shield,
  ShoppingCart,
  Swords,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  formatGold,
  formatNumber,
  getHpBarColor,
  getHpColor,
} from "@/lib/gameUtils";
import { api } from "../../convex/_generated/api";

type WatchlistFilter = "all" | "friend" | "enemy" | "trader" | "other";
type SortKey = "level" | "str" | "lastActivity" | "name";

const TAG_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  friend: {
    label: "Friend",
    icon: <Users className="size-3" />,
    color: "text-success",
    bg: "bg-success/10",
  },
  enemy: {
    label: "Enemy",
    icon: <Crosshair className="size-3" />,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  trader: {
    label: "Trader",
    icon: <ShoppingCart className="size-3" />,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  guild_mate: {
    label: "Guild",
    icon: <Shield className="size-3" />,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  other: {
    label: "Other",
    icon: <Eye className="size-3" />,
    color: "text-muted-foreground",
    bg: "bg-muted/10",
  },
};

export function WatchlistPage() {
  const watchlist = useQuery(api.gameData.getPlayerWatchlist);
  const removeEntry = useMutation(api.gameData.removeWatchlistPlayer);
  const [filter, setFilter] = useState<WatchlistFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("level");
  const [sortAsc, setSortAsc] = useState(false);

  if (watchlist === undefined) {
    return <WatchlistSkeleton />;
  }

  const filtered =
    filter === "all" ? watchlist : watchlist.filter(w => w.tag === filter);

  const sorted = [...filtered].sort((a, b) => {
    const mult = sortAsc ? 1 : -1;
    if (sortBy === "level")
      return (b.watchedPlayerLevel - a.watchedPlayerLevel) * mult;
    if (sortBy === "str")
      return ((b.watchedPlayerStr || 0) - (a.watchedPlayerStr || 0)) * mult;
    if (sortBy === "lastActivity")
      return (
        ((a.watchedPlayerLastActivity || 0) -
          (b.watchedPlayerLastActivity || 0)) *
        mult
      );
    return a.watchedPlayerName.localeCompare(b.watchedPlayerName) * mult;
  });

  const friends = watchlist.filter(w => w.tag === "friend").length;
  const enemies = watchlist.filter(w => w.tag === "enemy").length;
  const traders = watchlist.filter(w => w.tag === "trader").length;

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="size-5 text-chart-1" />
          <h1 className="text-lg font-bold">Watchlist</h1>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] border-chart-1/30 text-chart-1"
        >
          {watchlist.length} tracked
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="game-card text-center py-2.5">
          <Users className="size-3.5 text-success mx-auto" />
          <p className="text-base font-bold mt-1 text-success">{friends}</p>
          <p className="text-[10px] text-muted-foreground">Friends</p>
        </div>
        <div className="game-card text-center py-2.5">
          <Crosshair className="size-3.5 text-destructive mx-auto" />
          <p className="text-base font-bold mt-1 text-destructive">{enemies}</p>
          <p className="text-[10px] text-muted-foreground">Enemies</p>
        </div>
        <div className="game-card text-center py-2.5">
          <ShoppingCart className="size-3.5 text-chart-2 mx-auto" />
          <p className="text-base font-bold mt-1 text-chart-2">{traders}</p>
          <p className="text-[10px] text-muted-foreground">Traders</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
        {(["all", "friend", "enemy", "trader"] as const).map(f => {
          const count =
            f === "all"
              ? watchlist.length
              : watchlist.filter(w => w.tag === f).length;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                filter === f
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {f === "all"
                ? `All (${count})`
                : `${f.charAt(0).toUpperCase() + f.slice(1)}s (${count})`}
            </button>
          );
        })}
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-1.5 text-[10px]">
        <span className="text-muted-foreground">Sort:</span>
        {(["level", "str", "lastActivity", "name"] as const).map(key => (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (sortBy === key) setSortAsc(!sortAsc);
              else {
                setSortBy(key);
                setSortAsc(false);
              }
            }}
            className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
              sortBy === key
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {key === "level"
              ? "Level"
              : key === "str"
                ? "STR"
                : key === "lastActivity"
                  ? "Activity"
                  : "Name"}
            {sortBy === key &&
              (sortAsc ? (
                <ChevronUp className="size-2.5" />
              ) : (
                <ChevronDown className="size-2.5" />
              ))}
          </button>
        ))}
      </div>

      {/* Player List */}
      {sorted.length === 0 ? (
        <div className="game-card text-center py-8">
          <Eye className="size-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No players in this category
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            Add players from PvP or search to track them
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sorted.map(player => {
            const tagConfig = TAG_CONFIG[player.tag] || TAG_CONFIG.other;
            const hpPct = player.watchedPlayerMaxHp
              ? Math.round(
                  ((player.watchedPlayerHp || 0) / player.watchedPlayerMaxHp) *
                    100,
                )
              : null;
            const now = Date.now();
            const lastActivity = player.watchedPlayerLastActivity || 0;
            const activityAge = now - lastActivity;
            const activityLabel =
              activityAge < 60000
                ? "just now"
                : activityAge < 3600000
                  ? `${Math.floor(activityAge / 60000)}m ago`
                  : activityAge < 86400000
                    ? `${Math.floor(activityAge / 3600000)}h ago`
                    : `${Math.floor(activityAge / 86400000)}d ago`;
            const isOnline = activityAge < 3600000;
            const lastCheckedAge = now - player.lastChecked;
            const stale = lastCheckedAge > 86400000;

            return (
              <div
                key={player._id}
                className={`game-card ${
                  player.tag === "enemy"
                    ? "border-destructive/15"
                    : player.tag === "friend"
                      ? "border-success/15"
                      : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Tag indicator */}
                  <div
                    className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${tagConfig.bg}`}
                  >
                    <span className={tagConfig.color}>{tagConfig.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + tag + online */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">
                        {player.watchedPlayerName}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded ${tagConfig.bg} ${tagConfig.color} uppercase tracking-wider font-medium`}
                      >
                        {tagConfig.label}
                      </span>
                      {player.watchedPlayerSafeMode && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-success/15 text-success">
                          SAFE
                        </span>
                      )}
                      <span
                        className={`size-1.5 rounded-full ${isOnline ? "bg-success" : "bg-muted-foreground/30"}`}
                      />
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground flex-wrap">
                      <span>Lv. {formatNumber(player.watchedPlayerLevel)}</span>
                      {player.watchedPlayerGuildName && (
                        <span className="text-primary/70">
                          ⚜ {player.watchedPlayerGuildName}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <Clock className="size-2.5" /> {activityLabel}
                      </span>
                      {player.watchedPlayerGold !== undefined &&
                        player.watchedPlayerGold > 0 && (
                          <span className="text-gold-accent">
                            {formatGold(player.watchedPlayerGold)}
                          </span>
                        )}
                    </div>

                    {/* Combat Stats */}
                    {(player.watchedPlayerStr ||
                      player.watchedPlayerDef ||
                      player.watchedPlayerDex) && (
                      <div className="flex items-center gap-3 mt-1 text-[10px]">
                        {player.watchedPlayerStr !== undefined && (
                          <span className="flex items-center gap-0.5 text-chart-4">
                            <Swords className="size-2.5" />{" "}
                            {formatNumber(player.watchedPlayerStr)}
                          </span>
                        )}
                        {player.watchedPlayerDef !== undefined && (
                          <span className="flex items-center gap-0.5 text-chart-1">
                            <Shield className="size-2.5" />{" "}
                            {formatNumber(player.watchedPlayerDef)}
                          </span>
                        )}
                        {player.watchedPlayerDex !== undefined && (
                          <span className="flex items-center gap-0.5 text-chart-5">
                            <Zap className="size-2.5" />{" "}
                            {formatNumber(player.watchedPlayerDex)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* HP Bar */}
                    {hpPct !== null && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Heart className="size-2.5 text-destructive" />
                        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getHpBarColor(hpPct)}`}
                            style={{ width: `${hpPct}%` }}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-mono ${getHpColor(hpPct)}`}
                        >
                          {hpPct}%
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    {player.notes && (
                      <p className="text-[10px] text-muted-foreground/60 mt-1 italic">
                        📝 {player.notes}
                      </p>
                    )}

                    {stale && (
                      <span className="text-[9px] text-warning mt-0.5 inline-block">
                        ⚠ Data may be stale — last checked{" "}
                        {Math.floor(lastCheckedAge / 3600000)}h ago
                      </span>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeEntry({ entryId: player._id })}
                    className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors shrink-0"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Mock data · Player stats update with API refresh · {watchlist.length}{" "}
        players tracked
      </p>
    </div>
  );
}

function WatchlistSkeleton() {
  return (
    <div className="p-3 md:p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-32 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={`wsstat-${i}`} className="game-card h-16 animate-pulse" />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={`wskel-${i}`} className="game-card h-24 animate-pulse" />
      ))}
    </div>
  );
}
