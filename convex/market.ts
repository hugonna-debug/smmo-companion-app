import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { smmoCall } from "./syncPlayer";

/**
 * Internal query to fetch all tracked items for a user.
 * Used by the syncMarketPrices action.
 */
export const getTrackedItemsInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("marketTracking")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Appends a new price point to an item's history and updates current metrics.
 */
export const updatePriceHistory = internalMutation({
  args: {
    trackingId: v.id("marketTracking"),
    price: v.number(),
    currentLow: v.number(),
    currentHigh: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const item = await ctx.db.get(args.trackingId);

    // Ensure the item exists and belongs to the user (if authenticated)
    if (!item) return;
    if (userId && item.userId !== userId) return;

    const now = Date.now();
    const history = item.priceHistory ?? [];

    // Add new price point and keep the last 50 points for trend analysis
    const newHistory = [
      ...history,
      { price: args.price, timestamp: now },
    ].slice(-50);

    await ctx.db.patch(args.trackingId, {
      currentLow: args.currentLow,
      currentHigh: args.currentHigh,
      lastPrice: args.price,
      priceHistory: newHistory,
      lastChecked: now,
    });
  },
});

/**
 * Fetches the tracking details and price history for a specific item.
 */
export const getPriceHistory = query({
  args: { itemId: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("marketTracking")
      .withIndex("by_userId_itemId", q =>
        q.eq("userId", userId).eq("itemId", args.itemId),
      )
      .unique();
  },
});

/**
 * Action to fetch current market data for all items in the user's watchlist.
 * Uses the smmoCall helper to respect the 40/min rate limit.
 */
export const syncMarketPrices = action({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const row = await ctx.runQuery(internal.syncPlayer.internalGetApiKeysRow, {
      userId,
    });
    if (!row)
      throw new Error("Add and validate your SMMO API key in Settings first.");

    const trackedItems = await ctx.runQuery(
      internal.market.getTrackedItemsInternal,
      { userId },
    );
    if (trackedItems.length === 0) return;

    for (const item of trackedItems) {
      try {
        // Fetch detailed item info which includes market low/high/circulation
        const { json } = await smmoCall(
          ctx,
          userId,
          row.smmoApiKey,
          `/v1/items/info/${item.itemId}`,
        );
        const info = json as any;

        const low = typeof info.market_low === "number" ? info.market_low : 0;
        const high =
          typeof info.market_high === "number" ? info.market_high : 0;
        const circulation =
          typeof info.circulation === "number" ? info.circulation : undefined;

        // Update the item record
        await ctx.runMutation(internal.market.updatePriceHistory, {
          trackingId: item._id,
          price: low, // We track the lowest market price as the history data point
          currentLow: low,
          currentHigh: high,
        });

        // Optionally update circulation if it changed
        if (circulation !== undefined && circulation !== item.circulation) {
          await ctx.runMutation(internal.market.updateCirculationInternal, {
            trackingId: item._id,
            circulation,
          });
        }
      } catch (e) {
        console.error(`[MarketSync] Failed to sync item ${item.itemId}:`, e);
      }
    }
  },
});

/**
 * Internal mutation to update circulation count.
 */
export const updateCirculationInternal = internalMutation({
  args: {
    trackingId: v.id("marketTracking"),
    circulation: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.trackingId, { circulation: args.circulation });
  },
});

/**
 * Updates the alert threshold for a tracked item.
 */
export const setPriceAlert = mutation({
  args: {
    trackingId: v.id("marketTracking"),
    alertBelow: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const item = await ctx.db.get(args.trackingId);
    if (!item || (userId && item.userId !== userId)) return;

    await ctx.db.patch(args.trackingId, {
      alertBelow: args.alertBelow ?? undefined,
    });
  },
});
