/**
 * SimpleMMO HTTP helpers (used from Convex actions only — never import from the client).
 * Base URL: https://api.simple-mmo.com — auth via `api-key` header.
 */

export const SMMO_API_BASE = "https://api.simple-mmo.com";

export type SmmoRateMeta = {
  limit?: number;
  remaining?: number;
  resetEpoch?: number;
};

export function parseRateMeta(res: Response): SmmoRateMeta {
  const limit = res.headers.get("X-RateLimit-Limit");
  const remaining = res.headers.get("X-RateLimit-Remaining");
  const reset = res.headers.get("X-RateLimit-Reset");
  return {
    limit: limit ? Number(limit) : undefined,
    remaining: remaining !== null && remaining !== "" ? Number(remaining) : undefined,
    resetEpoch: reset ? Number(reset) : undefined,
  };
}

export function mergeRateMeta(a: SmmoRateMeta, b: SmmoRateMeta): SmmoRateMeta {
  return {
    limit: b.limit ?? a.limit,
    remaining:
      a.remaining !== undefined && b.remaining !== undefined
        ? Math.min(a.remaining, b.remaining)
        : (b.remaining ?? a.remaining),
    resetEpoch: b.resetEpoch ?? a.resetEpoch,
  };
}

/** GET JSON from SMMO; throws on transport/HTTP errors with a readable message. */
export async function smmoFetchJson<T = unknown>(apiKey: string, path: string): Promise<{ json: T; rate: SmmoRateMeta }> {
  const rel = path.startsWith("/") ? path : `/${path}`;
  const url = `${SMMO_API_BASE}${rel}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "api-key": apiKey },
  });
  const rate = parseRateMeta(res);
  const text = await res.text();
  let json: T;
  try {
    json = (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new Error(`SMMO API returned non-JSON (HTTP ${res.status}): ${text.slice(0, 240)}`);
  }
  if (!res.ok) {
    const body = json as { message?: string; error?: string };
    const msg = body.message ?? body.error ?? text.slice(0, 240);
    throw new Error(`SMMO API HTTP ${res.status}: ${msg}`);
  }
  return { json, rate };
}

function slugSlot(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Equipment endpoint returns { [itemId]: slotLabel }.
 * Normalize labels to the app's slot keys (matches seeded demo layout).
 */
export function normalizeEquipmentSlot(slotLabel: string): string {
  const s = slugSlot(slotLabel);
  const aliases: Record<string, string> = {
    helmet: "helmet",
    hat: "helmet",
    amulet: "amulet",
    necklace: "amulet",
    armor: "armour",
    armour: "armour",
    body: "armour",
    chest: "armour",
    weapon: "weapon",
    main_hand: "weapon",
    shield: "shield",
    off_hand: "shield",
    greaves: "greaves",
    legs: "greaves",
    pants: "greaves",
    gauntlet: "gauntlet",
    gloves: "gauntlet",
    boots: "boots",
    shoes: "boots",
    pet: "pet",
    special: "special",
    wood_axe: "wood_axe",
    fishing_rod: "fishing_rod",
    pickaxe: "pickaxe",
    shovel: "shovel",
  };
  if (aliases[s]) return aliases[s];
  if (s.includes("wood") && s.includes("axe")) return "wood_axe";
  if (s.includes("fishing") || (s.includes("rod") && !s.includes("arrow"))) return "fishing_rod";
  if (s.includes("pickaxe")) return "pickaxe";
  if (s.includes("shovel")) return "shovel";
  return s || "special";
}

export function buildItemDisplayName(type: unknown, name: unknown): string {
  const t = typeof type === "string" ? type.trim() : "";
  const n = typeof name === "string" ? name.trim() : "";
  if (t && n) return `${t} ${n}`;
  return n || t || "Unknown";
}

function statKey(stat: unknown): string {
  return typeof stat === "string" ? stat.trim().toLowerCase() : "";
}

/** Map item stat1/2/3 + modifiers into str/def bonus fields used by the UI. */
export function itemStatBonuses(item: Record<string, unknown>): { strBonus?: number; defBonus?: number } {
  const out: { strBonus?: number; defBonus?: number } = {};
  const apply = (stat: unknown, mod: unknown) => {
    if (typeof mod !== "number") return;
    const k = statKey(stat);
    if (k.includes("str") || k === "strength") out.strBonus = mod;
    else if (k.includes("def") || k === "defence" || k === "defense") out.defBonus = mod;
  };
  apply(item.stat1, item.stat1modifier);
  apply(item.stat2, item.stat2modifier);
  apply(item.stat3, item.stat3modifier);
  return out;
}
