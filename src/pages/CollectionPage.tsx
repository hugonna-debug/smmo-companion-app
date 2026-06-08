import { useMutation, useQuery } from "convex/react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Lock,
  Package,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "../../convex/_generated/api";

// Real SMMO collection categories from video (frame 99)
const CATEGORIES = [
  { key: "all", label: "All", emoji: "📦", count: 0 },
  { key: "avatar", label: "Avatars", emoji: "👤", count: 31 },
  { key: "collectable", label: "Collectables", emoji: "🔗", count: 1188 },
  { key: "item", label: "Items", emoji: "🛡️", count: 2447 },
  { key: "sprite", label: "Sprites", emoji: "✨", count: 337 },
  { key: "background", label: "Backgrounds", emoji: "🖼️", count: 108 },
  { key: "card", label: "Cards", emoji: "🃏", count: 0 },
  { key: "event", label: "Events", emoji: "🎉", count: 0 },
  { key: "npc", label: "NPCs", emoji: "👹", count: 214 },
];

// Chest progress per category (from video: NPCs 214/300 = 71%)
const CHEST_PROGRESS: Record<string, { current: number; target: number }> = {
  avatar: { current: 31, target: 50 },
  collectable: { current: 1188, target: 1500 },
  item: { current: 2447, target: 3000 },
  sprite: { current: 337, target: 500 },
  background: { current: 108, target: 150 },
  card: { current: 0, target: 100 },
  event: { current: 0, target: 50 },
  npc: { current: 214, target: 300 },
};

const RARITY_COLORS: Record<string, string> = {
  common: "text-muted-foreground",
  uncommon: "text-success",
  rare: "text-blue-400",
  elite: "text-purple-400",
  exotic: "text-orange-400",
  legendary: "text-gold-accent",
  celestial: "text-rarity-celestial",
};

const RARITY_BG: Record<string, string> = {
  common: "bg-muted-foreground/10 border-muted-foreground/20",
  uncommon: "bg-success/10 border-success/20",
  rare: "bg-blue-400/10 border-blue-400/20",
  elite: "bg-purple-400/10 border-purple-400/20",
  exotic: "bg-orange-400/10 border-orange-400/20",
  legendary: "bg-gold-accent/10 border-gold-accent/20",
  celestial: "bg-rarity-celestial/10 border-rarity-celestial/20",
};

