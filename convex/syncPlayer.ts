import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { action, internalMutation } from "./_generated/server";

const EQUIPMENT_SLOTS = [
  "helmet",
  "amulet",
  "armour",
  "weapon",
  "shield",
  "greaves",
  "gauntlet",
  "boots",
  "pet",
  "special",
  "wood_axe",
  "fishing_rod",
  "pickaxe",
  "shovel",
] as const;

type StoredCredentials = {
  smmoPlayerId: number;
};

type SyncResult = {
  synced: boolean;
  message: string;
  count?: number;
};

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asOptionalNumber(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    if (value === "1" || value.toLowerCase() === "true") return true;
    if (value === "0" || value.toLowerCase() === "false") return false;
  }
  return fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function getPath(obj: unknown, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  const filtered = Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as T;
  return filtered;
}

function normalizeSlot(rawSlot: unknown): string {
  const normalized = String(rawSlot ?? "")
    .trim()
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/[\s-]+/g, "_");

  const aliasMap: Record<string, string> = {
    armor: "armour",
    chest: "armour",
    gauntlets: "gauntlet",
    gloves: "gauntlet",
    legs: "greaves",
    leg: "greaves",
    fishingrod: "fishing_rod",
    fishingpole: "fishing_rod",
    rod: "fishing_rod",
    axe: "wood_axe",
    woodaxe: "wood_axe",
  };

  if (aliasMap[normalized]) return aliasMap[normalized];
  return normalized;
}

function readStatModifier(item: Record<string, unknown>, statMatcher: (statName: string) => boolean): number {
  let total = 0;
  for (const index of [1, 2, 3]) {
    const statName = String(item[`stat${index}`] ?? "").toLowerCase();
    if (!statMatcher(statName)) continue;
    total += asNumber(item[`stat${index}modifier`], 0);
  }
  return total;
}

async function getCredentials(ctx: any, userId: Id<"users">): Promise<StoredCredentials | null> {
  const credentials = (await ctx.runQuery(internal.smmoApi.getStoredCredentials, { userId })) as {
    smmoPlayerId?: number;
  } | null;

  if (!credentials?.smmoPlayerId) return null;
  return { smmoPlayerId: credentials.smmoPlayerId };
}

async function fetchEndpoint(ctx: any, userId: Id<"users">, endpoint: string): Promise<unknown> {
  return await ctx.runAction(internal.smmoApi.fetchSmmoEndpoint, { userId, endpoint });
}

