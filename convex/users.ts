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

    const apiKeyRow = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
    if (apiKeyRow) {
      await ctx.db.delete(apiKeyRow._id);
    }

    const settings = await ctx.db
      .query("appSettings")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
    if (settings?.apiKey !== undefined) {
      await ctx.db.patch(settings._id, { apiKey: undefined });
    }

    await ctx.db.delete(userId);

    return { success: true };
  },
});
