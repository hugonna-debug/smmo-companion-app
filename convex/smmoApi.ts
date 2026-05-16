import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import type { SmmoV1PlayerInfo, SmmoV2PlayerInfo } from "./smmoTransforms";

const SMMO_API_BASE_URL = "https://api.simple-mmo.com";
const RATE_LIMIT_MAX_REQUESTS = 40;
const RATE_LIMIT_WINDOW_MS = 60_000;
const REQUEST_TIMEOUT_MS = 15_000;

const requestTimestamps: number[] = [];
let lastHeaderLimit = RATE_LIMIT_MAX_REQUESTS;
let lastHeaderRemaining = RATE_LIMIT_MAX_REQUESTS;
let lastHeaderSeenAt = 0;

export type SmmoRateLimitStatus = {
  limit: number;
  remaining: number;
  resetAt: number;
};

export class SmmoApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SmmoApiError";
    this.status = status;
  }
}

const rateLimitValidator = v.object({
  limit: v.number(),
  remaining: v.number(),
  resetAt: v.number(),
});

const smmoActionResultValidator = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
  playerName: v.optional(v.string()),
  playerId: v.optional(v.number()),
  lastValidated: v.optional(v.number()),
  rateLimit: rateLimitValidator,
});

function pruneRequestWindow(now: number) {
  while (
    requestTimestamps.length > 0 &&
    now - requestTimestamps[0] >= RATE_LIMIT_WINDOW_MS
  ) {
    requestTimestamps.shift();
  }
}

export function getSmmoRateLimitStatus(now = Date.now()): SmmoRateLimitStatus {
  pruneRequestWindow(now);
  const localRemaining = Math.max(
    RATE_LIMIT_MAX_REQUESTS - requestTimestamps.length,
    0,
  );
  const resetAt = requestTimestamps[0]
    ? requestTimestamps[0] + RATE_LIMIT_WINDOW_MS
    : now;
  const headerRemainingIsFresh = now - lastHeaderSeenAt < RATE_LIMIT_WINDOW_MS;

  return {
    limit: Math.min(lastHeaderLimit, RATE_LIMIT_MAX_REQUESTS),
    remaining: headerRemainingIsFresh
      ? Math.min(localRemaining, lastHeaderRemaining)
      : localRemaining,
    resetAt,
  };
}

async function waitForRateLimitSlot() {
  while (true) {
    const now = Date.now();
    pruneRequestWindow(now);
    if (requestTimestamps.length < RATE_LIMIT_MAX_REQUESTS) {
      requestTimestamps.push(now);
      return;
    }

    const waitMs = requestTimestamps[0] + RATE_LIMIT_WINDOW_MS - now;
    await new Promise(resolve => setTimeout(resolve, Math.max(waitMs, 100)));
  }
}

function updateRateLimitFromHeaders(headers: Headers) {
  const limitHeader = headers.get("x-ratelimit-limit");
  const remainingHeader = headers.get("x-ratelimit-remaining");
  const limit = limitHeader === null ? Number.NaN : Number(limitHeader);
  const remaining =
    remainingHeader === null ? Number.NaN : Number(remainingHeader);

  if (Number.isFinite(limit)) lastHeaderLimit = limit;
  if (Number.isFinite(remaining)) lastHeaderRemaining = remaining;
  if (Number.isFinite(limit) || Number.isFinite(remaining)) {
    lastHeaderSeenAt = Date.now();
  }
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function errorMessageFromPayload(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  return (
    readString(record.message) ??
    readString(record.error) ??
    readString(record.reason)
  );
}

export function getSmmoErrorMessage(error: unknown): string {
  if (error instanceof SmmoApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Unable to reach the SMMO API";
}

function parseJsonPayload(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export async function fetchSmmoApi<T>(
  apiKey: string,
  path: string,
): Promise<{ data: T; rateLimit: SmmoRateLimitStatus }> {
  await waitForRateLimitSlot();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${SMMO_API_BASE_URL}${path}`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "api-key": apiKey,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new SmmoApiError("SMMO API request timed out", 408);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
  updateRateLimitFromHeaders(response.headers);

  const text = await response.text();
  const payload = parseJsonPayload(text);

  if (!response.ok) {
    const message = errorMessageFromPayload(payload) ?? response.statusText;
    throw new SmmoApiError(
      `SMMO API ${response.status}: ${message}`,
      response.status,
    );
  }

  if (payload === undefined) {
    throw new SmmoApiError("SMMO API returned invalid JSON", response.status);
  }

  return {
    data: payload as T,
    rateLimit: getSmmoRateLimitStatus(),
  };
}

export const getRateLimitStatus = action({
  args: {},
  returns: rateLimitValidator,
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return getSmmoRateLimitStatus();
  },
});

export const validateAndSaveApiKey = action({
  args: {
    apiKey: v.string(),
    playerId: v.number(),
  },
  returns: smmoActionResultValidator,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        success: false,
        message: "You must be signed in to save an API key.",
        rateLimit: getSmmoRateLimitStatus(),
      };
    }

    const apiKey = args.apiKey.trim();
    if (!apiKey || args.playerId <= 0) {
      return {
        success: false,
        message: "Enter both an API key and a valid SMMO player ID.",
        rateLimit: getSmmoRateLimitStatus(),
      };
    }

    try {
      const yourInfo = await fetchSmmoApi<SmmoV2PlayerInfo>(
        apiKey,
        "/v2/player/info",
      );
      const authenticatedPlayerId = readNumber(yourInfo.data.id);

      if (
        authenticatedPlayerId === undefined ||
        !Number.isInteger(authenticatedPlayerId) ||
        authenticatedPlayerId <= 0
      ) {
        return {
          success: false,
          message:
            "The SMMO API did not return a valid player ID for this key.",
          rateLimit: getSmmoRateLimitStatus(),
        };
      }

      if (authenticatedPlayerId !== args.playerId) {
        return {
          success: false,
          message: `This API key belongs to player ${authenticatedPlayerId}, not ${args.playerId}.`,
          playerId: authenticatedPlayerId,
          rateLimit: getSmmoRateLimitStatus(),
        };
      }
      const requestedPlayer = await fetchSmmoApi<SmmoV1PlayerInfo>(
        apiKey,
        `/v1/player/info/${args.playerId}`,
      );

      const lastValidated = Date.now();
      await ctx.runMutation(internal.gameData.saveSmmoApiKeyInternal, {
        userId,
        smmoApiKey: apiKey,
        smmoPlayerId: args.playerId,
        lastValidated,
      });

      return {
        success: true,
        playerName:
          readString(yourInfo.data.name) ??
          readString(requestedPlayer.data.name) ??
          "Unknown Player",
        playerId: args.playerId,
        lastValidated,
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
