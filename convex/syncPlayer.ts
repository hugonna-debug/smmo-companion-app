import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation } from "./_generated/server";
import { type RateLimitSnapshot, smmoGetJson } from "./smmoApi";

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

type PlayerInfoV1 = Record<string, unknown> & {
  id?: number | string;
  name?: string;
  guild?: { id?: number | string; name?: string };
  current_location?: { id?: number | string; name?: string };
};

type PlayerInfoV2 = Record<string, unknown> & {
  id?: number | string;
  name?: string;
  currencies?: { gold?: number; diamonds?: number };
  stats?: {
    core?: { str?: number; def?: number; dex?: number };
    equipment?: { str?: number; def?: number; dex?: number };
    bonus?: { fixed?: { str?: number; def?: number; dex?: number } };
    total?: { str?: number; def?: number; dex?: number };
  };
  location?: { id?: number | string; name?: string };
};

type SmmoItemInfo = Record<string, unknown> & {
  id?: number | string;
  name?: string;
  type?: string;
  rarity?: string;
  level?: number | string;
  stat1?: string;
  stat1modifier?: number | string;
  stat2?: string;
  stat2modifier?: number | string;
  stat3?: string;
  stat3modifier?: number | string;
  attack?: number | string;
  defense?: number | string;
};

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function asOptionalNumber(value: unknown): number | undefined {
  const parsed = asNumber(value, Number.NaN);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function normalizeSlot(rawSlot: string): (typeof EQUIPMENT_SLOTS)[number] | null {
  const normalized = rawSlot
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const aliasMap: Record<string, (typeof EQUIPMENT_SLOTS)[number]> = {
    armor: "armour",
    woodaxe: "wood_axe",
    fishingrod: "fishing_rod",
    gauntlets: "gauntlet",
  };

  const aliased = aliasMap[normalized] ?? normalized;
  return (EQUIPMENT_SLOTS as readonly string[]).includes(aliased)
    ? (aliased as (typeof EQUIPMENT_SLOTS)[number])
    : null;
}

function parseSafeMode(v1: PlayerInfoV1, v2: PlayerInfoV2): boolean {
  const v2SafeMode = (v2 as { safe_mode?: unknown }).safe_mode;
  if (typeof v2SafeMode === "boolean") return v2SafeMode;
  return asNumber((v1 as { safeMode?: unknown }).safeMode) === 1;
}

function extractStatModifier(item: SmmoItemInfo, statKey: "str" | "def"): number | undefined {
  const stats: Array<[unknown, unknown]> = [
    [item.stat1, item.stat1modifier],
    [item.stat2, item.stat2modifier],
    [item.stat3, item.stat3modifier],
  ];
  let total = 0;
  for (const [statName, modifier] of stats) {
    if (typeof statName === "string" && statName.toLowerCase() === statKey) {
      total += asNumber(modifier);
    }
  }
  return total > 0 ? total : undefined;
}

function extractCritModifier(item: SmmoItemInfo): number | undefined {
  const stats: Array<[unknown, unknown]> = [
    [item.stat1, item.stat1modifier],
    [item.stat2, item.stat2modifier],
    [item.stat3, item.stat3modifier],
  ];
  for (const [statName, modifier] of stats) {
    if (typeof statName === "string" && statName.toLowerCase().includes("crit")) {
      return asOptionalNumber(modifier);
    }
  }
  return undefined;
}

function buildItemName(item: SmmoItemInfo, fallbackItemId: number): string {
  const type = asString(item.type);
  const name = asString(item.name);
  if (type && name) return `${type} - ${name}`;
  if (name) return name;
  if (type) return type;
  return `Item #${fallbackItemId}`;
}

type SyncCtx = any;

async function requireApiCredentials(
  ctx: SyncCtx,
  userId: Id<"users">,
) {
  const creds = (await ctx.runQuery(internal.gameData.getApiKeyForSync, { userId })) as
    | { smmoApiKey: string; smmoPlayerId: number }
    | null;
  if (!creds) {
    throw new ConvexError(
      "No SMMO API key configured. Add and validate your key in Settings first.",
    );
  }
  return creds;
}

async function persistRateLimit(
  ctx: SyncCtx,
  userId: Id<"users">,
  rateLimit: RateLimitSnapshot,
  extra: { lastValidated?: number; lastSyncAt?: number } = {},
) {
  await ctx.runMutation(internal.gameData.updateApiKeyRateLimitInternal, {
    userId,
    rateLimitLimit: rateLimit.limit,
    rateLimitRemaining: rateLimit.remaining,
    rateLimitResetAt: rateLimit.resetAt ?? undefined,
    lastValidated: extra.lastValidated,
    lastSyncAt: extra.lastSyncAt,
  });
}

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
      diamonds: v.optional(v.number()),
      steps: v.number(),
      npcKills: v.number(),
      pvpKills: v.number(),
      pvpDeaths: v.number(),
      questsComplete: v.number(),
      tasksCompleted: v.optional(v.number()),
      bossKills: v.optional(v.number()),
      marketTrades: v.optional(v.number()),
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
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("playerData")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args.playerData);
    } else {
      await ctx.db.insert("playerData", { userId: args.userId, ...args.playerData });
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
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("playerSkills")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }

    for (const skill of args.skills) {
      await ctx.db.insert("playerSkills", { userId: args.userId, ...skill });
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
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("equipment")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }

    for (const equipment of args.equipment) {
      await ctx.db.insert("equipment", { userId: args.userId, ...equipment });
    }
    return null;
  },
});

