import { getAuthUserId } from "@convex-dev/auth/server";
import type { GenericActionCtx } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { DataModel, Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { type SmmoRateMeta, smmoFetchJson } from "./smmoApi";

async function smmoCall(
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

export const getSettings = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("guildSettings")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
  },
});

export const updateSettings = mutation({
  args: {
    guildId: v.optional(v.number()),
    discordWebhookUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // SSRF Prevention: Ensure discord webhook URL is valid and targets discord.com
    if (args.discordWebhookUrl) {
      try {
        const url = new URL(args.discordWebhookUrl);
        if (
          !(
            url.hostname === "discord.com" ||
            url.hostname.endsWith(".discord.com")
          ) ||
          !url.pathname.startsWith("/api/webhooks/")
        ) {
          throw new Error("Invalid Discord webhook URL");
        }
      } catch (_e) {
        throw new Error("Invalid Discord webhook URL format");
      }
    }

    const existing = await ctx.db
      .query("guildSettings")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        guildId: args.guildId,
        discordWebhookUrl: args.discordWebhookUrl,
      });
    } else {
      await ctx.db.insert("guildSettings", {
        userId,
        guildId: args.guildId,
        discordWebhookUrl: args.discordWebhookUrl,
      });
    }
  },
});

export const internalGetGuildSettings = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("guildSettings")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
  },
});

export const internalApplyGuildSync = internalMutation({
  args: {
    userId: v.id("users"),
    members: v.array(v.any()),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, members, now } = args;

    // Get existing members to compare for milestones
    const existingMembers = await ctx.db
      .query("guildMembers")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();

    const existingMemberMap = new Map(
      existingMembers.map(m => [m.memberId, m]),
    );
    const milestones: string[] = [];

    // Delete old members
    for (const m of existingMembers) {
      await ctx.db.delete(m._id);
    }

    // Insert new members and check for milestones
    for (const m of members) {
      const old = existingMemberMap.get(m.user_id);

      // Level milestone (e.g., every 100 levels)
      if (old && Math.floor(m.level / 100) > Math.floor(old.level / 100)) {
        milestones.push(`🎉 **${m.name}** reached level **${m.level}**!`);
      } else if (!old) {
        // New member milestone
        milestones.push(
          `👋 **${m.name}** joined the guild! (Level ${m.level})`,
        );
      }

      await ctx.db.insert("guildMembers", {
        userId,
        memberId: m.user_id,
        memberName: m.name,
        position: m.position,
        level: m.level,
        safeMode: m.safe_mode === 1,
        currentHp: m.current_hp,
        maxHp: m.max_hp,
        warrior: m.warrior === 1,
        steps: m.steps,
        npcKills: m.npc_kills,
        pvpKills: m.user_kills,
        lastActivity: m.last_activity,
      });
    }

    // Update last sync time
    const settings = await ctx.db
      .query("guildSettings")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
    if (settings) {
      await ctx.db.patch(settings._id, { lastSyncAt: now });
    }

    return milestones;
  },
});

export const syncMembers = action({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const settings = await ctx.runQuery(
      internal.guild.internalGetGuildSettings,
      { userId },
    );
    if (!settings || !settings.guildId) {
      throw new Error("Guild ID not configured");
    }

    const apiKeys = await ctx.runQuery(
      internal.syncPlayer.internalGetApiKeysRow,
      { userId },
    );
    if (!apiKeys) throw new Error("API key not configured");

    const { json } = await smmoCall(
      ctx,
      userId,
      apiKeys.smmoApiKey,
      `/v1/guild/members/${settings.guildId}`,
    );
    const members = json as any[];

    const now = Date.now();
    const milestones = await ctx.runMutation(
      internal.guild.internalApplyGuildSync,
      {
        userId,
        members,
        now,
      },
    );

    if (milestones.length > 0 && settings.discordWebhookUrl) {
      await postToDiscord(settings.discordWebhookUrl, {
        content: milestones.join("\n"),
      });
    }

    return { memberCount: members.length, milestones };
  },
});

async function postToDiscord(webhookUrl: string, payload: any) {
  try {
    // Defense in depth: Verify webhook URL before fetching to prevent SSRF
    const url = new URL(webhookUrl);
    if (
      !(
        url.hostname === "discord.com" || url.hostname.endsWith(".discord.com")
      ) ||
      !url.pathname.startsWith("/api/webhooks/")
    ) {
      console.error("SSRF Blocked: Invalid Discord webhook URL");
      return;
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("Failed to post to Discord", await res.text());
    }
  } catch (e) {
    console.error("Error posting to Discord", e);
  }
}
