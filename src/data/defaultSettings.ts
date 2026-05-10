import type { PvpFilters, PvpTarget } from "../types";

export const defaultFilters: PvpFilters = {
  minLevel: 1,
  maxLevel: 200,
  minHealthPercent: 0,
  maxHealthPercent: 100,
  excludeBlacklistedPlayers: true,
  excludeBlacklistedGuilds: true,
  excludeRecentlySkipped: true
};

export const mockTargets: PvpTarget[] = [
  {
    id: "aelith-101",
    name: "Aelith",
    level: 114,
    guildName: "Silver Guard",
    healthPercent: 82,
    profileUrl: "https://example.com/player/aelith-101"
  },
  {
    id: "bronn-220",
    name: "Bronn",
    level: 87,
    guildName: "Night Owls",
    healthPercent: 54,
    profileUrl: "https://example.com/player/bronn-220"
  },
  {
    id: "cira-037",
    name: "Cira",
    level: 136,
    guildName: "Silver Guard",
    healthPercent: 31
  },
  {
    id: "doran-412",
    name: "Doran",
    level: 64,
    healthPercent: 97,
    profileUrl: "https://example.com/player/doran-412"
  }
];