async function runSyncPlayerData(
  ctx: SyncCtx,
  userId: Id<"users">,
  creds: { smmoApiKey: string; smmoPlayerId: number },
) {
  const now = Date.now();
  const rateKey = userId;

  const { data: v1Data, rateLimit: v1RateLimit } = await smmoGetJson<PlayerInfoV1>(
    `/v1/player/info/${creds.smmoPlayerId}`,
    creds.smmoApiKey,
    rateKey,
  );
  await persistRateLimit(ctx, userId, v1RateLimit);

  const { data: v2Data, rateLimit } = await smmoGetJson<PlayerInfoV2>(
    "/v2/player/info",
    creds.smmoApiKey,
    rateKey,
  );
  await persistRateLimit(ctx, userId, rateLimit, { lastValidated: now, lastSyncAt: now });

  const playerPayload = {
    playerId: asOptionalNumber(v2Data.id) ?? asOptionalNumber(v1Data.id),
    playerName: asString(v2Data.name) ?? asString(v1Data.name) ?? "Unknown Player",
    level: asNumber(v2Data.level ?? v1Data.level),
    hp: asNumber(v2Data.current_health ?? v1Data.hp),
    maxHp: asNumber(v2Data.max_health ?? v1Data.max_hp),
    exp: asNumber(v1Data.exp ?? v2Data.exp),
    expToNextLevel: asNumber(v1Data.exp_to_next_level ?? v2Data.exp_to_next_level ?? v1Data.exp),
    gold: asNumber(v2Data.currencies?.gold ?? v1Data.gold),
    diamonds: asOptionalNumber(v2Data.currencies?.diamonds),
    steps: asNumber(v1Data.steps),
    npcKills: asNumber(v1Data.npc_kills),
    pvpKills: asNumber(v1Data.user_kills),
    pvpDeaths: asNumber(v1Data.user_deaths ?? v1Data.pvp_deaths),
    questsComplete: asNumber(v1Data.quests_complete),
    tasksCompleted: asOptionalNumber(v1Data.tasks_completed),
    bossKills: asOptionalNumber(v1Data.boss_kills),
    marketTrades: asOptionalNumber(v1Data.market_trades),
    reputation: asOptionalNumber(v1Data.reputation),
    bountiesCompleted: asOptionalNumber(v1Data.bounties_completed),
    dailiesUnlocked: asOptionalNumber(v1Data.dailies_unlocked),
    chestsOpened: asOptionalNumber(v1Data.chests_opened),
    guildId: asOptionalNumber(v1Data.guild?.id),
    guildName: asString(v1Data.guild?.name),
    safeMode: parseSafeMode(v1Data, v2Data),
    energy: asOptionalNumber(v2Data.current_energy),
    maxEnergy: asOptionalNumber(v2Data.max_energy),
    questPoints: asOptionalNumber(v2Data.current_quest_points),
    maxQuestPoints: asOptionalNumber(v2Data.max_quest_points),
    availableStatPoints: asOptionalNumber(v2Data.available_stat_points),
    membership: asOptionalNumber(v2Data.membership ?? v1Data.membership),
    coreStr: asOptionalNumber(v2Data.stats?.core?.str),
    coreDef: asOptionalNumber(v2Data.stats?.core?.def),
    coreDex: asOptionalNumber(v2Data.stats?.core?.dex),
    equipStr: asOptionalNumber(v2Data.stats?.equipment?.str),
    equipDef: asOptionalNumber(v2Data.stats?.equipment?.def),
    equipDex: asOptionalNumber(v2Data.stats?.equipment?.dex),
    bonusStr: asOptionalNumber(v2Data.stats?.bonus?.fixed?.str),
    bonusDef: asOptionalNumber(v2Data.stats?.bonus?.fixed?.def),
    bonusDex: asOptionalNumber(v2Data.stats?.bonus?.fixed?.dex),
    totalStr: asOptionalNumber(v2Data.stats?.total?.str),
    totalDef: asOptionalNumber(v2Data.stats?.total?.def),
    totalDex: asOptionalNumber(v2Data.stats?.total?.dex),
    locationId: asOptionalNumber(v1Data.current_location?.id ?? v2Data.location?.id),
    locationName: asString(v1Data.current_location?.name ?? v2Data.location?.name),
    lastUpdated: now,
  };

  await ctx.runMutation(internal.syncPlayer.upsertPlayerDataInternal, {
    userId,
    playerData: playerPayload,
  });

  return {
    playerName: playerPayload.playerName,
    playerId: playerPayload.playerId ?? creds.smmoPlayerId,
    rateLimit,
  };
}

