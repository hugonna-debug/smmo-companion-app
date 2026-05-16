import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";

const SMMO_BASE_URL = "https://api.simple-mmo.com";
const RATE_LIMIT_PER_MINUTE = 40;
const RATE_LIMIT_WINDOW_MS = 60_000;

const READ_ONLY_ENDPOINTS: RegExp[] = [
  /^\/v1\/player\/info\/\d+$/,
  /^\/v2\/player\/info$/,
  /^\/v1\/player\/skills\/\d+$/,
  /^\/v1\/player\/equipment\/\d+$/,
  /^\/v1\/items\/info\/\d+$/,
];

type RateLimitHeaders = {
  limit?: number;
  remaining?: number;
  resetAt?: number;
};

type RateSlot = {
  smmoApiKey: string;
  smmoPlayerId: number;
  limit: number;
  remaining: number;
  resetAt: number;
};

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeResetAt(rawValue: string | null): number | undefined {
  if (!rawValue) return undefined;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) return undefined;
  const now = Date.now();
  if (parsed > 1_000_000_000_000) return parsed;
  if (parsed > now / 1000) return parsed * 1000;
  return now + parsed * 1000;
}

function readRateLimitHeaders(response: Response): RateLimitHeaders {
  const limitHeader = response.headers.get("x-ratelimit-limit");
  const remainingHeader = response.headers.get("x-ratelimit-remaining");
  return {
    limit: limitHeader ? asNumber(limitHeader, RATE_LIMIT_PER_MINUTE) : undefined,
    remaining: remainingHeader ? asNumber(remainingHeader, 0) : undefined,
    resetAt: normalizeResetAt(response.headers.get("x-ratelimit-reset")),
  };
}

function extractApiError(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const value = record.error ?? record.message ?? record.detail;
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return null;
}

function unwrapPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const record = payload as Record<string, unknown>;
  if (record.data !== undefined) return record.data;
  if (record.player !== undefined) return record.player;
  return payload;
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function performGet(endpoint: string, apiKey: string): Promise<{
  payload: unknown;
  headers: RateLimitHeaders;
}> {
  const response = await fetch(`${SMMO_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "api-key": apiKey,
    },
  });

  const headers = readRateLimitHeaders(response);
  const parsedBody = await parseJsonBody(response);
  const payload = unwrapPayload(parsedBody);

  if (!response.ok) {
    const message = extractApiError(payload) ?? `SMMO API request failed (${response.status})`;
    throw new Error(message);
  }

  const apiLevelError = extractApiError(payload);
  if (apiLevelError) {
    throw new Error(apiLevelError);
  }

  return { payload, headers };
}

export const getStoredCredentials = internalQuery({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(
    v.object({
      smmoApiKey: v.string(),
      smmoPlayerId: v.number(),
      lastValidated: v.number(),
      lastSyncAt: v.optional(v.number()),
      rateLimitLimit: v.optional(v.number()),
      rateLimitRemaining: v.optional(v.number()),
      rateLimitResetAt: v.optional(v.number()),
      rateWindowStartedAt: v.optional(v.number()),
      rateWindowCount: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, { userId }) => {
    const credentials = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();

    if (!credentials) return null;

    return {
      smmoApiKey: credentials.smmoApiKey,
      smmoPlayerId: credentials.smmoPlayerId,
      lastValidated: credentials.lastValidated,
      lastSyncAt: credentials.lastSyncAt,
      rateLimitLimit: credentials.rateLimitLimit,
      rateLimitRemaining: credentials.rateLimitRemaining,
      rateLimitResetAt: credentials.rateLimitResetAt,
      rateWindowStartedAt: credentials.rateWindowStartedAt,
      rateWindowCount: credentials.rateWindowCount,
    };
  },
});

export const consumeRateLimitSlot = internalMutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.object({
    smmoApiKey: v.string(),
    smmoPlayerId: v.number(),
    limit: v.number(),
    remaining: v.number(),
    resetAt: v.number(),
  }),
  handler: async (ctx, { userId }): Promise<RateSlot> => {
    const credentials = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();

    if (!credentials) {
      throw new Error("No SMMO API key configured. Add it in Settings.");
    }

    const now = Date.now();
    const existingWindowStart = credentials.rateWindowStartedAt ?? now;
    const isWindowExpired = now - existingWindowStart >= RATE_LIMIT_WINDOW_MS;
    const windowStart = isWindowExpired ? now : existingWindowStart;
    const usedCount = isWindowExpired ? 0 : credentials.rateWindowCount ?? 0;

    if (usedCount >= RATE_LIMIT_PER_MINUTE) {
      const resetAt = windowStart + RATE_LIMIT_WINDOW_MS;
      await ctx.db.patch(credentials._id, {
        rateLimitLimit: RATE_LIMIT_PER_MINUTE,
        rateLimitRemaining: 0,
        rateLimitResetAt: resetAt,
      });
      const waitSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));
      throw new Error(`Rate limit reached. Try again in ${waitSeconds}s.`);
    }

    const nextCount = usedCount + 1;
    const remaining = Math.max(0, RATE_LIMIT_PER_MINUTE - nextCount);
    const resetAt = windowStart + RATE_LIMIT_WINDOW_MS;

    await ctx.db.patch(credentials._id, {
      rateWindowStartedAt: windowStart,
      rateWindowCount: nextCount,
      rateLimitLimit: RATE_LIMIT_PER_MINUTE,
      rateLimitRemaining: remaining,
      rateLimitResetAt: resetAt,
    });

    return {
      smmoApiKey: credentials.smmoApiKey,
      smmoPlayerId: credentials.smmoPlayerId,
      limit: RATE_LIMIT_PER_MINUTE,
      remaining,
      resetAt,
    };
  },
});

export const updateRateLimitFromHeaders = internalMutation({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    remaining: v.optional(v.number()),
    resetAt: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, { userId, limit, remaining, resetAt }) => {
    const credentials = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
    if (!credentials) return null;

    await ctx.db.patch(credentials._id, {
      rateLimitLimit: limit ?? credentials.rateLimitLimit ?? RATE_LIMIT_PER_MINUTE,
      rateLimitRemaining: remaining ?? credentials.rateLimitRemaining,
      rateLimitResetAt: resetAt ?? credentials.rateLimitResetAt,
    });
    return null;
  },
});

export const fetchSmmoEndpoint = internalAction({
  args: {
    userId: v.id("users"),
    endpoint: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, { userId, endpoint }) => {
    const isAllowed = READ_ONLY_ENDPOINTS.some(pattern => pattern.test(endpoint));
    if (!isAllowed) {
      throw new Error("Requested endpoint is not allowed.");
    }

    const slot = await ctx.runMutation(internal.smmoApi.consumeRateLimitSlot, { userId });
    const { payload, headers } = await performGet(endpoint, slot.smmoApiKey);

    await ctx.runMutation(internal.smmoApi.updateRateLimitFromHeaders, {
      userId,
      limit: headers.limit,
      remaining: headers.remaining,
      resetAt: headers.resetAt,
    });

    return payload;
  },
});

export const validateApiCredentials = action({
  args: {
    smmoApiKey: v.string(),
    smmoPlayerId: v.number(),
  },
  returns: v.object({
    playerId: v.number(),
    playerName: v.string(),
    rateLimitLimit: v.optional(v.number()),
    rateLimitRemaining: v.optional(v.number()),
    rateLimitResetAt: v.optional(v.number()),
  }),
  handler: async (ctx, { smmoApiKey, smmoPlayerId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const { payload, headers } = await performGet(`/v1/player/info/${smmoPlayerId}`, smmoApiKey);
    const player = (payload ?? {}) as Record<string, unknown>;
    const playerName = typeof player.name === "string" ? player.name : null;
    if (!playerName) {
      throw new Error("API key validated but player name was missing in the response.");
    }

    return {
      playerId: asNumber(player.id, smmoPlayerId),
      playerName,
      rateLimitLimit: headers.limit,
      rateLimitRemaining: headers.remaining,
      rateLimitResetAt: headers.resetAt,
    };
  },
});
