import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation } from "./_generated/server";
import {
  transformEquipmentItem,
  transformPlayerData,
  transformPlayerSkills,
  type EquipmentPatch,
  type SmmoItemInfo,
  type SmmoSkill,
  type SmmoV1PlayerInfo,
  type SmmoV2PlayerInfo,
} from "./smmoTransforms";
import {
  fetchSmmoApi,
  getSmmoErrorMessage,
  getSmmoRateLimitStatus,
} from "./smmoApi";

const rateLimitValidator = v.object({
  limit: v.number(),
  remaining: v.number(),
  resetAt: v.number(),
});

const syncResultValidator = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
  playerName: v.optional(v.string()),
  syncedAt: v.optional(v.number()),
  playerData: v.optional(v.boolean()),
  skills: v.optional(v.number()),
  equipment: v.optional(v.number()),
  rateLimit: rateLimitValidator,
});

function missingApiKeyResult() {
  return {
    success: false,
    message: "Add and validate your SMMO API key before syncing.",
    rateLimit: getSmmoRateLimitStatus(),
  };
}

function equipmentEntries(data: Record<string, string>): [string, string][] {
  if (!data || typeof data !== "object" || Array.isArray(data)) return [];
  return Object.entries(data).filter((entry): entry is [string, string] => {
    const [itemId, slot] = entry;
    return itemId.trim() !== "" && typeof slot === "string" && slot.trim() !== "";
  });
}

async function fetchEquipment(
  apiKey: string,
  playerId: number,
): Promise<EquipmentPatch[]> {
  const equipmentResponse = await fetchSmmoApi<Record<string, string>>(
    apiKey,
    `/v1/player/equipment/${playerId}`,
  );
  const equipment: EquipmentPatch[] = [];

  for (const [itemId, slotName] of equipmentEntries(equipmentResponse.data)) {
    const item = await fetchSmmoApi<SmmoItemInfo>(
      apiKey,
      `/v1/items/info/${itemId}`,
    );
    equipment.push(transformEquipmentItem(itemId, slotName, item.data));
  }

  return equipment;
}

export const syncPlayerData = action({
  args: {},
  returns: syncResultValidator,
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        success: false,
        message: "You must be signed in to sync player data.",
        rateLimit: getSmmoRateLimitStatus(),
      };
    }

    const credentials = await ctx.runQuery(
      internal.gameData.getSmmoApiKeyInternal,
      { userId },
    );
    if (!credentials) return missingApiKeyResult();

    try {
      const v1Player = await fetchSmmoApi<SmmoV1PlayerInfo>(
        credentials.smmoApiKey,
        `/v1/player/info/${credentials.smmoPlayerId}`,
      );
      const v2Player = await fetchSmmoApi<SmmoV2PlayerInfo>(
        credentials.smmoApiKey,
        "/v2/player/info",
      );
      const syncedAt = Date.now();
      const data = transformPlayerData(v1Player.data, v2Player.data, syncedAt);

      await ctx.runMutation(internal.syncPlayer.upsertPlayerDataInternal, {
        userId,
        data,
      });
      await ctx.runMutation(internal.gameData.touchSmmoApiKeyInternal, {
        userId,
        lastValidated: syncedAt,
      });

      return {
        success: true,
        playerName: data.playerName,
        syncedAt,
        playerData: true,
        rateLimit: getSmmoRateLimitStatus(),
      };
    } catch (error) {
      return {
        success: false,
        message: getSmmoErrorMessage(error),
        rateLimit: getSmmoRateLimitStatus(),
      };
    }
  },
});

export const syncPlayerSkills = action({
  args: {},
  returns: syncResultValidator,
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        success: false,
        message: "You must be signed in to sync player skills.",
        rateLimit: getSmmoRateLimitStatus(),
      };
    }

    const credentials = await ctx.runQuery(
      internal.gameData.getSmmoApiKeyInternal,
      { userId },
    );
    if (!credentials) return missingApiKeyResult();

    try {
      const skillsResponse = await fetchSmmoApi<SmmoSkill[]>(
        credentials.smmoApiKey,
        `/v1/player/skills/${credentials.smmoPlayerId}`,
      );
      const skills = transformPlayerSkills(skillsResponse.data);
      const syncedAt = Date.now();

      await ctx.runMutation(internal.syncPlayer.replacePlayerSkillsInternal, {
        userId,
        skills,
      });
      await ctx.runMutation(internal.gameData.touchSmmoApiKeyInternal, {
        userId,
        lastValidated: syncedAt,
      });

      return {
        success: true,
        syncedAt,
        skills: skills.length,
        rateLimit: getSmmoRateLimitStatus(),
      };
    } catch (error) {
      return {
        success: false,
        message: getSmmoErrorMessage(error),
        rateLimit: getSmmoRateLimitStatus(),
      };
    }
  },
});