async function runSyncPlayerSkills(
  ctx: SyncCtx,
  userId: Id<"users">,
  creds: { smmoApiKey: string; smmoPlayerId: number },
) {
  const { data, rateLimit } = await smmoGetJson<Array<Record<string, unknown>>>(
    `/v1/player/skills/${creds.smmoPlayerId}`,
    creds.smmoApiKey,
    userId,
  );
  await persistRateLimit(ctx, userId, rateLimit, { lastSyncAt: Date.now() });

  const skills = data.map((skill) => ({
    skill: asString(skill.skill) ?? "unknown",
    level: asNumber(skill.level),
    exp: asNumber(skill.exp),
  }));

  await ctx.runMutation(internal.syncPlayer.replacePlayerSkillsInternal, {
    userId,
    skills,
  });

  return { syncedCount: skills.length, rateLimit };
}

async function runSyncEquipment(
  ctx: SyncCtx,
  userId: Id<"users">,
  creds: { smmoApiKey: string; smmoPlayerId: number },
) {
  const { data: equipmentMap, rateLimit: initialRateLimit } = await smmoGetJson<
    Record<string, string>
  >(`/v1/player/equipment/${creds.smmoPlayerId}`, creds.smmoApiKey, userId);
  await persistRateLimit(ctx, userId, initialRateLimit);

  const bySlot = new Map<
    (typeof EQUIPMENT_SLOTS)[number],
    {
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
    }
  >();

  let currentRateLimit = initialRateLimit;
  for (const [rawItemId, rawSlot] of Object.entries(equipmentMap ?? {})) {
    const slot = normalizeSlot(rawSlot);
    const itemId = asNumber(rawItemId, Number.NaN);
    if (!slot || Number.isNaN(itemId)) continue;

    const { data: itemInfo, rateLimit } = await smmoGetJson<SmmoItemInfo>(
      `/v1/items/info/${itemId}`,
      creds.smmoApiKey,
      userId,
    );
    currentRateLimit = rateLimit;
    await persistRateLimit(ctx, userId, rateLimit);

    bySlot.set(slot, {
      slot,
      itemId,
      itemName: buildItemName(itemInfo, itemId),
      rarity: asString(itemInfo.rarity)?.toLowerCase(),
      attack: asOptionalNumber(itemInfo.attack),
      defense: asOptionalNumber(itemInfo.defense),
      critPercent: extractCritModifier(itemInfo),
      strBonus: extractStatModifier(itemInfo, "str"),
      defBonus: extractStatModifier(itemInfo, "def"),
      level: asOptionalNumber(itemInfo.level),
    });
  }

  const rows = EQUIPMENT_SLOTS.map((slot) => bySlot.get(slot) ?? { slot });
  await ctx.runMutation(internal.syncPlayer.replaceEquipmentInternal, {
    userId,
    equipment: rows,
  });
  await persistRateLimit(ctx, userId, currentRateLimit, { lastSyncAt: Date.now() });

  return {
    syncedCount: [...bySlot.values()].length,
    totalSlots: rows.length,
    rateLimit: currentRateLimit,
  };
}

