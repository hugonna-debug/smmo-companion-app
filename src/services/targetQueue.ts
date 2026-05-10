import type { BlacklistState, PvpFilters, PvpTarget } from "../types";

export function filterTargets(
  targets: PvpTarget[],
  filters: PvpFilters,
  blacklist: BlacklistState,
  recentlySkippedIds: string[]
): PvpTarget[] {
  const skippedSet = new Set(recentlySkippedIds);
  const blacklistedPlayerSet = new Set(blacklist.playerIds);
  const blacklistedGuildSet = new Set(blacklist.guildNames);

  return targets.filter((target) => {
    if (target.level < filters.minLevel || target.level > filters.maxLevel) {
      return false;
    }

    if (
      target.healthPercent < filters.minHealthPercent ||
      target.healthPercent > filters.maxHealthPercent
    ) {
      return false;
    }

    if (filters.excludeBlacklistedPlayers && blacklistedPlayerSet.has(target.id)) {
      return false;
    }

    if (
      filters.excludeBlacklistedGuilds &&
      target.guildName &&
      blacklistedGuildSet.has(target.guildName)
    ) {
      return false;
    }

    if (filters.excludeRecentlySkipped && skippedSet.has(target.id)) {
      return false;
    }

    return true;
  });
}

export function getNextTarget(targets: PvpTarget[]): PvpTarget | null {
  return targets.length > 0 ? targets[0] : null;
}
