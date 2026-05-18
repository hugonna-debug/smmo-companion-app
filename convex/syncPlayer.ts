import { getAuthUserId } from "@convex-dev/auth/server";
import type { GenericActionCtx } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { DataModel, Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery } from "./_generated/server";
import {
  buildItemDisplayName,
  isSmmoNotFoundError,
  itemStatBonuses,
  mergeRateMeta,
  normalizeEquipmentSlot,
  type SmmoRateMeta,
  smmoFetchJson,
} from "./smmoApi";

const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 40;

function n(x: unknown, d = 0): number {
  if (typeof x === "number" && !Number.isNaN(x)) return x;
  if (typeof x === "string" && x !== "" && !Number.isNaN(Number(x)))
    return Number(x);
  return d;
}

/** Like `n` but returns undefined when the value is absent (preserves numeric 0). */
function optN(x: unknown): number | undefined {
  if (x === undefined || x === null) return undefined;
  if (typeof x === "number" && !Number.isNaN(x)) return x;
  if (typeof x === "string" && x !== "" && !Number.isNaN(Number(x)))
    return Number(x);
  return undefined;
}

function buildMergedPlayerDoc(
  v1: Record<string, unknown> | null,
  v2: Record<string, unknown> | null,
  now: number,
): Record<string, unknown> {
  const guild = (v1?.guild ?? null) as { id?: number; name?: string } | null;
  const loc1 = v1?.current_location as
    | { id?: number; name?: string }
    | undefined;
  const loc2 = v2?.location as { id?: number; name?: string } | undefined;
  const currencies = (v2?.currencies ?? {}) as {
    gold?: number;
    diamonds?: number;
  };
  const stats = (v2?.stats ?? {}) as {
    core?: { str?: number; def?: number; dex?: number };
    equipment?: { str?: number; def?: number; dex?: number };
    bonus?: { fixed?: { str?: number; def?: number; dex?: number } };
    total?: { str?: number; def?: number; dex?: number };
  };
  const v1Any = v1 as Record<string, unknown> | null;

  const safe =
    typeof v2?.safe_mode === "boolean"
      ? v2.safe_mode
      : typeof v1Any?.safe_mode === "boolean"
        ? v1Any.safe_mode
        : typeof v1Any?.safeMode === "boolean"
          ? v1Any.safeMode
          : n(v1Any?.safe_mode ?? v1Any?.safeMode) !== 0;

  const level = n(v2?.level, n(v1?.level));
  const name =
    (typeof v2?.name === "string" && v2.name ? v2.name : null) ??
    (typeof v1?.name === "string" ? v1.name : "Player");
  const exp = n(v1?.exp);
  const expTo =
    n(v1Any?.exp_to_next_level) ||
    n(v1Any?.next_level_exp) ||
    n(v1Any?.exp_max) ||
    Math.max(1, exp + 1, Math.floor(exp * 1.0001));

  return {
    playerId: n(v1?.id, n(v2?.id)) || undefined,
    playerName: name,
    level,
    hp: n(v2?.current_health, n(v1?.hp)),
    maxHp: n(v2?.max_health, n(v1?.max_hp)),
    exp,
    expToNextLevel: expTo,
    gold: n(currencies.gold, n(v1?.gold)),
    bank: optN(v1Any?.bank),
    diamonds:
      currencies.diamonds !== undefined ? n(currencies.diamonds) : undefined,
    steps: n(v1?.steps),
    npcKills: n(v1?.npc_kills),
    pvpKills: n(v1?.user_kills),
    pvpDeaths: n(v1Any?.user_deaths, n(v1Any?.deaths)),
    questsComplete: n(v1?.quests_complete),
    questsPerformed: optN(v1Any?.quests_performed),
    tasksCompleted: optN(v1Any?.tasks_completed),
    bossKills: optN(v1Any?.boss_kills),
    marketTrades: optN(v1Any?.market_trades),
    p2pTrades: optN(v1Any?.p2p_trades),
    reputation: optN(v1Any?.reputation),
    bountiesCompleted: optN(v1Any?.bounties_completed),
    dailiesUnlocked: optN(v1Any?.dailies_unlocked),
    chestsOpened: optN(v1Any?.chests_opened),
    guildId: guild?.id,
    guildName: typeof guild?.name === "string" ? guild.name : undefined,
    safeMode: safe,
    energy: optN(v2?.current_energy),
    maxEnergy: optN(v2?.max_energy),
    questPoints: optN(v2?.current_quest_points),
    maxQuestPoints: optN(v2?.max_quest_points),
    availableStatPoints: optN(v2?.available_stat_points),
    membership:
      v2?.membership !== undefined
        ? n(v2.membership)
        : v1?.membership !== undefined
          ? n(v1.membership)
          : undefined,
    coreStr: stats.core?.str,
    coreDef: stats.core?.def,
    coreDex: stats.core?.dex,
    equipStr: stats.equipment?.str,
    equipDef: stats.equipment?.def,
    equipDex: stats.equipment?.dex,
    bonusStr: stats.bonus?.fixed?.str,
    bonusDef: stats.bonus?.fixed?.def,
    bonusDex: stats.bonus?.fixed?.dex,
    totalStr: stats.total?.str,
    totalDef: stats.total?.def,
    totalDex: stats.total?.dex,
    title: typeof v1Any?.title === "string" ? v1Any.title : undefined,
    playerClass:
      typeof v1Any?.player_class === "string" ? v1Any.player_class : undefined,
    joinDate:
      typeof v1Any?.join_date === "string" ? v1Any.join_date : undefined,
    locationId: loc2?.id ?? loc1?.id,
    locationName:
      (typeof loc2?.name === "string" ? loc2.name : undefined) ??
      (typeof loc1?.name === "string" ? loc1.name : undefined),
    lastUpdated: now,
  };
}