async function syncPlayerDataForUser(
  ctx: any,
  userId: Id<"users">,
  credentials: StoredCredentials,
): Promise<SyncResult> {
  const v1Info = (await fetchEndpoint(ctx, userId, `/v1/player/info/${credentials.smmoPlayerId}`)) as Record<
    string,
    unknown
  >;
  const v2Info = (await fetchEndpoint(ctx, userId, "/v2/player/info")) as Record<string, unknown>;

  const stats = (getPath(v2Info, ["stats"]) ?? {}) as Record<string, unknown>;
  const coreStats = (getPath(stats, ["core"]) ?? {}) as Record<string, unknown>;
  const equipmentStats = (getPath(stats, ["equipment"]) ?? {}) as Record<string, unknown>;
  const bonusStats = (getPath(stats, ["bonus", "fixed"]) ?? {}) as Record<string, unknown>;
  const totalStats = (getPath(stats, ["total"]) ?? {}) as Record<string, unknown>;

  const currencies = (getPath(v2Info, ["currencies"]) ?? {}) as Record<string, unknown>;
  const guild = (getPath(v1Info, ["guild"]) ?? {}) as Record<string, unknown>;
  const v1Location = (getPath(v1Info, ["current_location"]) ?? {}) as Record<string, unknown>;
  const v2Location = (getPath(v2Info, ["location"]) ?? {}) as Record<string, unknown>;

  const now = Date.now();
  const payload = stripUndefined({
    playerId: asNumber(v2Info.id ?? v1Info.id, credentials.smmoPlayerId),
    playerName: String(v2Info.name ?? v1Info.name ?? "Unknown Adventurer"),
    level: asNumber(v2Info.level ?? v1Info.level, 0),
    hp: asNumber(v2Info.current_health ?? v1Info.hp, 0),
    maxHp: asNumber(v2Info.max_health ?? v1Info.max_hp ?? v2Info.current_health ?? v1Info.hp, 0),
    exp: asNumber(v1Info.exp, 0),
    expToNextLevel: asNumber(v1Info.exp_to_next_level ?? v1Info.exp, 0),
    gold: asNumber(currencies.gold ?? v1Info.gold, 0),
    bank: asOptionalNumber(v1Info.bank),
    diamonds: asOptionalNumber(currencies.diamonds),
    steps: asNumber(v1Info.steps, 0),
    npcKills: asNumber(v1Info.npc_kills, 0),
    pvpKills: asNumber(v1Info.user_kills, 0),
    pvpDeaths: asNumber(v1Info.user_deaths, 0),
    questsComplete: asNumber(v1Info.quests_complete, 0),
    questsPerformed: asOptionalNumber(v1Info.quests_performed),
    tasksCompleted: asOptionalNumber(v1Info.tasks_completed),
    bossKills: asOptionalNumber(v1Info.boss_kills),
    marketTrades: asOptionalNumber(v1Info.market_trades),
    p2pTrades: asOptionalNumber(v1Info.p2p_trades),
    reputation: asOptionalNumber(v1Info.reputation),
    bountiesCompleted: asOptionalNumber(v1Info.bounties_completed),
    dailiesUnlocked: asOptionalNumber(v1Info.dailies_unlocked),
    chestsOpened: asOptionalNumber(v1Info.chests_opened),
    guildId: asOptionalNumber(guild.id),
    guildName: asOptionalString(guild.name),
    safeMode: asBoolean(v2Info.safe_mode, asBoolean(v1Info.safeMode, false)),
    energy: asOptionalNumber(v2Info.current_energy),
    maxEnergy: asOptionalNumber(v2Info.max_energy),
    questPoints: asOptionalNumber(v2Info.current_quest_points),
    maxQuestPoints: asOptionalNumber(v2Info.max_quest_points),
    availableStatPoints: asOptionalNumber(v2Info.available_stat_points),
    membership: asOptionalNumber(v2Info.membership ?? v1Info.membership),
    coreStr: asOptionalNumber(coreStats.str),
    coreDef: asOptionalNumber(coreStats.def),
    coreDex: asOptionalNumber(coreStats.dex),
    equipStr: asOptionalNumber(equipmentStats.str),
    equipDef: asOptionalNumber(equipmentStats.def),
    equipDex: asOptionalNumber(equipmentStats.dex),
    bonusStr: asOptionalNumber(bonusStats.str),
    bonusDef: asOptionalNumber(bonusStats.def),
    bonusDex: asOptionalNumber(bonusStats.dex),
    totalStr: asOptionalNumber(totalStats.str),
    totalDef: asOptionalNumber(totalStats.def),
    totalDex: asOptionalNumber(totalStats.dex),
    locationId: asOptionalNumber(v1Location.id ?? v2Location.id),
    locationName: asOptionalString(v1Location.name ?? v2Location.name),
    lastUpdated: now,
  });

  await ctx.runMutation(internal.syncPlayer.upsertPlayerDataInternal, {
    userId,
    playerData: payload,
  });
  await ctx.runMutation(internal.syncPlayer.markSyncMetadataInternal, {
    userId,
    syncedAt: now,
  });

  return {
    synced: true,
    message: `Player data synced for ${payload.playerName}`,
    count: 1,
  };
}

async function syncPlayerSkillsForUser(
  ctx: any,
  userId: Id<"users">,
  credentials: StoredCredentials,
): Promise<SyncResult> {
  const rawSkills = await fetchEndpoint(ctx, userId, `/v1/player/skills/${credentials.smmoPlayerId}`);
  const skillArray = Array.isArray(rawSkills) ? rawSkills : [];
  const mappedSkills = skillArray
    .filter(entry => entry && typeof entry === "object")
    .map(entry => {
      const record = entry as Record<string, unknown>;
      return stripUndefined({
        skill: String(record.skill ?? "unknown"),
        level: asNumber(record.level, 0),
        exp: asNumber(record.exp, 0),
      });
    });

  await ctx.runMutation(internal.syncPlayer.replacePlayerSkillsInternal, {
    userId,
    skills: mappedSkills,
  });

  return {
    synced: true,
    message: `Synced ${mappedSkills.length} skills`,
    count: mappedSkills.length,
  };
}

