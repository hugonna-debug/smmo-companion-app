// Formatting helpers for game data

export function formatGold(gold: number): string {
  if (gold >= 1_000_000_000) return `${(gold / 1_000_000_000).toFixed(1)}B`;
  if (gold >= 1_000_000) return `${(gold / 1_000_000).toFixed(1)}M`;
  if (gold >= 1_000) return `${(gold / 1_000).toFixed(1)}K`;
  return gold.toLocaleString();
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function getHpColor(_percent: number): string {
  // SMMO uses red HP bars regardless of percentage
  return "text-destructive";
}

export function getHpBarColor(_percent: number): string {
  // SMMO uses red HP bars
  return "bg-destructive";
}

export function getRarityColor(rarity?: string): string {
  switch (rarity) {
    case "common": return "text-rarity-common";
    case "uncommon": return "text-rarity-uncommon";
    case "rare": return "text-rarity-rare";
    case "elite": return "text-rarity-elite";
    case "legendary": return "text-rarity-legendary";
    case "celestial": return "text-rarity-celestial";
    default: return "text-muted-foreground";
  }
}

export function getRarityBorder(rarity?: string): string {
  switch (rarity) {
    case "legendary": return "border-rarity-legendary/40";
    case "celestial": return "border-rarity-celestial/40";
    case "elite": return "border-rarity-elite/30";
    case "rare": return "border-rarity-rare/30";
    default: return "border-border";
  }
}

export function formatTimeRemaining(expiresAt: number): string {
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) return "Expired";
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function getWarStatus(ourScore: number, enemyScore: number): { label: string; color: string } {
  const diff = ourScore - enemyScore;
  if (diff > 200) return { label: "Winning", color: "text-success" };
  if (diff > 0) return { label: "Ahead", color: "text-success" };
  if (diff === 0) return { label: "Tied", color: "text-warning" };
  if (diff > -200) return { label: "Behind", color: "text-warning" };
  return { label: "Losing", color: "text-destructive" };
}

// Real SMMO equipment slots (14 total)
export const EQUIPMENT_SLOTS = [
  "helmet", "amulet", "armour", "weapon", "shield",
  "greaves", "gauntlet", "boots", "pet", "special",
  "wood_axe", "fishing_rod", "pickaxe", "shovel",
] as const;

export const COMBAT_SLOTS = [
  "helmet", "amulet", "armour", "weapon", "shield",
  "greaves", "gauntlet", "boots", "pet", "special",
] as const;

export const GATHERING_SLOTS = [
  "wood_axe", "fishing_rod", "pickaxe", "shovel",
] as const;

export const SLOT_LABELS: Record<string, string> = {
  helmet: "Helmet",
  amulet: "Amulet",
  armour: "Armour",
  weapon: "Weapon",
  shield: "Shield",
  greaves: "Greaves",
  gauntlet: "Gauntlet",
  boots: "Boots",
  pet: "Pet",
  special: "Special",
  wood_axe: "Wood Axe",
  fishing_rod: "Fishing Rod",
  pickaxe: "Pickaxe",
  shovel: "Shovel",
};

export const SLOT_ICONS: Record<string, string> = {
  helmet: "⛑️",
  amulet: "📿",
  armour: "🛡️",
  weapon: "⚔️",
  shield: "🔰",
  greaves: "🦿",
  gauntlet: "🧤",
  boots: "👢",
  pet: "🐾",
  special: "⭐",
  wood_axe: "🪓",
  fishing_rod: "🎣",
  pickaxe: "⛏️",
  shovel: "🪏",
};

// Temple gods data
export const TEMPLE_GODS = [
  { id: "mortem", name: "Mortem", title: "The God of Death", bonus: "+20% Strength", duration: 60 },
  { id: "gallhar", name: "Gall'har", title: "The God of War", bonus: "+15% Exp", duration: 60 },
  { id: "dirella", name: "Dirella", title: "The God of Vigour", bonus: "+20% Defence", duration: 60 },
  { id: "zimos", name: "Zimos", title: "The God of Nothing", bonus: "Nothing", duration: 60 },
  { id: "olo", name: "O'lo", title: "The God of Wisdom", bonus: "+20% Dexterity", duration: 60 },
  { id: "balthazar", name: "Balthazar", title: "The King of the Gods", bonus: "+15% Step Speed", duration: 60 },
] as const;

// Skill names and icons
export const SKILL_INFO: Record<string, { icon: string; color: string }> = {
  woodcutting: { icon: "🪓", color: "text-success" },
  fishing: { icon: "🐟", color: "text-info" },
  treasure_hunting: { icon: "🗺️", color: "text-warning" },
  mining: { icon: "⛏️", color: "text-chart-1" },
  crafting: { icon: "🔨", color: "text-chart-5" },
  event_gathering: { icon: "🎪", color: "text-chart-2" },
  knight: { icon: "🗡️", color: "text-chart-4" },
};