export function CollectionPage() {
  const collection = useQuery(api.gameData.getCollectionProgress);
  const toggleOwned = useMutation(api.gameData.toggleCollectionOwned);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  if (collection === undefined) {
    return <CollectionSkeleton />;
  }

  // Tracked items from database
  const byCat: Record<string, typeof collection> = {};
  for (const cat of CATEGORIES.filter(c => c.key !== "all")) {
    byCat[cat.key] = collection.filter(c => c.category === cat.key);
  }

  const filtered =
    activeCategory === "all" ? collection : byCat[activeCategory] || [];

  const rarityOrder = [
    "celestial",
    "legendary",
    "exotic",
    "elite",
    "rare",
    "uncommon",
    "common",
  ];
  const sorted = [...filtered].sort((a, b) => {
    if (a.isOwned !== b.isOwned) return a.isOwned ? -1 : 1;
    const aR = rarityOrder.indexOf(a.rarity || "common");
    const bR = rarityOrder.indexOf(b.rarity || "common");
    return aR - bR;
  });

  // Total counts from real game
  const totalCategories = CATEGORIES.filter(c => c.key !== "all");
  const overallOwned = totalCategories.reduce(
    (sum, c) => sum + (CHEST_PROGRESS[c.key]?.current || 0),
    0,
  );
  const overallTotal = totalCategories.reduce(
    (sum, c) => sum + (CHEST_PROGRESS[c.key]?.target || 0),
    0,
  );
  const overallPct =
    overallTotal > 0 ? Math.round((overallOwned / overallTotal) * 100) : 0;

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-gold-accent" />
          <h1 className="text-lg font-bold">Your Collection</h1>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] border-gold-accent/30 text-gold-accent"
        >
          {overallOwned.toLocaleString()} collected
        </Badge>
      </div>

      {/* Category Grid (matching real SMMO Your Collection screen) */}
      <div className="game-card space-y-1">
        {totalCategories.map(cat => {
          const progress = CHEST_PROGRESS[cat.key];
          const pct =
            progress && progress.target > 0
              ? Math.round((progress.current / progress.target) * 100)
              : 0;
          const isExpanded = expandedCat === cat.key;
          const catItems = byCat[cat.key] || [];
          const isActive = activeCategory === cat.key;

          return (
            <div key={cat.key}>
              <button
                type="button"
                aria-expanded={isExpanded}
                aria-controls={`cat-content-${cat.key}`}
                onClick={() => {
                  setActiveCategory(cat.key);
                  setExpandedCat(isExpanded ? null : cat.key);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all hover:bg-secondary/40 ${
                  isActive
                    ? "bg-primary/5 border border-primary/20"
                    : "border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="text-sm font-medium">{cat.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground">
                    {(progress?.current || 0).toLocaleString()}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded category detail */}
              {isExpanded && progress && (
                <div
                  id={`cat-content-${cat.key}`}
                  className="ml-4 mr-2 mb-2 space-y-3"
                >
                  {/* Chest Progress */}
                  <div className="game-card bg-secondary/20">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Package className="size-3.5 text-gold-accent" />
                      <span className="text-xs font-semibold text-gold-dim">
                        Chest Progress
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">
                        {progress.current.toLocaleString()}{" "}
                        <span className="text-muted-foreground font-normal">
                          / {progress.target.toLocaleString()}
                        </span>
                      </span>
                      <span className="text-xs font-mono text-primary">
                        {pct}%
                      </span>
                    </div>
                    <Progress value={pct} className="h-2 mt-1.5" />
                    {pct >= 100 && (
                      <p className="text-[10px] text-success mt-1">
                        ✅ Chest unlocked! View Chest
                      </p>
                    )}
                  </div>

                  {/* Tracked items in this category */}
                  {catItems.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1">
                        Tracked Items ({catItems.length})
                      </p>
                      {catItems.map(item => (
                        <CollectionItem
                          key={item._id}
                          item={item}
                          onToggle={() => toggleOwned({ itemId: item._id })}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground text-center py-3">
                      No tracked items in this category
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Progress Bar */}
      <div className="game-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gold-dim uppercase tracking-wider">
            Overall Collection
          </span>
          <span className="text-sm font-bold text-primary">{overallPct}%</span>
        </div>
        <Progress value={overallPct} className="h-2 mb-2" />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{overallOwned.toLocaleString()} collected</span>
          <span>{overallTotal.toLocaleString()} total items</span>
        </div>
      </div>

      {/* Tracked items list (when "all" selected or specific category) */}
      {activeCategory === "all" && sorted.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1">
            All Tracked Items ({sorted.length})
          </p>
          {sorted.map(item => (
            <CollectionItem
              key={item._id}
              item={item}
              onToggle={() => toggleOwned({ itemId: item._id })}
            />
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Counts from SMMO API · Click items to toggle owned/missing
      </p>
    </div>
  );
}

function CollectionItem({
  item,
  onToggle,
}: {
  item: {
    _id: string;
    itemName: string;
    category: string;
    isOwned: boolean;
    rarity?: string;
    source?: string;
    notes?: string;
    obtainedAt?: number;
  };
  onToggle: () => void;
}) {
  const rarity = item.rarity || "common";
  const catInfo = CATEGORIES.find(c => c.key === item.category);

  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
        item.isOwned
          ? `${RARITY_BG[rarity]} border`
          : "bg-muted/10 border-dashed border-muted-foreground/15 opacity-60"
      }`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={item.isOwned}
        aria-label={
          item.isOwned
            ? `Mark ${item.itemName} as missing`
            : `Mark ${item.itemName} as owned`
        }
        onClick={onToggle}
        className={`size-8 rounded-md flex items-center justify-center shrink-0 transition-all ${
          item.isOwned ? "bg-primary/15" : "bg-muted/20 hover:bg-primary/10"
        }`}
      >
        {item.isOwned ? (
          <Check className={`size-3.5 ${RARITY_COLORS[rarity]}`} />
        ) : (
          <Lock className="size-3 text-muted-foreground/50" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs">{catInfo?.emoji || "📦"}</span>
          <span
            className={`text-[12px] font-semibold truncate ${
              item.isOwned ? RARITY_COLORS[rarity] : "text-muted-foreground"
            }`}
          >
            {item.itemName}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
          <span className={`capitalize ${RARITY_COLORS[rarity]}`}>
            {rarity}
          </span>
          {item.source && <span>· {item.source}</span>}
          {item.obtainedAt && (
            <span>· {new Date(item.obtainedAt).toLocaleDateString()}</span>
          )}
        </div>
        {item.notes && (
          <p className="text-[9px] text-muted-foreground/60 italic mt-0.5">
            {item.notes}
          </p>
        )}
      </div>
    </div>
  );
}

function CollectionSkeleton() {
  return (
    <div className="p-3 md:p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-32 rounded bg-muted animate-pulse" />
      </div>
      <div className="game-card space-y-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={`cskel-${i}`}
            className="h-12 rounded-lg bg-muted/30 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
