type StatValue = string | number | boolean | null | undefined;

export type SmmoV1PlayerInfo = {
  id?: StatValue;
  name?: StatValue;
  level?: StatValue;
  hp?: StatValue;
  max_hp?: StatValue;
  exp?: StatValue;
  exp_to_next_level?: StatValue;
  gold?: StatValue;
  steps?: StatValue;
  npc_kills?: StatValue;
  user_kills?: StatValue;
  user_deaths?: StatValue;
  pvp_deaths?: StatValue;
  quests_complete?: StatValue;
  safeMode?: StatValue;
  membership?: StatValue;
  guild?: {
    id?: StatValue;
    name?: StatValue;
  } | null;
  current_location?: {
    id?: StatValue;
    name?: StatValue;
  } | null;
  tasks_completed?: StatValue;
  boss_kills?: StatValue;
  market_trades?: StatValue;
  reputation?: StatValue;
  bounties_completed?: StatValue;
  dailies_unlocked?: StatValue;
  chests_opened?: StatValue;
};

export type SmmoV2PlayerInfo = {
  id?: StatValue;
  name?: StatValue;
  level?: StatValue;
  currencies?: {
    gold?: StatValue;
    diamonds?: StatValue;
  } | null;
  stats?: {
    core?: StatBlock | null;
    equipment?: StatBlock | null;
    bonus?: {
      fixed?: StatBlock | null;
      percentage?: StatBlock | null;
    } | null;
    total?: StatBlock | null;
  } | null;
  current_health?: StatValue;
  max_health?: StatValue;
  current_energy?: StatValue;
  max_energy?: StatValue;
  current_quest_points?: StatValue;
  max_quest_points?: StatValue;
  available_stat_points?: StatValue;
  safe_mode?: StatValue;
  membership?: StatValue;
  location?: {
    id?: StatValue;
    name?: StatValue;
  } | null;
};

type StatBlock = {
  str?: StatValue;
  def?: StatValue;
  dex?: StatValue;
};

export type SmmoSkill = {
  skill?: StatValue;
  level?: StatValue;
  exp?: StatValue;
};

export type SmmoItemInfo = {
  id?: StatValue;
  name?: StatValue;
  item_name?: StatValue;
  type?: StatValue;
  rarity?: StatValue;
  level?: StatValue;
  stat1?: StatValue;
  stat1modifier?: StatValue;
  stat2?: StatValue;
  stat2modifier?: StatValue;
  stat3?: StatValue;
  stat3modifier?: StatValue;
};

export type PlayerDataPatch = {
  playerId?: number;
  playerName: string;
  level: number;
  hp: number;
  maxHp: number;
  exp: number;
  expToNextLevel: number;
  gold: number;
  diamonds?: number;
  steps: number;
  npcKills: number;
  pvpKills: number;
  pvpDeaths: number;
  questsComplete: number;
  tasksCompleted?: number;
  bossKills?: number;
  marketTrades?: number;
  reputation?: number;
  bountiesCompleted?: number;
  dailiesUnlocked?: number;
  chestsOpened?: number;
  guildId?: number;
  guildName?: string;
  safeMode: boolean;
  energy?: number;
  maxEnergy?: number;
  questPoints?: number;
  maxQuestPoints?: number;
  availableStatPoints?: number;
  membership?: number;
  coreStr?: number;
  coreDef?: number;
  coreDex?: number;
  equipStr?: number;
  equipDef?: number;
  equipDex?: number;
  bonusStr?: number;
  bonusDef?: number;
  bonusDex?: number;
  totalStr?: number;
  totalDef?: number;
  totalDex?: number;
  locationId?: number;
  locationName?: string;
  lastUpdated: number;
};

export type PlayerSkillPatch = {
  skill: string;
  level: number;
  exp: number;
};

export type EquipmentPatch = {
  slot: string;
  itemId?: number;
  itemName?: string;
  rarity?: string;
  attack?: number;
  defense?: number;
  critPercent?: number;
  strBonus?: number;
  defBonus?: number;
  level?: number;
};

function toNumber(value: StatValue, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function maybeNumber(value: StatValue): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return toNumber(value);
}

function maybeString(value: StatValue): string | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  return value;
}

function toBoolean(value: StatValue, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    return ["1", "true", "yes"].includes(value.toLowerCase());
  }
  return fallback;
}

function applyOptionalNumber<T extends Record<string, unknown>>(
  target: T,
  key: keyof T,
  value: StatValue,
) {
  const parsed = maybeNumber(value);
  if (parsed !== undefined) target[key] = parsed as T[keyof T];
}

function applyOptionalString<T extends Record<string, unknown>>(
  target: T,
  key: keyof T,
  value: StatValue,
) {
  const parsed = maybeString(value);
  if (parsed !== undefined) target[key] = parsed as T[keyof T];
}

