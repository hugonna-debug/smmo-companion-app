import { useQuery } from "convex/react";
import { Shield } from "lucide-react";
import { useState } from "react";
import {
  COMBAT_SLOTS,
  EQUIPMENT_SLOTS,
  formatNumber,
  GATHERING_SLOTS,
  SLOT_ICONS,
  SLOT_LABELS,
} from "@/lib/gameUtils";
import { api } from "../../convex/_generated/api";

const RARITY_COLORS: Record<string, string> = {
  common: "text-muted-foreground",
  uncommon: "text-success",
  rare: "text-blue-400",
  elite: "text-purple-400",
  exotic: "text-orange-400",
  legendary: "text-gold-accent",
  celestial: "text-rarity-celestial",
};

const RARITY_BORDER: Record<string, string> = {
  legendary: "border-gold-accent/30",
  celestial: "border-rarity-celestial/30",
  elite: "border-purple-400/30",
  rare: "border-blue-400/30",
};

type StatTab = "total" | "character" | "equipment" | "bonus";

export function EquipmentPage() {
  const equipment = useQuery(api.gameData.getEquipment);
  const player = useQuery(api.gameData.getPlayerData);
  const [statTab, setStatTab] = useState<StatTab>("total");

  if (equipment === undefined || player === undefined) {
    return (
      <div className="p-3 md:p-4 space-y-3">
        <div className="h-6 w-40 rounded bg-muted animate-pulse" />
        <div className="grid gap-2">
          {[...Array(10)].map((_, i) => (
            <div key={`eqskel-${i}`} className="game-card h-16 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Sort equipment by slot order
  const sortedEquipment = [...equipment].sort((a, b) => {
    return (
      EQUIPMENT_SLOTS.indexOf(a.slot as (typeof EQUIPMENT_SLOTS)[number]) -
      EQUIPMENT_SLOTS.indexOf(b.slot as (typeof EQUIPMENT_SLOTS)[number])
    );
  });

  const combatGear = sortedEquipment.filter(e =>
    (COMBAT_SLOTS as readonly string[]).includes(e.slot),
  );
  const gatheringGear = sortedEquipment.filter(e =>
    (GATHERING_SLOTS as readonly string[]).includes(e.slot),
  );
  const filledSlots = equipment.filter(e => e.itemName).length;

  // Calculate total stats from equipment
  const totalStr = equipment.reduce((sum, e) => sum + (e.strBonus || 0), 0);
  const totalDef = equipment.reduce((sum, e) => sum + (e.defBonus || 0), 0);
  const totalCrit = equipment.reduce((sum, e) => sum + (e.critPercent || 0), 0);

  // Stat breakdown tabs (matching real SMMO Your Stats: Character/Equipment/Bonus/Total)
  const statBreakdown = {
    character: {
      str: player?.coreStr ?? 0,
      def: player?.coreDef ?? 0,
      dex: player?.coreDex ?? 0,
    },
    equipment: {
      str: player?.equipStr ?? 0,
      def: player?.equipDef ?? 0,
      dex: player?.equipDex ?? 0,
    },
    bonus: {
      str: player?.bonusStr ?? 0,
      def: player?.bonusDef ?? 0,
      dex: player?.bonusDex ?? 0,
    },
    total: {
      str: player?.totalStr ?? 0,
      def: player?.totalDef ?? 0,
      dex: player?.totalDex ?? 0,
    },
  };

  const currentStats = statBreakdown[statTab];

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      <div className="flex items-center gap-2">
        <Shield className="size-5 text-chart-3" />
        <h1 className="text-lg font-bold">Equipment</h1>
      </div>

      {/* Equipment total stats */}
      <div className="game-card flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Slots
          </p>
          <p className="text-lg font-bold">
            <span className="text-primary">{filledSlots}</span>
            <span className="text-muted-foreground text-sm">
              /{EQUIPMENT_SLOTS.length}
            </span>
          </p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Equip STR
          </p>
          <p className="text-lg font-bold text-chart-4">
            ⚔ {formatNumber(totalStr)}
          </p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Equip DEF
          </p>
          <p className="text-lg font-bold text-chart-3">
            🛡 {formatNumber(totalDef)}
          </p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Crit
          </p>
          <p className="text-lg font-bold text-warning">
            ✧ {totalCrit.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Stat Breakdown Tabs (matching real SMMO: Character/Equipment/Bonus/Total) */}
      {player && (
        <div className="game-card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gold-dim uppercase tracking-wider">
              Stat Breakdown
            </h2>
            {player.spAtkDamage !== undefined && (
              <span className="text-[10px] text-chart-2 font-medium">
                spATK +{player.spAtkDamage}%
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5 mb-3">
            {(["character", "equipment", "bonus", "total"] as const).map(
              tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatTab(tab)}
                  className={`flex-1 text-[10px] font-medium py-1.5 rounded-md transition-all ${
                    statTab === tab
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ),
            )}
          </div>

          {/* Stat values */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-chart-4/5 border border-chart-4/15">
              <span className="text-[10px] font-bold text-chart-4">STR</span>
              <p className="text-2xl font-bold mt-1 text-chart-4">
                {formatNumber(currentStats.str)}
              </p>
              {statTab === "total" && player.strRank && (
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {player.strRank}
                </p>
              )}
            </div>
            <div className="text-center p-3 rounded-lg bg-chart-1/5 border border-chart-1/15">
              <span className="text-[10px] font-bold text-chart-1">DEF</span>
              <p className="text-2xl font-bold mt-1 text-chart-1">
                {formatNumber(currentStats.def)}
              </p>
              {statTab === "total" && player.defRank && (
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {player.defRank}
                </p>
              )}
            </div>
            <div className="text-center p-3 rounded-lg bg-chart-5/5 border border-chart-5/15">
              <span className="text-[10px] font-bold text-chart-5">DEX</span>
              <p className="text-2xl font-bold mt-1 text-chart-5">
                {formatNumber(currentStats.dex)}
              </p>
              {statTab === "total" && player.dexRank && (
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {player.dexRank}
                </p>
              )}
            </div>
          </div>

          {/* Available stat points alert */}
          {player.availableStatPoints !== undefined &&
            player.availableStatPoints > 0 && (
              <div className="mt-2 p-2 rounded-md bg-warning/10 border border-warning/20 text-center">
                <span className="text-[11px] font-medium text-warning">
                  ⚠ {player.availableStatPoints} unspent stat points available!
                </span>
              </div>
            )}
        </div>
      )}

      {/* Combat Gear */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
          Combat Gear ({combatGear.filter(e => e.itemName).length}/
          {combatGear.length})
        </p>
        <div className="space-y-1.5">
          {combatGear.map(eq => (
            <EquipmentCard key={eq._id} equipment={eq} />
          ))}
        </div>
      </div>

      {/* Gathering Tools */}
      {gatheringGear.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
            Gathering Tools ({gatheringGear.filter(e => e.itemName).length}/
            {gatheringGear.length})
          </p>
          <div className="space-y-1.5">
            {gatheringGear.map(eq => (
              <EquipmentCard key={eq._id} equipment={eq} />
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Mock data · Connect API key for real equipment
      </p>
    </div>
  );
}

function EquipmentCard({
  equipment,
}: {
  equipment: {
    _id: string;
    slot: string;
    itemName?: string;
    rarity?: string;
    strBonus?: number;
    defBonus?: number;
    critPercent?: number;
    level?: number;
  };
}) {
  const isEmpty = !equipment.itemName;
  const slotLabel = SLOT_LABELS[equipment.slot] || equipment.slot;
  const rarity = equipment.rarity || "common";
  const borderClass = RARITY_BORDER[rarity] || "border-blue-500/30";

  // Build stat string like real SMMO: "+12,500 str +30% crit +2,000 def"
  const stats: string[] = [];
  if (equipment.strBonus)
    stats.push(`+${formatNumber(equipment.strBonus)} str`);
  if (equipment.defBonus)
    stats.push(`+${formatNumber(equipment.defBonus)} def`);
  if (equipment.critPercent) stats.push(`+${equipment.critPercent}% crit`);

  return (
    <div
      className={`game-card ${
        isEmpty
          ? "border-dashed border-muted-foreground/20 bg-muted/10"
          : borderClass
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`size-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
            isEmpty ? "bg-muted/20" : "bg-secondary/50"
          }`}
        >
          {SLOT_ICONS[equipment.slot] || "📦"}
        </div>
        <div className="flex-1 min-w-0">
          {isEmpty ? (
            <p className="text-sm text-muted-foreground/50 italic">
              Empty {slotLabel}
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <p
                  className={`text-sm font-semibold truncate ${RARITY_COLORS[rarity] || "text-cyan-400"}`}
                >
                  {equipment.itemName}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {stats.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    {stats.join(" · ")}
                  </p>
                )}
              </div>
              <span
                className={`text-[9px] capitalize ${RARITY_COLORS[rarity] || "text-muted-foreground"}`}
              >
                {rarity}
              </span>
            </>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0 text-right">
          {slotLabel}
        </span>
      </div>
    </div>
  );
}