function unwrapSkillsArray(raw: unknown): unknown {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.skills)) return o.skills;
  }
  return raw;
}

function parseSkillsPayload(
  raw: unknown,
): Array<{ skill: string; level: number; exp: number }> {
  raw = unwrapSkillsArray(raw);
  if (!Array.isArray(raw)) return [];
  const out: Array<{ skill: string; level: number; exp: number }> = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const skill =
      typeof o.skill === "string"
        ? o.skill
        : typeof o.name === "string"
          ? o.name
          : typeof o.skill_name === "string"
            ? o.skill_name
            : "";
    if (!skill) continue;
    out.push({ skill, level: n(o.level), exp: n(o.exp) });
  }
  return out;
}

export const internalGetApiKeysRow = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("apiKeys"),
      smmoApiKey: v.string(),
      smmoPlayerId: v.number(),
      lastValidated: v.number(),
      lastSyncAt: v.optional(v.number()),
      lastSyncError: v.optional(v.string()),
      smmoRequestLog: v.optional(v.array(v.number())),
      rateLimitRemaining: v.optional(v.number()),
      rateLimitLimit: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
  },
});

export const internalReserveSmmoRequest = internalMutation({
  args: { userId: v.id("users") },
  returns: v.union(v.null(), v.number()),
  handler: async (ctx, { userId }) => {
    const row = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
    if (!row) return null;
    const now = Date.now();
    const log = (row.smmoRequestLog ?? []).filter(
      t => now - t < RATE_WINDOW_MS,
    );
    if (log.length >= MAX_REQUESTS_PER_WINDOW) {
      throw new Error(
        "Local rate limit: at most 40 SimpleMMO API requests per minute. Try again in a moment.",
      );
    }
    await ctx.db.patch(row._id, { smmoRequestLog: [...log, now] });
    return now;
  },
});

