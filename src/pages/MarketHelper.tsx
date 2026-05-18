import { useAction, useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  LineChart as LineChartIcon,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatGold, getRarityColor } from "@/lib/gameUtils";
import { api } from "../../convex/_generated/api";

export function MarketHelper() {
  const tracked = useQuery(api.gameData.getMarketTracking);
  const syncMarket = useAction(api.market.syncMarketPrices);
  const setAlert = useMutation(api.market.setPriceAlert);

  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!tracked) return [];
    if (!search) return tracked;
    const q = search.toLowerCase();
    return tracked.filter((i) => i.itemName.toLowerCase().includes(q));
  }, [tracked, search]);

  const selectedItem = useMemo(() => {
    return tracked?.find((i) => i.itemId === selectedItemId);
  }, [tracked, selectedItemId]);

  const handleSync = async () => {
    setIsSyncing(true);
    const promise = syncMarket();
    toast.promise(promise, {
      loading: "Syncing market prices...",
      success: "Market prices updated!",
      error: (err) => `Sync failed: ${err.message}`,
    });
    try {
      await promise;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSetAlert = async (trackingId: any, value: string) => {
    const alertBelow = value === "" ? null : Number(value);
    await setAlert({ trackingId, alertBelow });
  };

  if (tracked === undefined) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LineChartIcon className="size-5 text-chart-2" />
          <h1 className="text-xl font-bold">Market Helper</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          className="h-8 gap-2"
        >
          <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          Sync Market
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Track price trends and set alerts for your favorite items.
      </p>

      {/* Item Detail / Chart View */}
      {selectedItem && (
        <div className="game-card space-y-4 border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedItemId(null)}
              className="h-8 -ml-2 text-muted-foreground"
            >
              <ArrowLeft className="size-4 mr-1" />
              Back to list
            </Button>
            <Badge variant="outline" className={getRarityColor(selectedItem.rarity)}>
              {selectedItem.rarity}
            </Badge>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h2 className={`text-lg font-bold ${getRarityColor(selectedItem.rarity)}`}>
                {selectedItem.itemName}
              </h2>
              <p className="text-xs text-muted-foreground">
                Item ID: {selectedItem.itemId} • {selectedItem.type}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-success">
                Low: {formatGold(selectedItem.currentLow ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                High: {formatGold(selectedItem.currentHigh ?? 0)}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-48 w-full mt-2">
            {selectedItem.priceHistory && selectedItem.priceHistory.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedItem.priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    hide
                    domain={["dataMin", "dataMax"]}
                    type="number"
                  />
                  <YAxis
                    hide
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border p-2 rounded shadow-md text-[10px]">
                            <p className="font-bold text-gold">
                              {formatGold(payload[0].value as number)}
                            </p>
                            <p className="text-muted-foreground">
                              {new Date(payload[0].payload.timestamp).toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    dot={{ r: 2, fill: "var(--chart-2)" }}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
                <LineChartIcon className="size-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Not enough price history to show chart
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  Try syncing again later to build history
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Alert Below
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Bell className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-warning" />
                  <input
                    type="number"
                    defaultValue={selectedItem.alertBelow ?? ""}
                    onBlur={(e) => handleSetAlert(selectedItem._id, e.target.value)}
                    placeholder="Enter price..."
                    className="w-full h-8 text-xs bg-input border border-border rounded-md pl-7 pr-2"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Circulation
              </label>
              <p className="text-sm font-mono mt-1.5">
                {selectedItem.circulation ?? "Unknown"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {!selectedItem && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter tracked items..."
            className="w-full h-10 bg-input border border-border rounded-lg pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {/* List */}
      {!selectedItem && (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <Search className="size-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No matching items found</p>
            </div>
          ) : (
            filtered.map((item) => {
              const change = getPriceChange(item.priceHistory);
              const isAlerting = item.alertBelow && item.currentLow && item.currentLow <= item.alertBelow;

              return (
                <button
                  key={item._id}
                  onClick={() => setSelectedItemId(item.itemId)}
                  className={`w-full text-left game-card hover:border-primary/50 transition-colors ${
                    isAlerting ? "border-warning/40 bg-warning/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-secondary/50 flex items-center justify-center text-lg shrink-0">
                      {getItemEmoji(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold truncate ${getRarityColor(item.rarity)}`}>
                          {item.itemName}
                        </span>
                        {isAlerting && <Bell className="size-3 text-warning animate-pulse" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-success">
                          {formatGold(item.currentLow ?? 0)}
                        </span>
                        {item.alertBelow && (
                          <span className="text-[10px] text-muted-foreground">
                            (Limit: {formatGold(item.alertBelow)})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <PriceIndicator change={change} />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {item.circulation ? `${item.circulation} in circ` : "Price history: " + (item.priceHistory?.length ?? 0)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function getPriceChange(history?: { price: number; timestamp: number }[]) {
  if (!history || history.length < 2) return 0;
  const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
  const latest = sorted[sorted.length - 1].price;
  const prev = sorted[sorted.length - 2].price;
  if (prev === 0) return 0;
  return ((latest - prev) / prev) * 100;
}

function PriceIndicator({ change }: { change: number }) {
  if (Math.abs(change) < 0.1) return <Badge variant="outline" className="text-[10px] opacity-50">Stable</Badge>;
  
  if (change > 0) {
    return (
      <div className="flex items-center text-success text-[10px] font-bold">
        <TrendingUp className="size-3 mr-0.5" />
        +{change.toFixed(1)}%
      </div>
    );
  }

  return (
    <div className="flex items-center text-destructive text-[10px] font-bold">
      <TrendingDown className="size-3 mr-0.5" />
      {change.toFixed(1)}%
    </div>
  );
}

function getItemEmoji(type?: string) {
  switch (type?.toLowerCase()) {
    case "weapon": return "⚔️";
    case "armour": return "🛡️";
    case "amulet": return "📿";
    case "shield": return "🔰";
    case "boots": return "👢";
    default: return "📦";
  }
}
