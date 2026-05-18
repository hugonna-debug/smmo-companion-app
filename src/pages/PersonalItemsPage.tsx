import { useMutation, useQuery } from "convex/react";
import {
  Package,
  Search,
  Star,
  StarOff,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatGold, getRarityBorder, getRarityColor } from "@/lib/gameUtils";
import { api } from "../../convex/_generated/api";

const CATEGORIES = [
  { key: "all", label: "All", icon: "📦" },
  { key: "inventory", label: "Inventory", icon: "🎒" },
  { key: "storage", label: "Storage", icon: "🏪" },
  { key: "showcase", label: "Showcase", icon: "🏆" },
  { key: "avatar", label: "Avatars", icon: "🎨" },
  { key: "custom", label: "Custom", icon: "⭐" },
] as const;

export function PersonalItemsPage() {
  const items = useQuery(api.gameData.getPersonalItems);
  const toggleFav = useMutation(api.gameData.toggleFavoriteItem);
  const removeItem = useMutation(api.gameData.removePersonalItem);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  const filtered = useMemo(() => {
    if (!items) return [];
    let list = [...items];
    if (activeCategory !== "all")
      list = list.filter(i => i.category === activeCategory);
    if (showFavsOnly) list = list.filter(i => i.isFavorite);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        i =>
          i.itemName.toLowerCase().includes(q) ||
          i.notes?.toLowerCase().includes(q),
      );
    }
    // Sort: favorites first, then by name
    list.sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return a.itemName.localeCompare(b.itemName);
    });
    return list;
  }, [items, activeCategory, search, showFavsOnly]);

  if (items === undefined) {
    return (
      <div className="p-3 md:p-4 space-y-3">
        <div className="h-6 w-44 rounded bg-muted animate-pulse" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={`cskel-${i}`}
              className="h-8 w-16 rounded bg-muted animate-pulse"
            />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={`iskel-${i}`} className="game-card h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  const totalItems = items.length;
  const totalValue = items.reduce(
    (sum, i) => sum + (i.value ?? 0) * i.quantity,
    0,
  );
  const favCount = items.filter(i => i.isFavorite).length;
  const categoryCounts = CATEGORIES.slice(1).reduce(
    (acc, c) => {
      acc[c.key] = items.filter(i => i.category === c.key).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      <div className="flex items-center gap-2">
        <Package className="size-5 text-chart-2" />
        <h1 className="text-lg font-bold">Item Tracker</h1>
      </div>

      {/* Summary */}
      <div className="game-card flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Items
          </p>
          <p className="text-lg font-bold text-primary">{totalItems}</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Est. Value
          </p>
          <p className="text-lg font-bold text-gold-dim">
            💰 {formatGold(totalValue)}
          </p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Favorites
          </p>
          <p className="text-lg font-bold text-warning">⭐ {favCount}</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-0.5 -mx-1 px-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all shrink-0 ${
              activeCategory === cat.key
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground bg-secondary/30"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
            {cat.key !== "all" && (
              <span className="text-[9px] text-muted-foreground ml-0.5">
                {categoryCounts[cat.key] || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search + Fav filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full h-8 text-xs bg-input border border-border rounded-md pl-7 pr-2 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button
          variant={showFavsOnly ? "secondary" : "ghost"}
          size="sm"
          className="h-8 px-2 text-[11px]"
          onClick={() => setShowFavsOnly(!showFavsOnly)}
        >
          <Star
            className={`size-3 ${showFavsOnly ? "text-warning fill-warning" : ""}`}
          />
          Favs
        </Button>
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="game-card text-center py-8">
          <Package className="size-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No items found</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            {search
              ? "Try a different search"
              : "Connect API key to load your items"}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(item => (
            <div
              key={item._id}
              className={`game-card ${getRarityBorder(item.rarity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-secondary/50 flex items-center justify-center text-lg shrink-0">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold truncate ${getRarityColor(item.rarity)}`}
                    >
                      {item.itemName}
                    </span>
                    {item.quantity > 1 && (
                      <Badge variant="outline" className="text-[9px] shrink-0">
                        x{item.quantity}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {item.rarity && (
                      <span
                        className={`text-[10px] font-medium capitalize ${getRarityColor(item.rarity)}`}
                      >
                        {item.rarity}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {item.category}
                    </span>
                    {item.value ? (
                      <span className="text-[10px] text-gold-dim">
                        💰 {formatGold(item.value * item.quantity)}
                      </span>
                    ) : null}
                  </div>
                  {item.notes && (
                    <div className="flex items-center gap-1 mt-1">
                      <StickyNote className="size-2.5 text-muted-foreground shrink-0" />
                      <p className="text-[10px] text-muted-foreground truncate">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleFav({ itemId: item._id })}
                  >
                    {item.isFavorite ? (
                      <Star className="size-3.5 text-warning fill-warning" />
                    ) : (
                      <StarOff className="size-3.5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem({ itemId: item._id })}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Mock data · Connect API key for real inventory sync
      </p>
    </div>
  );
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case "inventory":
      return "🎒";
    case "storage":
      return "🏪";
    case "showcase":
      return "🏆";
    case "avatar":
      return "🎨";
    case "custom":
      return "⭐";
    default:
      return "📦";
  }
}
