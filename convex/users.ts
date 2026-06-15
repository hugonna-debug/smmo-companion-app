import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";

export const deleteAccount = mutation({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const authAccounts = await ctx.db
      .query("authAccounts")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();
    for (const account of authAccounts) {
      await ctx.db.delete(account._id);
    }

    const authSessions = await ctx.db
      .query("authSessions")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();
    for (const session of authSessions) {
      await ctx.db.delete(session._id);
    }

    const tables = [
      "playerData",
      "playerSkills",
      "equipment",
      "templeBoost",
      "guildInfo",
      "guildSettings",
      "guildMembers",
      "guildContribution",
      "guildTask",
      "guildSanctuary",
      "guildWars",
      "pvpTargets",
      "buffs",
      "worldBosses",
      "diamondMarket",
      "orphanage",
      "appSettings",
      "apiKeys",
      "marketTracking",
      "personalItems",
      "pvpAssistantQueue",
      "pvpBlacklist",
      "aiAdvisorMessages",
      "vaultCodes",
      "collectionProgress",
      "playerWatchlist",
      "tasks",
      "activeModifiers",
      "professionStatus",
    ] as const;

    for (const table of tables) {
      const docs = await ctx.db
        .query(table)
        .withIndex("by_userId", q => q.eq("userId", userId))
        .collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    await ctx.db.delete(userId);

    return { success: true };
  },
});
