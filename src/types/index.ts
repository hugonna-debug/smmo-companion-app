export interface PvpTarget {
  id: string;
  name: string;
  level: number;
  guildName?: string;
  healthPercent: number;
  profileUrl?: string;
}

export interface PvpFilters {
  minLevel: number;
  maxLevel: number;
  minHealthPercent: number;
  maxHealthPercent: number;
  excludeBlacklistedPlayers: boolean;
  excludeBlacklistedGuilds: boolean;
  excludeRecentlySkipped: boolean;
}

export interface BlacklistState {
  playerIds: string[];
  guildNames: string[];
}

export interface PvpSessionLogEntry {
  id: string;
  createdAt: string;
  type: "info" | "skip" | "blacklist" | "error";
  message: string;
}
