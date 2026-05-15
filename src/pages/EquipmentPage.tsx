import { useQuery } from "convex/react";
import { Shield } from "lucide-react";
import { api } from "../../convex/_generated/api";
import {
  formatNumber,
  EQUIPMENT_SLOTS,
  COMBAT_SLOTS,
  GATHERING_SLOTS,
  SLOT_ICONS,
  SLOT_LABELS,
} from "@/lib/gameUtils";

export function EquipmentPage() {
  const equipment = useQuery(api.gameData.getEquipment);
  const player = useQuery(api.gameData.getPlayerData);

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
    return EQUIPMENT_SLOTS.indexOf(a.slot as typeof EQUIPMENT_SLOTS[number]) -
           EQUIPMENT_SLOTS.indexOf(b.slot as typeof EQUIPMENT_SLOTS[number]);
  });

  const combatGear = sortedEquipment.filter(e => (COMBAT_SLOTS as readonly string[]).includes(e.slot));
  const gatheringGear = sortedEquipment.filter(e => (GATHERING_SLOTS as readonly string[]).includes(e.slot));

  const filledSlots = equipment.filter((e) => e.itemName).length;

  // Calculate total stats from equipment
  const totalStr = equipment.reduce((sum, e) => sum + (e.strBonus || 0), 0);
  const totalDef = equipment.reduce((sum, e) => sum + (e.defBonus || 0), 0);
  const totalCrit = equipment.reduce((sum, e) => sum + (e.critPercent || 0), 0);

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      <div className="flex items-center gap-2">
        <Shield className="size-5 text-chart-3" />
        <h1 className="text-lg font-bold">Equipment</h1>
      </div>

      {/* Total stats */}
      <div className="game-card flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Slots</p>
          <p className="text-lg font-bold">
            <span className="text-primary">{filledSlots}</span>
            <span className="text-muted-foreground text-sm">/{EQUIPMENT_SLOTS.length}</span>
          </p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total STR</p>
          <p className="text-lg font-bold text-chart-4">⚔ {formatNumber(totalStr)}</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total DEF</p>
          <p className="text-lg font-bold text-chart-3">🛡 {formatNumber(totalDef)}</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Crit</p>
          <p className="text-lg font-bold text-warning">✧ {totalCrit.toFixed(1)}%</p>
        </div>
      </div>

      {/* Combat Gear */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
          Combat Gear
        </p>
        <div className="space-y-1.5">
          {combatGear.map((eq) => (
            <EquipmentCard key={eq._id} equipment={eq} />
          ))}
        </div>
      </div>

      {/* Gathering Tools */}
      {gatheringGear.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
            Gathering Tools
          </p>
          <div className="space-y-1.5">
            {gatheringGear.map((eq) => (
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

  // Build stat string like real SMMO: "+12,500 str +30% crit +2,000 def"
  const stats: string[] = [];
  if (equipment.strBonus) stats.push(`+${formatNumber(equipment.strBonus)} str`);
  if (equipment.defBonus) stats.push(`+${formatNumber(equipment.defBonus)} def`);
  if (equipment.critPercent) stats.push(`+${equipment.critPercent}% crit`);

  return (
    <div
      className={`game-card ${
        isEmpty
          ? "border-dashed border-muted-foreground/20 bg-muted/10"
          : "border-blue-500/30"
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
            <p className="text-sm text-muted-foreground/50 italic">Empty {slotLabel}</p>
          ) : (
            <>
              <p className="text-sm font-semibold truncate text-cyan-400">
                {equipment.itemName}
              </p>
              {stats.length > 0 && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {stats.join(" ")}
                </p>
              )}
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