export const syncEquipment = action({
  args: {},
  returns: syncResultValidator,
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        success: false,
        message: "You must be signed in to sync equipment.",
        rateLimit: getSmmoRateLimitStatus(),
      };
    }

    const credentials = await ctx.runQuery(
      internal.gameData.getSmmoApiKeyInternal,
      { userId },
    );
    if (!credentials) return missingApiKeyResult();

    try {
      const equipment = await fetchEquipment(
        credentials.smmoApiKey,
        credentials.smmoPlayerId,
      );
      const syncedAt = Date.now();

      await ctx.runMutation(internal.syncPlayer.replaceEquipmentInternal, {
        userId,
        equipment,
      });
      await ctx.runMutation(internal.gameData.touchSmmoApiKeyInternal, {
        userId,
        lastValidated: syncedAt,
      });

      return {
        success: true,
        syncedAt,
        equipment: equipment.length,
        rateLimit: getSmmoRateLimitStatus(),
      };
    } catch (error) {
      return {
        success: false,
        message: getSmmoErrorMessage(error),
        rateLimit: getSmmoRateLimitStatus(),
      };
    }
  },
});

export const syncAll = action({
  args: {},
  returns: syncResultValidator,
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        success: false,
        message: "You must be signed in to sync player data.",
        rateLimit: getSmmoRateLimitStatus(),
      };
    }

    const credentials = await ctx.runQuery(
      internal.gameData.getSmmoApiKeyInternal,
      { userId },
    );
    if (!credentials) return missingApiKeyResult();

    try {
      const v1Player = await fetchSmmoApi<SmmoV1PlayerInfo>(
        credentials.smmoApiKey,
        `/v1/player/info/${credentials.smmoPlayerId}`,
      );
      const v2Player = await fetchSmmoApi<SmmoV2PlayerInfo>(
        credentials.smmoApiKey,
        "/v2/player/info",
      );
      const skillsResponse = await fetchSmmoApi<SmmoSkill[]>(
        credentials.smmoApiKey,
        `/v1/player/skills/${credentials.smmoPlayerId}`,
      );
      const equipment = await fetchEquipment(
        credentials.smmoApiKey,
        credentials.smmoPlayerId,
      );

      const syncedAt = Date.now();
      const playerData = transformPlayerData(v1Player.data, v2Player.data, syncedAt);
      const skills = transformPlayerSkills(skillsResponse.data);

      await ctx.runMutation(internal.syncPlayer.upsertPlayerDataInternal, {
        userId,
        data: playerData,
      });
      await ctx.runMutation(internal.syncPlayer.replacePlayerSkillsInternal, {
        userId,
        skills,
      });
      await ctx.runMutation(internal.syncPlayer.replaceEquipmentInternal, {
        userId,
        equipment,
      });
      await ctx.runMutation(internal.gameData.touchSmmoApiKeyInternal, {
        userId,
        lastValidated: syncedAt,
      });

      return {
        success: true,
        playerName: playerData.playerName,
        syncedAt,
        playerData: true,
        skills: skills.length,
        equipment: equipment.length,
        rateLimit: getSmmoRateLimitStatus(),
      };
    } catch (error) {
      return {
        success: false,
        message: getSmmoErrorMessage(error),
        rateLimit: getSmmoRateLimitStatus(),
      };
    }
  },
});

export const upsertPlayerDataInternal = internalMutation({
  args: {
    userId: v.id("users"),
    data: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("playerData")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args.data);
      return null;
    }

    await ctx.db.insert("playerData", {
      userId: args.userId,
      ...args.data,
    });
    return null;
  },
});

export const replacePlayerSkillsInternal = internalMutation({
  args: {
    userId: v.id("users"),
    skills: v.array(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("playerSkills")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .collect();
    for (const skill of existing) {
      await ctx.db.delete(skill._id);
    }
    for (const skill of args.skills) {
      await ctx.db.insert("playerSkills", {
        userId: args.userId,
        ...skill,
      });
    }
    return null;
  },
});

export const replaceEquipmentInternal = internalMutation({
  args: {
    userId: v.id("users"),
    equipment: v.array(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("equipment")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .collect();
    for (const equipment of existing) {
      await ctx.db.delete(equipment._id);
    }
    for (const equipment of args.equipment) {
      await ctx.db.insert("equipment", {
        userId: args.userId,
        ...equipment,
      });
    }
    return null;
  },
});