export function transformPlayerData(
  v1: SmmoV1PlayerInfo,
  v2: SmmoV2PlayerInfo,
  now: number,
): PlayerDataPatch {
  const data: PlayerDataPatch = {
    playerId: maybeNumber(v2.id) ?? maybeNumber(v1.id),
    playerName: maybeString(v2.name) ?? maybeString(v1.name) ?? "Unknown Player",
    level: maybeNumber(v2.level) ?? toNumber(v1.level),
    hp: maybeNumber(v2.current_health) ?? toNumber(v1.hp),
    maxHp: maybeNumber(v2.max_health) ?? toNumber(v1.max_hp),
    exp: toNumber(v1.exp),
    expToNextLevel: maybeNumber(v1.exp_to_next_level) ?? toNumber(v1.exp),
    gold: maybeNumber(v2.currencies?.gold) ?? toNumber(v1.gold),
    steps: toNumber(v1.steps),
    npcKills: toNumber(v1.npc_kills),
    pvpKills: toNumber(v1.user_kills),
    pvpDeaths: maybeNumber(v1.pvp_deaths) ?? toNumber(v1.user_deaths),
    questsComplete: toNumber(v1.quests_complete),
    safeMode: v2.safe_mode !== undefined
      ? toBoolean(v2.safe_mode)
      : toBoolean(v1.safeMode),
    lastUpdated: now,
  };

  applyOptionalNumber(data, "diamonds", v2.currencies?.diamonds);
  applyOptionalNumber(data, "tasksCompleted", v1.tasks_completed);
  applyOptionalNumber(data, "bossKills", v1.boss_kills);
  applyOptionalNumber(data, "marketTrades", v1.market_trades);
  applyOptionalNumber(data, "reputation", v1.reputation);
  applyOptionalNumber(data, "bountiesCompleted", v1.bounties_completed);
  applyOptionalNumber(data, "dailiesUnlocked", v1.dailies_unlocked);
  applyOptionalNumber(data, "chestsOpened", v1.chests_opened);
  applyOptionalNumber(data, "guildId", v1.guild?.id);
  applyOptionalString(data, "guildName", v1.guild?.name);
  applyOptionalNumber(data, "energy", v2.current_energy);
  applyOptionalNumber(data, "maxEnergy", v2.max_energy);
  applyOptionalNumber(data, "questPoints", v2.current_quest_points);
  applyOptionalNumber(data, "maxQuestPoints", v2.max_quest_points);
  applyOptionalNumber(data, "availableStatPoints", v2.available_stat_points);
  applyOptionalNumber(data, "membership", v2.membership ?? v1.membership);
  applyOptionalNumber(data, "coreStr", v2.stats?.core?.str);
  applyOptionalNumber(data, "coreDef", v2.stats?.core?.def);
  applyOptionalNumber(data, "coreDex", v2.stats?.core?.dex);
  applyOptionalNumber(data, "equipStr", v2.stats?.equipment?.str);
  applyOptionalNumber(data, "equipDef", v2.stats?.equipment?.def);
  applyOptionalNumber(data, "equipDex", v2.stats?.equipment?.dex);
  applyOptionalNumber(data, "bonusStr", v2.stats?.bonus?.fixed?.str);
  applyOptionalNumber(data, "bonusDef", v2.stats?.bonus?.fixed?.def);
  applyOptionalNumber(data, "bonusDex", v2.stats?.bonus?.fixed?.dex);
  applyOptionalNumber(data, "totalStr", v2.stats?.total?.str);
  applyOptionalNumber(data, "totalDef", v2.stats?.total?.def);
  applyOptionalNumber(data, "totalDex", v2.stats?.total?.dex);
  applyOptionalNumber(data, "locationId", v1.current_location?.id ?? v2.location?.id);
  applyOptionalString(
    data,
    "locationName",
    v1.current_location?.name ?? v2.location?.name,
  );

  return data;
}

export function transformPlayerSkills(skills: SmmoSkill[]): PlayerSkillPatch[] {
  return skills
    .map(skill => ({
      skill: maybeString(skill.skill) ?? "",
      level: toNumber(skill.level),
      exp: toNumber(skill.exp),
    }))
    .filter(skill => skill.skill !== "");
}

export function normalizeEquipmentSlot(slotName: string): string {
  return slotName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function applyItemStat(target: EquipmentPatch, stat: StatValue, modifier: StatValue) {
  const amount = maybeNumber(modifier);
  const key = maybeString(stat)?.toLowerCase();
  if (amount === undefined || !key) return;

  if (key === "str" || key === "strength") target.strBonus = amount;
  if (key === "def" || key === "defence" || key === "defense") target.defBonus = amount;
  if (key === "crit" || key === "critical" || key === "critical_chance") {
    target.critPercent = amount;
  }
  if (key === "attack") target.attack = amount;
  if (key === "armor" || key === "armour") target.defense = amount;
}

export function transformEquipmentItem(
  itemId: string | number,
  slotName: string,
  item: SmmoItemInfo,
): EquipmentPatch {
  const itemType = maybeString(item.type);
  const name = maybeString(item.name) ?? maybeString(item.item_name);
  const equipment: EquipmentPatch = {
    slot: normalizeEquipmentSlot(slotName),
    itemId: maybeNumber(item.id) ?? toNumber(itemId),
  };

  if (itemType || name) {
    equipment.itemName = [itemType, name].filter(Boolean).join(" ");
  }
  applyOptionalString(equipment, "rarity", item.rarity);
  applyOptionalNumber(equipment, "level", item.level);

  applyItemStat(equipment, item.stat1, item.stat1modifier);
  applyItemStat(equipment, item.stat2, item.stat2modifier);
  applyItemStat(equipment, item.stat3, item.stat3modifier);

  return equipment;
}
