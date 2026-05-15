import { useMutation, useQuery } from "convex/react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  Bell,
  StickyNote,
  ArrowUpDown,
  Search,
  ShoppingCart,
} from "lucide-react";
// All imports used
import { useState, useMemo } from "react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatGold, getRarityColor } from "@/lib/gameUtils";

type SortKey = "name" | "priceLow" | "priceHigh" | "circulation" | "change";
type SortDir = "asc" | "desc";

export function MarketPage() {
  const tracked = useQuery(api.gameData.getMarketTracking);
  const removeItem = useMutation(api.gameData.removeMarketItem);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = useMemo(() => {
    if (!tracked) return [];
    let items = [...tracked];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => i.itemName.toLowerCase().includes(q));
    }
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.itemName.localeCompare(b.itemName); break;
        case "priceLow": cmp = (a.currentLow ?? 0) - (b.currentLow ?? 0); break;
        case "priceHigh": cmp = (a.currentHigh ?? 0) - (b.currentHigh ?? 0); break;
        case "circulation": cmp = (a.circulation ?? 0) - (b.circulation ?? 0); break;
        case "change": {
          const aChange = getPriceChange(a.priceHistory);
          const bChange = getPriceChange(b.priceHistory);
          cmp = aChange - bChange;
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return items;
  }, [tracked, search, sortKey, sortDir]);

  if (tracked === undefined) {
    return (
      <div className="p-3 md:p-4 space-y-3">
        <div className="h-6 w-48 rounded bg-muted animate-pulse" />
        <div className="h-10 rounded bg-muted animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={`mskel-${i}`} className="game-card h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  const totalValue = tracked.reduce((sum, i) => sum + (i.lastPrice ?? 0), 0);
  const alertCount = tracked.filter(i => i.alertBelow && i.currentLow && i.currentLow <= i.alertBelow).length;

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      <div className="flex items-center gap-2">
        <ShoppingCart className="size-5 text-chart-5" />
        <h1 className="text-lg font-bold">Market Tracker</h1>
      </div>

      {/* Summary */}
      <div className="game-card flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Watching</p>
          <p className="text-lg font-bold text-primary">{tracked.length}</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Value</p>
          <p className="text-lg font-bold text-gold-dim">💰 {formatGold(totalValue)}</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Alerts</p>
          <p className={`text-lg font-bold ${alertCount > 0 ? "text-warning" : "text-muted-foreground"}`}>
            {alertCount > 0 ? `🔔 ${alertCount}` : "—"}
          </p>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full h-8 text-xs bg-input border border-border rounded-md pl-7 pr-2 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1">
          {(["name", "priceLow", "circulation", "change"] as SortKey[]).map((key) => (
            <Button
              key={key}
              variant={sortKey === key ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2 text-[10px]"
              onClick={() => toggleSort(key)}
            >
              {key === "name" ? "A-Z" : key === "priceLow" ? "Price" : key === "circulation" ? "#" : "Δ"}
              {sortKey === key && <ArrowUpDown className="size-2.5 ml-0.5" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Item List */}
      {sorted.length === 0 ? (
        <div className="game-card text-center py-8">
          <ShoppingCart className="size-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No items being tracked</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">Connect API key to add items from the player market</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sorted.map((item) => {
            const change = getPriceChange(item.priceHistory);
            const isExpanded = expandedId === item._id;
            const hasAlert = item.alertBelow && item.currentLow && item.currentLow <= item.alertBelow;

            return (
              <div key={item._id} className={`game-card ${hasAlert ? "border-warning/40" : ""}`}>
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setExpandedId(isExpanded ? null : item._id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-secondary/50 flex items-center justify-center text-lg shrink-0">
                      {item.type === "weapon" ? "⚔️" : item.type === "armour" ? "🛡️" : item.type === "amulet" ? "📿" : item.type === "shield" ? "🔰" : item.type === "boots" ? "👢" : "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${getRarityColor(item.rarity)}`}>
                          {item.itemName}
                        </span>
                        {hasAlert && <Bell className="size-3 text-warning animate-pulse" />}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] text-muted-foreground">
                          Low: <span className="text-success font-mono">{formatGold(item.currentLow ?? 0)}</span>
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          High: <span className="text-warning font-mono">{formatGold(item.currentHigh ?? 0)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <PriceChangeIndicator change={change} />
                      {item.circulation && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {item.circulation} in circulation
                        </p>
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    {/* Mini price history */}
                    {item.priceHistory && item.priceHistory.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Price History</p>
                        <div className="flex items-end gap-1 h-12">
                          {item.priceHistory.map((ph, idx) => {
                            const maxP = Math.max(...item.priceHistory!.map(p => p.price));
                            const height = maxP > 0 ? (ph.price / maxP) * 100 : 50;
                            return (
                              <div key={`ph-${idx}`} className="flex-1 flex flex-col items-center gap-0.5">
                                <div
                                  className="w-full rounded-sm bg-primary/60 min-h-[2px]"
                                  style={{ height: `${height}%` }}
                                />
                                <span className="text-[8px] text-muted-foreground">
                                  {formatGold(ph.price)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {item.notes && (
                      <div className="flex items-start gap-1.5">
                        <StickyNote className="size-3 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-[11px] text-muted-foreground">{item.notes}</p>
                      </div>
                    )}

                    {item.alertBelow && (
                      <div className="flex items-center gap-1.5">
                        <Bell className="size-3 text-warning shrink-0" />
                        <p className="text-[11px] text-warning">Alert when below {formatGold(item.alertBelow)}</p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem({ trackingId: item._id })}
                      >
                        <Trash2 className="size-3" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Mock data · Connect API key to track real market prices
      </p>
    </div>
  );
}

function getPriceChange(history?: { price: number; timestamp: number }[]): number {
  if (!history || history.length < 2) return 0;
  const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
  const prev = sorted[sorted.length - 2].price;
  const curr = sorted[sorted.length - 1].price;
  if (prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
}

function PriceChangeIndicator({ change }: { change: number }) {
  if (Math.abs(change) < 0.5) {
    return (
      <Badge variant="outline" className="text-[10px] border-muted-foreground/30">
        <Minus className="size-2.5 mr-0.5" />
        Stable
      </Badge>
    );
  }
  if (change > 0) {
    return (
      <Badge variant="outline" className="text-[10px] border-success/30 text-success">
        <TrendingUp className="size-2.5 mr-0.5" />
        +{change.toFixed(1)}%
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive">
      <TrendingDown className="size-2.5 mr-0.5" />
      {change.toFixed(1)}%
    </Badge>
  );
}