export const validateAndSaveApiKey = action({
  args: {
    smmoApiKey: v.string(),
    smmoPlayerId: v.number(),
  },
  returns: v.object({
    playerName: v.string(),
    playerId: v.number(),
    rateLimitLimit: v.number(),
    rateLimitRemaining: v.number(),
    rateLimitResetAt: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be signed in to validate an API key.");

    const { data: v1Data } = await smmoGetJson<PlayerInfoV1>(
      `/v1/player/info/${args.smmoPlayerId}`,
      args.smmoApiKey,
      userId,
    );
    const { data: v2Data, rateLimit } = await smmoGetJson<PlayerInfoV2>(
      "/v2/player/info",
      args.smmoApiKey,
      userId,
    );

    const authenticatedId = asOptionalNumber(v2Data.id);
    if (authenticatedId !== undefined && authenticatedId !== args.smmoPlayerId) {
      throw new ConvexError(
        `Player ID mismatch. API key belongs to player ${authenticatedId}, not ${args.smmoPlayerId}.`,
      );
    }

    const playerName = asString(v2Data.name) ?? asString(v1Data.name);
    if (!playerName) {
      throw new ConvexError("Validation failed: could not read player name from SMMO API.");
    }

    const now = Date.now();
    await ctx.runMutation(internal.gameData.upsertApiKeyInternal, {
      userId,
      smmoApiKey: args.smmoApiKey,
      smmoPlayerId: args.smmoPlayerId,
      lastValidated: now,
      rateLimitLimit: rateLimit.limit,
      rateLimitRemaining: rateLimit.remaining,
      rateLimitResetAt: rateLimit.resetAt ?? undefined,
    });

    return {
      playerName,
      playerId: args.smmoPlayerId,
      rateLimitLimit: rateLimit.limit,
      rateLimitRemaining: rateLimit.remaining,
      rateLimitResetAt: rateLimit.resetAt ?? undefined,
    };
  },
});

export const syncPlayerData = action({
  args: {},
  returns: v.object({
    playerName: v.string(),
    playerId: v.number(),
    syncedAt: v.number(),
    rateLimitLimit: v.number(),
    rateLimitRemaining: v.number(),
    rateLimitResetAt: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be signed in to sync player data.");
    const creds = await requireApiCredentials(ctx, userId);
    const result = await runSyncPlayerData(ctx, userId, creds);
    return {
      playerName: result.playerName,
      playerId: result.playerId,
      syncedAt: Date.now(),
      rateLimitLimit: result.rateLimit.limit,
      rateLimitRemaining: result.rateLimit.remaining,
      rateLimitResetAt: result.rateLimit.resetAt ?? undefined,
    };
  },
});

export const syncPlayerSkills = action({
  args: {},
  returns: v.object({
    syncedCount: v.number(),
    syncedAt: v.number(),
    rateLimitLimit: v.number(),
    rateLimitRemaining: v.number(),
    rateLimitResetAt: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be signed in to sync skills.");
    const creds = await requireApiCredentials(ctx, userId);
    const result = await runSyncPlayerSkills(ctx, userId, creds);
    return {
      syncedCount: result.syncedCount,
      syncedAt: Date.now(),
      rateLimitLimit: result.rateLimit.limit,
      rateLimitRemaining: result.rateLimit.remaining,
      rateLimitResetAt: result.rateLimit.resetAt ?? undefined,
    };
  },
});

export const syncEquipment = action({
  args: {},
  returns: v.object({
    syncedCount: v.number(),
    totalSlots: v.number(),
    syncedAt: v.number(),
    rateLimitLimit: v.number(),
    rateLimitRemaining: v.number(),
    rateLimitResetAt: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be signed in to sync equipment.");
    const creds = await requireApiCredentials(ctx, userId);
    const result = await runSyncEquipment(ctx, userId, creds);
    return {
      syncedCount: result.syncedCount,
      totalSlots: result.totalSlots,
      syncedAt: Date.now(),
      rateLimitLimit: result.rateLimit.limit,
      rateLimitRemaining: result.rateLimit.remaining,
      rateLimitResetAt: result.rateLimit.resetAt ?? undefined,
    };
  },
});

export const syncAll = action({
  args: {},
  returns: v.object({
    playerName: v.string(),
    playerId: v.number(),
    skillsSynced: v.number(),
    equipmentSynced: v.number(),
    syncedAt: v.number(),
    rateLimitLimit: v.number(),
    rateLimitRemaining: v.number(),
    rateLimitResetAt: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("You must be signed in to sync data.");
    const creds = await requireApiCredentials(ctx, userId);

    const playerResult = await runSyncPlayerData(ctx, userId, creds);
    const skillsResult = await runSyncPlayerSkills(ctx, userId, creds);
    const equipmentResult = await runSyncEquipment(ctx, userId, creds);

    await ctx.runMutation(internal.gameData.updateApiKeyRateLimitInternal, {
      userId,
      rateLimitLimit: equipmentResult.rateLimit.limit,
      rateLimitRemaining: equipmentResult.rateLimit.remaining,
      rateLimitResetAt: equipmentResult.rateLimit.resetAt ?? undefined,
      lastSyncAt: Date.now(),
    });

    return {
      playerName: playerResult.playerName,
      playerId: playerResult.playerId,
      skillsSynced: skillsResult.syncedCount,
      equipmentSynced: equipmentResult.syncedCount,
      syncedAt: Date.now(),
      rateLimitLimit: equipmentResult.rateLimit.limit,
      rateLimitRemaining: equipmentResult.rateLimit.remaining,
      rateLimitResetAt: equipmentResult.rateLimit.resetAt ?? undefined,
    };
  },
});
