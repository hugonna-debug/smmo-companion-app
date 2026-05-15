import { useMutation, useQuery } from "convex/react";
import {
  Trophy,
  Crown,
  Image,
  Award,
  Medal,
  Star,
  Check,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type CollectionCategory = "all" | "avatar" | "background" | "title" | "badge";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  avatar: <Image className="size-3.5 text-chart-5" />,
  background: <Star className="size-3.5 text-chart-2" />,
  title: <Crown className="size-3.5 text-gold-accent" />,
  badge: <Medal className="size-3.5 text-chart-4" />,
  achievement: <Award className="size-3.5 text-chart-1" />,
};

const CATEGORY_EMOJI: Record<string, string> = {
  avatar: "🎭",
  background: "🖼",
  title: "👑",
  badge: "🏅",
  achievement: "🏆",
};

const RARITY_COLORS: Record<string, string> = {
  common: "text-muted-foreground",
  uncommon: "text-success",
  rare: "text-blue-400",
  elite: "text-purple-400",
  legendary: "text-gold-accent",
  celestial: "text-rarity-celestial",
};

const RARITY_BG: Record<string, string> = {
  common: "bg-muted-foreground/10",
  uncommon: "bg-success/10",
  rare: "bg-blue-400/10",
  elite: "bg-purple-400/10",
  legendary: "bg-gold-accent/10",
  celestial: "bg-rarity-celestial/10",
};

export function CollectionPage() {
  const collection = useQuery(api.gameData.getCollectionProgress);
  const toggleOwned = useMutation(api.gameData.toggleCollectionOwned);
  const [activeCategory, setActiveCategory] = useState<CollectionCategory>("all");
  const [showOwned, setShowOwned] = useState(true);
  const [showMissing, setShowMissing] = useState(true);

  if (collection === undefined) {
    return <CollectionSkeleton />;
  }

  // Group by category
  const categories = ["avatar", "background", "title", "badge"];
  const byCat: Record<string, typeof collection> = {};
  for (const cat of categories) {
    byCat[cat] = collection.filter((c) => c.category === cat);
  }

  const filtered = activeCategory === "all" ? collection : byCat[activeCategory] || [];
  const displayed = filtered.filter((c) => (c.isOwned && showOwned) || (!c.isOwned && showMissing));

  // Sort: owned first (by rarity desc), then missing (by rarity desc)
  const rarityOrder = ["celestial", "legendary", "elite", "rare", "uncommon", "common"];
  const sorted = [...displayed].sort((a, b) => {
    if (a.isOwned !== b.isOwned) return a.isOwned ? -1 : 1;
    const aR = rarityOrder.indexOf(a.rarity || "common");
    const bR = rarityOrder.indexOf(b.rarity || "common");
    return aR - bR;
  });

  // Completion stats
  const totalOwned = collection.filter((c) => c.isOwned).length;
  const totalItems = collection.length;
  const completionPct = totalItems > 0 ? Math.round((totalOwned / totalItems) * 100) : 0;

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-gold-accent" />
          <h1 className="text-lg font-bold">Collection</h1>
        </div>
        <Badge variant="outline" className="text-[10px] border-gold-accent/30 text-gold-accent">
          {totalOwned}/{totalItems} ({completionPct}%)
        </Badge>
      </div>

      {/* Overall Completion */}
      <div className="game-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gold-dim uppercase tracking-wider">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-primary">{completionPct}%</span>
        </div>
        <Progress value={completionPct} className="h-2 mb-3" />

        {/* Per-category breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categories.map((cat) => {
            const items = byCat[cat] || [];
            const owned = items.filter((i) => i.isOwned).length;
            const pct = items.length > 0 ? Math.round((owned / items.length) * 100) : 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat as CollectionCategory)}
                className={`rounded-md p-2 text-center transition-all border ${
                  activeCategory === cat
                    ? "border-primary/30 bg-primary/5"
                    : "border-transparent bg-secondary/30 hover:bg-secondary/50"
                }`}
              >
                <span className="text-base">{CATEGORY_EMOJI[cat]}</span>
                <p className="text-[10px] font-medium capitalize mt-0.5">{cat}s</p>
                <p className="text-[10px] text-muted-foreground">
                  {owned}/{items.length}
                </p>
                <div className="h-1 rounded-full bg-muted overflow-hidden mt-1">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
        {(["all", "avatar", "background", "title", "badge"] as const).map((cat) => {
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                activeCategory === cat ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {cat === "all" ? `All` : `${cat.charAt(0).toUpperCase() + cat.slice(1)}s`}
            </button>
          );
        })}
      </div>

      {/* Show/Hide toggles */}
      <div className="flex items-center gap-3 text-[10px]">
        <button
          type="button"
          onClick={() => setShowOwned(!showOwned)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md ${
            showOwned ? "bg-success/10 text-success" : "bg-muted/50 text-muted-foreground"
          }`}
        >
          <Check className="size-2.5" /> Owned ({filtered.filter((c) => c.isOwned).length})
        </button>
        <button
          type="button"
          onClick={() => setShowMissing(!showMissing)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md ${
            showMissing ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground"
          }`}
        >
          <Lock className="size-2.5" /> Missing ({filtered.filter((c) => !c.isOwned).length})
        </button>
      </div>

      {/* Collection Items */}
      {sorted.length === 0 ? (
        <div className="game-card text-center py-8">
          <Trophy className="size-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No items match your filters</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sorted.map((item) => (
            <div
              key={item._id}
              className={`game-card ${
                !item.isOwned ? "opacity-60 border-dashed" : ""
              } ${item.rarity === "celestial" ? "border-rarity-celestial/20" : item.rarity === "legendary" ? "border-gold-accent/20" : ""}`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleOwned({ itemId: item._id })}
                  className={`size-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    item.isOwned
                      ? `${RARITY_BG[item.rarity || "common"]} border border-transparent`
                      : "bg-muted/20 border border-dashed border-muted-foreground/20 hover:border-primary/30"
                  }`}
                >
                  {item.isOwned ? (
                    <Check className={`size-4 ${RARITY_COLORS[item.rarity || "common"]}`} />
                  ) : (
                    <Lock className="size-3.5 text-muted-foreground/50" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {CATEGORY_ICONS[item.category]}
                    <span className={`text-sm font-semibold truncate ${
                      item.isOwned ? RARITY_COLORS[item.rarity || "common"] : "text-muted-foreground"
                    }`}>
                      {item.itemName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                    <span className={`capitalize ${RARITY_COLORS[item.rarity || "common"]}`}>
                      {item.rarity || "common"}
                    </span>
                    {item.source && <span>· {item.source}</span>}
                    {item.obtainedAt && (
                      <span>· {new Date(item.obtainedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 italic">{item.notes}</p>
                  )}
                </div>

                <span className="text-[10px] text-muted-foreground shrink-0 capitalize">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Mock data · Click items to toggle owned/missing · {totalOwned} of {totalItems} collected
      </p>
    </div>
  );
}

function CollectionSkeleton() {
  return (
    <div className="p-3 md:p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-32 rounded bg-muted animate-pulse" />
      </div>
      <div className="game-card h-32 animate-pulse" />
      <div className="flex gap-1 h-8 rounded-lg bg-muted animate-pulse" />
      {[...Array(6)].map((_, i) => (
        <div key={`cskel-${i}`} className="game-card h-16 animate-pulse" />
      ))}
    </div>
  );
}