async function syncEquipmentForUser(
  ctx: any,
  userId: Id<"users">,
  credentials: StoredCredentials,
): Promise<SyncResult> {
  const equipmentMapRaw = await fetchEndpoint(ctx, userId, `/v1/player/equipment/${credentials.smmoPlayerId}`);
  const equipmentMap =
    equipmentMapRaw && typeof equipmentMapRaw === "object"
      ? (equipmentMapRaw as Record<string, unknown>)
      : {};

  const equipmentBySlot = new Map<string, Record<string, unknown>>();

  for (const [itemIdRaw, slotRaw] of Object.entries(equipmentMap)) {
    const itemId = asNumber(itemIdRaw, 0);
    if (!itemId) continue;
    const normalizedSlot = normalizeSlot(slotRaw);
    const itemDetailsRaw = await fetchEndpoint(ctx, userId, `/v1/items/info/${itemId}`);
    const itemDetails =
      itemDetailsRaw && typeof itemDetailsRaw === "object"
        ? (itemDetailsRaw as Record<string, unknown>)
        : {};

    const strBonus = readStatModifier(itemDetails, stat =>
      stat.includes("str") || stat.includes("strength"),
    );
    const defBonus = readStatModifier(itemDetails, stat =>
      stat.includes("def") || stat.includes("defense"),
    );
    const critPercent = readStatModifier(itemDetails, stat => stat.includes("crit"));

    equipmentBySlot.set(
      normalizedSlot,
      stripUndefined({
        slot: normalizedSlot,
        itemId: asNumber(itemDetails.id, itemId),
        itemName: asOptionalString(itemDetails.name) ?? `Item #${itemId}`,
        rarity: asOptionalString(itemDetails.rarity)?.toLowerCase(),
        attack: strBonus > 0 ? strBonus : undefined,
        defense: defBonus > 0 ? defBonus : undefined,
        critPercent: critPercent > 0 ? critPercent : undefined,
        strBonus: strBonus > 0 ? strBonus : undefined,
        defBonus: defBonus > 0 ? defBonus : undefined,
        level: asOptionalNumber(itemDetails.level),
      }),
    );
  }

  const allSlots = new Set<string>(EQUIPMENT_SLOTS);
  for (const slot of equipmentBySlot.keys()) {
    allSlots.add(slot);
  }

  const rows = [...allSlots].map(slot => {
    const item = equipmentBySlot.get(slot);
    if (!item) return { slot };
    return item;
  });

  await ctx.runMutation(internal.syncPlayer.replaceEquipmentInternal, {
    userId,
    equipment: rows,
  });

  return {
    synced: true,
    message: `Synced ${equipmentBySlot.size} equipped items`,
    count: equipmentBySlot.size,
  };
}

export const syncPlayerData = action({
  args: {},
  returns: v.object({
    synced: v.boolean(),
    message: v.string(),
    count: v.optional(v.number()),
  }),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const credentials = await getCredentials(ctx, userId);
    if (!credentials) {
      return {
        synced: false,
        message: "No API key configured. Using existing cached data.",
      };
    }

    return await syncPlayerDataForUser(ctx, userId, credentials);
  },
});

export const syncPlayerSkills = action({
  args: {},
  returns: v.object({
    synced: v.boolean(),
    message: v.string(),
    count: v.optional(v.number()),
  }),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const credentials = await getCredentials(ctx, userId);
    if (!credentials) {
      return {
        synced: false,
        message: "No API key configured. Using existing cached data.",
      };
    }

    return await syncPlayerSkillsForUser(ctx, userId, credentials);
  },
});

export const syncEquipment = action({
  args: {},
  returns: v.object({
    synced: v.boolean(),
    message: v.string(),
    count: v.optional(v.number()),
  }),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const credentials = await getCredentials(ctx, userId);
    if (!credentials) {
      return {
        synced: false,
        message: "No API key configured. Using existing cached data.",
      };
    }

    return await syncEquipmentForUser(ctx, userId, credentials);
  },
});

export const syncAll = action({
  args: {},
  returns: v.object({
    synced: v.boolean(),
    message: v.string(),
    playerData: v.object({
      synced: v.boolean(),
      message: v.string(),
      count: v.optional(v.number()),
    }),
    skills: v.object({
      synced: v.boolean(),
      message: v.string(),
      count: v.optional(v.number()),
    }),
    equipment: v.object({
      synced: v.boolean(),
      message: v.string(),
      count: v.optional(v.number()),
    }),
  }),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const credentials = await getCredentials(ctx, userId);
    if (!credentials) {
      const skipped = {
        synced: false,
        message: "No API key configured. Using existing cached data.",
      };
      return {
        synced: false,
        message: skipped.message,
        playerData: skipped,
        skills: skipped,
        equipment: skipped,
      };
    }

    const playerData = await syncPlayerDataForUser(ctx, userId, credentials);
    const skills = await syncPlayerSkillsForUser(ctx, userId, credentials);
    const equipment = await syncEquipmentForUser(ctx, userId, credentials);

    const totalCount = (playerData.count ?? 0) + (skills.count ?? 0) + (equipment.count ?? 0);
    return {
      synced: true,
      message: `Sync complete (${totalCount} records updated)`,
      playerData,
      skills,
      equipment,
    };
  },
});