export const internalReleaseSmmoRequest = internalMutation({
  args: { userId: v.id("users"), reservedAt: v.number() },
  returns: v.null(),
  handler: async (ctx, { userId, reservedAt }) => {
    const row = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
    if (!row) return null;
    const log = (row.smmoRequestLog ?? []).filter(t => t !== reservedAt);
    await ctx.db.patch(row._id, { smmoRequestLog: log });
    return null;
  },
});

export const internalUpsertApiKeys = internalMutation({
  args: {
    userId: v.id("users"),
    smmoApiKey: v.string(),
    smmoPlayerId: v.number(),
    lastValidated: v.number(),
    rateLimitRemaining: v.optional(v.number()),
    rateLimitLimit: v.optional(v.number()),
    smmoRequestLog: v.optional(v.array(v.number())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .unique();
    const ratePatch = {
      rateLimitRemaining: args.rateLimitRemaining,
      rateLimitLimit: args.rateLimitLimit,
    };
    if (existing) {
      await ctx.db.patch(existing._id, {
        smmoApiKey: args.smmoApiKey,
        smmoPlayerId: args.smmoPlayerId,
        lastValidated: args.lastValidated,
        lastSyncError: undefined,
        ...(args.smmoRequestLog !== undefined
          ? { smmoRequestLog: args.smmoRequestLog }
          : {}),
        ...ratePatch,
      });
    } else {
      await ctx.db.insert("apiKeys", {
        userId: args.userId,
        smmoApiKey: args.smmoApiKey,
        smmoPlayerId: args.smmoPlayerId,
        lastValidated: args.lastValidated,
        smmoRequestLog: args.smmoRequestLog ?? [],
        ...ratePatch,
      });
    }
    return null;
  },
});

export const internalPatchApiKeyRateMeta = internalMutation({
  args: {
    userId: v.id("users"),
    rateLimitRemaining: v.optional(v.number()),
    rateLimitLimit: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .unique();
    if (!row) return null;
    await ctx.db.patch(row._id, {
      rateLimitRemaining: args.rateLimitRemaining,
      rateLimitLimit: args.rateLimitLimit,
    });
    return null;
  },
});

export const internalRecordSyncOutcome = internalMutation({
  args: {
    userId: v.id("users"),
    lastSyncAt: v.optional(v.number()),
    lastSyncError: v.optional(v.union(v.string(), v.null())),
    rateLimitRemaining: v.optional(v.number()),
    rateLimitLimit: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .unique();
    if (!row) return null;
    const patch: Record<string, unknown> = {};
    if (args.lastSyncAt !== undefined) patch.lastSyncAt = args.lastSyncAt;
    if (args.lastSyncError !== undefined)
      patch.lastSyncError = args.lastSyncError ?? undefined;
    if (args.rateLimitRemaining !== undefined)
      patch.rateLimitRemaining = args.rateLimitRemaining;
    if (args.rateLimitLimit !== undefined)
      patch.rateLimitLimit = args.rateLimitLimit;
    await ctx.db.patch(row._id, patch);
    return null;
  },
});

export const internalApplyPlayerSync = internalMutation({
  args: {
    userId: v.id("users"),
    playerPatch: v.any(),
    skills: v.array(
      v.object({ skill: v.string(), level: v.number(), exp: v.number() }),
    ),
    equipment: v.array(
      v.object({
        slot: v.string(),
        itemName: v.optional(v.string()),
        itemId: v.optional(v.number()),
        rarity: v.optional(v.string()),
        strBonus: v.optional(v.number()),
        defBonus: v.optional(v.number()),
        level: v.optional(v.number()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId, playerPatch, skills, equipment } = args;
    const existing = await ctx.db
      .query("playerData")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    await ctx.db.insert("playerData", {
      userId,
      ...(playerPatch as Record<string, unknown>),
    } as Parameters<typeof ctx.db.insert<"playerData">>[1]);

    const oldSkills = await ctx.db
      .query("playerSkills")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();
    for (const s of oldSkills) await ctx.db.delete(s._id);
    for (const s of skills) {
      await ctx.db.insert("playerSkills", {
        userId,
        skill: s.skill,
        level: s.level,
        exp: s.exp,
      });
    }

    const oldEq = await ctx.db
      .query("equipment")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();
    for (const e of oldEq) await ctx.db.delete(e._id);
    for (const e of equipment) {
      await ctx.db.insert("equipment", {
        userId,
        slot: e.slot,
        itemName: e.itemName,
        itemId: e.itemId,
        rarity: e.rarity,
        strBonus: e.strBonus,
        defBonus: e.defBonus,
        level: e.level,
      });
    }
    return null;
  },
});

export async function smmoCall(
  ctx: GenericActionCtx<DataModel>,
  userId: Id<"users">,
  apiKey: string,
  path: string,
): Promise<{ json: unknown; rate: SmmoRateMeta }> {
  const reservedAt = await ctx.runMutation(
    internal.syncPlayer.internalReserveSmmoRequest,
    {
      userId,
    },
  );
  try {
    const { json, rate } = await smmoFetchJson(apiKey, path);
    await ctx.runMutation(internal.syncPlayer.internalPatchApiKeyRateMeta, {
      userId,
      rateLimitRemaining: rate.remaining,
      rateLimitLimit: rate.limit,
    });
    return { json, rate };
  } catch (e) {
    if (reservedAt !== null) {
      await ctx.runMutation(internal.syncPlayer.internalReleaseSmmoRequest, {
        userId,
        reservedAt,
      });
    }
    throw e;
  }
}

export const validateAndSaveCredentials = action({
  args: {
    smmoApiKey: v.string(),
    smmoPlayerId: v.number(),
  },
  returns: v.object({
    playerName: v.string(),
    rateLimitRemaining: v.optional(v.number()),
    rateLimitLimit: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      throw new Error("You must be signed in to save API credentials.");

    const key = args.smmoApiKey.trim();
    if (!key) throw new Error("API key is required.");
    if (!Number.isInteger(args.smmoPlayerId) || args.smmoPlayerId <= 0) {
      throw new Error("Player ID must be a positive integer.");
    }

    const existing = await ctx.runQuery(
      internal.syncPlayer.internalGetApiKeysRow,
      { userId },
    );
    const path = `/v1/player/info/${args.smmoPlayerId}`;
    let json: unknown;
    let rate: SmmoRateMeta;
    if (existing) {
      const r = await smmoCall(ctx, userId, key, path);
      json = r.json;
      rate = r.rate;
    } else {
      const r = await smmoFetchJson(key, path);
      json = r.json;
      rate = r.rate;
    }

    const body = json as Record<string, unknown>;
    const id = n(body.id);
    if (id && id !== args.smmoPlayerId) {
      throw new Error(
        "Player ID does not match the profile returned by the API.",
      );
    }
    const playerName = typeof body.name === "string" ? body.name : "Player";
    const now = Date.now();
    await ctx.runMutation(internal.syncPlayer.internalUpsertApiKeys, {
      userId,
      smmoApiKey: key,
      smmoPlayerId: args.smmoPlayerId,
      lastValidated: now,
      rateLimitRemaining: rate.remaining,
      rateLimitLimit: rate.limit,
      smmoRequestLog: existing ? undefined : [now],
    });
    return {
      playerName,
      rateLimitRemaining: rate.remaining,
      rateLimitLimit: rate.limit,
    };
  },
});

export const syncAll = action({
  args: {},
  returns: v.object({
    rateLimitRemaining: v.optional(v.number()),
    rateLimitLimit: v.optional(v.number()),
    lastSyncAt: v.number(),
  }),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be signed in to sync.");

    const row = await ctx.runQuery(internal.syncPlayer.internalGetApiKeysRow, {
      userId,
    });
    if (!row) {
      throw new Error("Add and validate your SMMO API key in Settings first.");
    }

    let aggregateRate: SmmoRateMeta = {};
    const apiKey = row.smmoApiKey;
    const pid = row.smmoPlayerId;

    try {
      const v1Res = await smmoCall(
        ctx,
        userId,
        apiKey,
        `/v1/player/info/${pid}`,
      );
      aggregateRate = mergeRateMeta(aggregateRate, v1Res.rate);
      const v1 = v1Res.json as Record<string, unknown> | null;

      const v2Res = await smmoCall(ctx, userId, apiKey, "/v2/player/info");
      aggregateRate = mergeRateMeta(aggregateRate, v2Res.rate);
      const v2 = v2Res.json as Record<string, unknown> | null;

      const skillsRes = await smmoCall(
        ctx,
        userId,
        apiKey,
        `/v1/player/skills/${pid}`,
      );
      aggregateRate = mergeRateMeta(aggregateRate, skillsRes.rate);
      const skills = parseSkillsPayload(skillsRes.json);

      const eqRes = await smmoCall(
        ctx,
        userId,
        apiKey,
        `/v1/player/equipment/${pid}`,
      );
      aggregateRate = mergeRateMeta(aggregateRate, eqRes.rate);
      const eqRaw = eqRes.json;
      const eqMap: Record<string, string> = {};
      if (eqRaw && typeof eqRaw === "object" && !Array.isArray(eqRaw)) {
        const top = eqRaw as Record<string, unknown>;
        const inner =
          top.data !== undefined &&
          typeof top.data === "object" &&
          !Array.isArray(top.data)
            ? (top.data as Record<string, unknown>)
            : top;
        for (const [k, v] of Object.entries(inner)) {
          if (typeof v === "string") eqMap[k] = v;
        }
      }

      const equipment: Array<{
        slot: string;
        itemName?: string;
        itemId?: number;
        rarity?: string;
        strBonus?: number;
        defBonus?: number;
        level?: number;
      }> = [];

      for (const [itemIdStr, slotLabel] of Object.entries(eqMap)) {
        const itemId = Number(itemIdStr);
        if (!Number.isFinite(itemId)) continue;
        const slot = normalizeEquipmentSlot(String(slotLabel));
        try {
          const itemRes = await smmoCall(
            ctx,
            userId,
            apiKey,
            `/v1/items/info/${itemId}`,
          );
          aggregateRate = mergeRateMeta(aggregateRate, itemRes.rate);
          const item = itemRes.json as Record<string, unknown>;
          const bonuses = itemStatBonuses(item);
          equipment.push({
            slot,
            itemId,
            itemName: buildItemDisplayName(
              item.type,
              item.name ?? (item as { item_name?: string }).item_name,
            ),
            rarity: typeof item.rarity === "string" ? item.rarity : undefined,
            strBonus: bonuses.strBonus,
            defBonus: bonuses.defBonus,
            level: n(item.level),
          });
        } catch (e) {
          if (!isSmmoNotFoundError(e)) throw e;
          equipment.push({
            slot,
            itemId,
            itemName: `Item #${itemId}`,
          });
        }
      }

      const now = Date.now();
      const playerPatch = buildMergedPlayerDoc(v1, v2, now);

      await ctx.runMutation(internal.syncPlayer.internalApplyPlayerSync, {
        userId,
        playerPatch,
        skills,
        equipment,
      });

      await ctx.runMutation(internal.syncPlayer.internalRecordSyncOutcome, {
        userId,
        lastSyncAt: now,
        lastSyncError: null,
        rateLimitRemaining: aggregateRate.remaining,
        rateLimitLimit: aggregateRate.limit,
      });

      return {
        rateLimitRemaining: aggregateRate.remaining,
        rateLimitLimit: aggregateRate.limit,
        lastSyncAt: now,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await ctx.runMutation(internal.syncPlayer.internalRecordSyncOutcome, {
        userId,
        lastSyncError: msg,
        rateLimitRemaining: aggregateRate.remaining,
        rateLimitLimit: aggregateRate.limit,
      });
      throw e;
    }
  },
});
