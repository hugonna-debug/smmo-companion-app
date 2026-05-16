import { ConvexError } from "convex/values";

const SMMO_API_BASE_URL = "https://api.simple-mmo.com";
const RATE_LIMIT_PER_MINUTE = 40;
const RATE_LIMIT_WINDOW_MS = 60_000;

type RateLimitState = {
  windowStartedAt: number;
  requestCount: number;
  limit: number;
  remaining: number;
  resetAt: number | null;
  cooldownUntil: number | null;
};

export type RateLimitSnapshot = {
  limit: number;
  remaining: number;
  resetAt: number | null;
  cooldownUntil: number | null;
};

const userRateLimitState = new Map<string, RateLimitState>();

function getOrCreateState(rateKey: string): RateLimitState {
  const existing = userRateLimitState.get(rateKey);
  if (existing) return existing;

  const now = Date.now();
  const initial: RateLimitState = {
    windowStartedAt: now,
    requestCount: 0,
    limit: RATE_LIMIT_PER_MINUTE,
    remaining: RATE_LIMIT_PER_MINUTE,
    resetAt: now + RATE_LIMIT_WINDOW_MS,
    cooldownUntil: null,
  };
  userRateLimitState.set(rateKey, initial);
  return initial;
}

function parseResetHeader(resetHeader: string | null): number | null {
  if (!resetHeader) return null;
  const parsed = Number(resetHeader);
  if (Number.isNaN(parsed)) return null;
  // APIs typically return epoch seconds for reset headers.
  return parsed > 1_000_000_000_000 ? parsed : parsed * 1000;
}

function reserveRequest(rateKey: string): void {
  const now = Date.now();
  const state = getOrCreateState(rateKey);

  if (state.cooldownUntil && now < state.cooldownUntil) {
    throw new ConvexError(
      `Rate limited. Try again in ${Math.ceil((state.cooldownUntil - now) / 1000)}s.`,
    );
  }

  if (now - state.windowStartedAt >= RATE_LIMIT_WINDOW_MS) {
    state.windowStartedAt = now;
    state.requestCount = 0;
    state.limit = RATE_LIMIT_PER_MINUTE;
    state.remaining = RATE_LIMIT_PER_MINUTE;
    state.resetAt = now + RATE_LIMIT_WINDOW_MS;
    state.cooldownUntil = null;
  }

  if (state.requestCount >= RATE_LIMIT_PER_MINUTE) {
    state.remaining = 0;
    state.cooldownUntil = state.windowStartedAt + RATE_LIMIT_WINDOW_MS;
    throw new ConvexError("Rate limited. Maximum 40 requests per minute reached.");
  }

  state.requestCount += 1;
  state.remaining = Math.max(0, RATE_LIMIT_PER_MINUTE - state.requestCount);
}

function updateFromHeaders(rateKey: string, headers: Headers): RateLimitSnapshot {
  const state = getOrCreateState(rateKey);
  const limitHeader = headers.get("x-ratelimit-limit");
  const remainingHeader = headers.get("x-ratelimit-remaining");
  const resetAt = parseResetHeader(headers.get("x-ratelimit-reset"));

  if (limitHeader) {
    const parsedLimit = Number(limitHeader);
    if (!Number.isNaN(parsedLimit)) state.limit = parsedLimit;
  }

  if (remainingHeader) {
    const parsedRemaining = Number(remainingHeader);
    if (!Number.isNaN(parsedRemaining)) state.remaining = parsedRemaining;
  }

  if (resetAt) {
    state.resetAt = resetAt;
  }

  if (state.remaining <= 0) {
    state.cooldownUntil = state.resetAt ?? Date.now() + RATE_LIMIT_WINDOW_MS;
  } else {
    state.cooldownUntil = null;
  }

  return {
    limit: state.limit,
    remaining: state.remaining,
    resetAt: state.resetAt,
    cooldownUntil: state.cooldownUntil,
  };
}

function readApiErrorBody(rawBody: string): string {
  if (!rawBody) return "Unknown SMMO API error";
  try {
    const parsed = JSON.parse(rawBody) as { error?: string; message?: string };
    return parsed.error ?? parsed.message ?? rawBody;
  } catch {
    return rawBody;
  }
}

export async function smmoGetJson<T>(
  path: string,
  apiKey: string,
  rateKey: string,
): Promise<{ data: T; rateLimit: RateLimitSnapshot }> {
  reserveRequest(rateKey);

  const response = await fetch(`${SMMO_API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "api-key": apiKey,
      Accept: "application/json",
    },
  });

  const rateLimit = updateFromHeaders(rateKey, response.headers);

  if (!response.ok) {
    const rawBody = await response.text();
    const message = readApiErrorBody(rawBody);
    throw new ConvexError(`SMMO API request failed (${response.status}): ${message}`);
  }

  const data = (await response.json()) as T;
  return { data, rateLimit };
}