export const upsertPlayerDataInternal = internalMutation({
  args: {
    userId: v.id("users"),
    playerData: v.object({
      playerId: v.optional(v.number()),
      playerName: v.string(),
      level: v.number(),
      hp: v.number(),
      maxHp: v.number(),
      exp: v.number(),
      expToNextLevel: v.number(),
      gold: v.number(),
      bank: v.optional(v.number()),
      diamonds: v.optional(v.number()),
      steps: v.number(),
      npcKills: v.number(),
      pvpKills: v.number(),
      pvpDeaths: v.number(),
      questsComplete: v.number(),
      questsPerformed: v.optional(v.number()),
      tasksCompleted: v.optional(v.number()),
      bossKills: v.optional(v.number()),
      marketTrades: v.optional(v.number()),
      p2pTrades: v.optional(v.number()),
      reputation: v.optional(v.number()),
      bountiesCompleted: v.optional(v.number()),
      dailiesUnlocked: v.optional(v.number()),
      chestsOpened: v.optional(v.number()),
      guildId: v.optional(v.number()),
      guildName: v.optional(v.string()),
      safeMode: v.boolean(),
      energy: v.optional(v.number()),
      maxEnergy: v.optional(v.number()),
      questPoints: v.optional(v.number()),
      maxQuestPoints: v.optional(v.number()),
      availableStatPoints: v.optional(v.number()),
      membership: v.optional(v.number()),
      coreStr: v.optional(v.number()),
      coreDef: v.optional(v.number()),
      coreDex: v.optional(v.number()),
      equipStr: v.optional(v.number()),
      equipDef: v.optional(v.number()),
      equipDex: v.optional(v.number()),
      bonusStr: v.optional(v.number()),
      bonusDef: v.optional(v.number()),
      bonusDex: v.optional(v.number()),
      totalStr: v.optional(v.number()),
      totalDef: v.optional(v.number()),
      totalDex: v.optional(v.number()),
      locationId: v.optional(v.number()),
      locationName: v.optional(v.string()),
      lastUpdated: v.number(),
    }),
  },
  returns: v.null(),
  handler: async (ctx, { userId, playerData }) => {
    const existing = await ctx.db
      .query("playerData")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();

    const payload = stripUndefined({
      userId,
      ...playerData,
    });

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("playerData", payload);
    }
    return null;
  },
});

export const replacePlayerSkillsInternal = internalMutation({
  args: {
    userId: v.id("users"),
    skills: v.array(
      v.object({
        skill: v.string(),
        level: v.number(),
        exp: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, { userId, skills }) => {
    const existing = await ctx.db
      .query("playerSkills")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();

    for (const row of existing) {
      await ctx.db.delete(row._id);
    }

    for (const skill of skills) {
      await ctx.db.insert("playerSkills", {
        userId,
        ...skill,
      });
    }
    return null;
  },
});

export const replaceEquipmentInternal = internalMutation({
  args: {
    userId: v.id("users"),
    equipment: v.array(
      v.object({
        slot: v.string(),
        itemName: v.optional(v.string()),
        itemId: v.optional(v.number()),
        rarity: v.optional(v.string()),
        attack: v.optional(v.number()),
        defense: v.optional(v.number()),
        critPercent: v.optional(v.number()),
        strBonus: v.optional(v.number()),
        defBonus: v.optional(v.number()),
        level: v.optional(v.number()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, { userId, equipment }) => {
    const existing = await ctx.db
      .query("equipment")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();

    for (const row of existing) {
      await ctx.db.delete(row._id);
    }

    for (const item of equipment) {
      await ctx.db.insert(
        "equipment",
        stripUndefined({
          userId,
          ...item,
        }),
      );
    }
    return null;
  },
});

export const markSyncMetadataInternal = internalMutation({
  args: {
    userId: v.id("users"),
    syncedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { userId, syncedAt }) => {
    const credentials = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
    if (!credentials) return null;

    await ctx.db.patch(credentials._id, {
      lastValidated: syncedAt,
      lastSyncAt: syncedAt,
    });
    return null;
  },
});
