import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // Player profile data (from SMMO API v1 + v2)
  playerData: defineTable({
    userId: v.id("users"),
    playerId: v.optional(v.number()),
    playerName: v.string(),
    level: v.number(),
    hp: v.number(),
    maxHp: v.number(),
    exp: v.number(),
    expToNextLevel: v.number(),
    gold: v.number(),
    bank: v.optional(v.number()),
    diamonds: v.optional(v.number()),
    steps: v.number(),
    npcKills: v.number(),
    pvpKills: v.number(),
    pvpDeaths: v.number(),
    questsComplete: v.number(),
    questsPerformed: v.optional(v.number()),
    tasksCompleted: v.optional(v.number()),
    bossKills: v.optional(v.number()),
    marketTrades: v.optional(v.number()),
    p2pTrades: v.optional(v.number()),
    reputation: v.optional(v.number()),
    bountiesCompleted: v.optional(v.number()),
    dailiesUnlocked: v.optional(v.number()),
    chestsOpened: v.optional(v.number()),
    guildId: v.optional(v.number()),
    guildName: v.optional(v.string()),
    safeMode: v.boolean(),
    avatarUrl: v.optional(v.string()),
    backgroundUrl: v.optional(v.string()),
    // V2 fields
    energy: v.optional(v.number()),
    maxEnergy: v.optional(v.number()),
    questPoints: v.optional(v.number()),
    maxQuestPoints: v.optional(v.number()),
    availableStatPoints: v.optional(v.number()),
    membership: v.optional(v.number()),
    // Detailed stat breakdown (V2)
    coreStr: v.optional(v.number()),
    coreDef: v.optional(v.number()),
    coreDex: v.optional(v.number()),
    equipStr: v.optional(v.number()),
    equipDef: v.optional(v.number()),
    equipDex: v.optional(v.number()),
    bonusStr: v.optional(v.number()),
    bonusDef: v.optional(v.number()),
    bonusDex: v.optional(v.number()),
    totalStr: v.optional(v.number()),
    totalDef: v.optional(v.number()),
    totalDex: v.optional(v.number()),
    spAtkDamage: v.optional(v.number()),
    // Percentile rankings
    strRank: v.optional(v.string()),
    defRank: v.optional(v.string()),
    dexRank: v.optional(v.string()),
    // Profile extras
    title: v.optional(v.string()),
    playerClass: v.optional(v.string()),
    joinDate: v.optional(v.string()),
    totalExp: v.optional(v.number()),
    awards: v.optional(v.number()),
    avatarsUnlocked: v.optional(v.number()),
    professionTime: v.optional(v.string()),
    forumPosts: v.optional(v.number()),
    locationId: v.optional(v.number()),
    locationName: v.optional(v.string()),
    lastUpdated: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Player skills (7 skills total)
  playerSkills: defineTable({
    userId: v.id("users"),
    skill: v.string(),
    level: v.number(),
    exp: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Equipment slots (14 real slots)
  equipment: defineTable({
    userId: v.id("users"),
    slot: v.string(),
    itemName: v.optional(v.string()),
    itemId: v.optional(v.number()),
    rarity: v.optional(v.string()),
    attack: v.optional(v.number()),
    defense: v.optional(v.number()),
    critPercent: v.optional(v.number()),
    strBonus: v.optional(v.number()),
    defBonus: v.optional(v.number()),
    level: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_slot", ["userId", "slot"]),

  // Temple active boost
  templeBoost: defineTable({
    userId: v.id("users"),
    godName: v.string(),
    godTitle: v.string(),
    bonus: v.string(),
    activatedAt: v.number(),
    expiresAt: v.number(),
    worshipsUsedToday: v.number(),
    maxWorshipsPerDay: v.number(),
    worshipResetAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Guild detailed info
  guildInfo: defineTable({
    userId: v.id("users"),
    guildId: v.number(),
    name: v.string(),
    tag: v.string(),
    ownerId: v.number(),
    exp: v.number(),
    currentSeasonExp: v.number(),
    legacyExp: v.optional(v.number()),
    memberCount: v.number(),
    eligibleForWar: v.boolean(),
    icon: v.optional(v.string()),
  })
    .index("by_userId", ["userId"]),

  // Guild members
  guildMembers: defineTable({
    userId: v.id("users"),
    memberId: v.number(),
    memberName: v.string(),
    position: v.string(),
    level: v.number(),
    safeMode: v.boolean(),
    currentHp: v.number(),
    maxHp: v.number(),
    warrior: v.boolean(),
    steps: v.number(),
    npcKills: v.optional(v.number()),
    pvpKills: v.number(),
    lastActivity: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Guild member contribution (own guild only)
  guildContribution: defineTable({
    userId: v.id("users"),
    memberId: v.number(),
    goldDeposited: v.number(),
    powerPointsDeposited: v.number(),
    pveKills: v.number(),
    pveExp: v.number(),
    pvpKills: v.number(),
    pvpExp: v.number(),
    taxGuildBank: v.optional(v.number()),
    taxSanctuary: v.optional(v.number()),
  })
    .index("by_userId", ["userId"]),

  // Guild wars data
  guildWars: defineTable({
    userId: v.id("users"),
    enemyGuildId: v.number(),
    enemyGuildName: v.string(),
    ourScore: v.number(),
    enemyScore: v.number(),
    status: v.optional(v.string()),
    isBlacklisted: v.boolean(),
  })
    .index("by_userId", ["userId"]),

  // Guild task (own guild only)
  guildTask: defineTable({
    userId: v.id("users"),
    taskType: v.string(),
    currentAmount: v.number(),
    targetAmount: v.number(),
    expReward: v.number(),
    powerPointReward: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Guild sanctuary tiers
  guildSanctuary: defineTable({
    userId: v.id("users"),
    tierKey: v.string(),
    tierName: v.string(),
    effects: v.array(v.string()),
    currentValue: v.number(),
    targetValue: v.number(),
    percentage: v.number(),
    isActive: v.boolean(),
    inProgress: v.boolean(),
  })
    .index("by_userId", ["userId"]),

  // PvP targets generated from guild wars
  pvpTargets: defineTable({
    userId: v.id("users"),
    targetPlayerId: v.number(),
    targetName: v.string(),
    targetLevel: v.number(),
    targetHpPercent: v.number(),
    targetGuildId: v.number(),
    targetGuildName: v.string(),
    targetGold: v.number(),
    targetSafeMode: v.boolean(),
    isSkipped: v.boolean(),
  })
    .index("by_userId", ["userId"]),

  // Active buffs/timers
  buffs: defineTable({
    userId: v.id("users"),
    buffName: v.string(),
    buffType: v.string(),
    expiresAt: v.number(),
    bonusPercent: v.optional(v.number()),
    iconEmoji: v.optional(v.string()),
  })
    .index("by_userId", ["userId"]),

  // World bosses
  worldBosses: defineTable({
    userId: v.id("users"),
    bossId: v.number(),
    name: v.string(),
    level: v.number(),
    isGod: v.boolean(),
    str: v.number(),
    def: v.number(),
    dex: v.number(),
    currentHp: v.number(),
    maxHp: v.number(),
    enableTime: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Item information (cached lookups)
  items: defineTable({
    userId: v.id("users"),
    itemId: v.number(),
    name: v.string(),
    type: v.string(),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    equipable: v.boolean(),
    level: v.number(),
    rarity: v.string(),
    value: v.number(),
    stat1: v.optional(v.string()),
    stat1modifier: v.optional(v.number()),
    stat2: v.optional(v.string()),
    stat2modifier: v.optional(v.number()),
    customItem: v.boolean(),
    tradable: v.boolean(),
    circulation: v.optional(v.number()),
    marketLow: v.optional(v.number()),
    marketHigh: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_itemId", ["itemId"]),

  // Diamond market listings
  diamondMarket: defineTable({
    userId: v.id("users"),
    sellerId: v.number(),
    sellerName: v.string(),
    diamondAmount: v.number(),
    diamondsRemaining: v.number(),
    pricePerDiamond: v.number(),
    lastUpdated: v.string(),
  })
    .index("by_userId", ["userId"]),

  // Orphanage tiers
  orphanage: defineTable({
    userId: v.id("users"),
    tierKey: v.string(),
    tierName: v.string(),
    effects: v.array(v.string()),
    currentValue: v.number(),
    targetValue: v.number(),
    percentage: v.number(),
    isActive: v.boolean(),
    inProgress: v.boolean(),
  })
    .index("by_userId", ["userId"]),

  // Market tracked items (watchlist)
  marketTracking: defineTable({
    userId: v.id("users"),
    itemId: v.number(),
    itemName: v.string(),
    rarity: v.optional(v.string()),
    type: v.optional(v.string()),
    currentLow: v.optional(v.number()),
    currentHigh: v.optional(v.number()),
    lastPrice: v.optional(v.number()),
    priceHistory: v.optional(v.array(v.object({
      price: v.number(),
      timestamp: v.number(),
    }))),
    circulation: v.optional(v.number()),
    notes: v.optional(v.string()),
    alertBelow: v.optional(v.number()),
    addedAt: v.number(),
    lastChecked: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_itemId", ["userId", "itemId"]),

  // Personal item tracker (inventory, storage, showcase, custom)
  personalItems: defineTable({
    userId: v.id("users"),
    itemId: v.optional(v.number()),
    itemName: v.string(),
    category: v.string(), // "inventory" | "storage" | "showcase" | "custom" | "avatar"
    rarity: v.optional(v.string()),
    quantity: v.number(),
    value: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    acquiredAt: v.optional(v.number()),
    isFavorite: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_category", ["userId", "category"]),

  // PvP Target Assistant (enhanced queue system)
  pvpAssistantQueue: defineTable({
    userId: v.id("users"),
    targetPlayerId: v.number(),
    targetName: v.string(),
    targetLevel: v.number(),
    targetStr: v.optional(v.number()),
    targetDef: v.optional(v.number()),
    targetDex: v.optional(v.number()),
    targetHp: v.number(),
    targetMaxHp: v.number(),
    targetGuildId: v.optional(v.number()),
    targetGuildName: v.optional(v.string()),
    targetGold: v.number(),
    targetSafeMode: v.boolean(),
    status: v.string(), // "queued" | "attacking" | "completed" | "skipped" | "failed"
    priority: v.number(), // 1=high, 2=medium, 3=low
    allyKills: v.optional(v.number()),
    enemyKills: v.optional(v.number()),
    addedAt: v.number(),
    lastAttempt: v.optional(v.number()),
    attempts: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"]),

  // PvP Assistant blacklist
  pvpBlacklist: defineTable({
    userId: v.id("users"),
    targetPlayerId: v.number(),
    targetName: v.string(),
    reason: v.optional(v.string()),
    addedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  // AI Advisor chat history
  aiAdvisorMessages: defineTable({
    userId: v.id("users"),
    role: v.string(), // "user" | "assistant" | "system"
    content: v.string(),
    category: v.optional(v.string()), // "build" | "market" | "war" | "general"
    timestamp: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Vault codes (Simple Wolf)
  vaultCodes: defineTable({
    userId: v.id("users"),
    code: v.string(),
    source: v.string(), // "simple_wolf" | "community" | "manual"
    reward: v.optional(v.string()),
    rewardType: v.optional(v.string()), // "gold" | "exp" | "item" | "diamond" | "buff"
    isRedeemed: v.boolean(),
    expiresAt: v.optional(v.number()),
    addedAt: v.number(),
    redeemedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_userId", ["userId"]),

  // Collection progress (avatars, showcases, achievements)
  collectionProgress: defineTable({
    userId: v.id("users"),
    category: v.string(), // "avatar" | "background" | "title" | "badge" | "achievement"
    itemName: v.string(),
    itemId: v.optional(v.number()),
    isOwned: v.boolean(),
    rarity: v.optional(v.string()),
    obtainedAt: v.optional(v.number()),
    source: v.optional(v.string()), // "shop" | "event" | "quest" | "boss" | "craft" | "trade"
    notes: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_category", ["userId", "category"]),

  // Player watchlist
  playerWatchlist: defineTable({
    userId: v.id("users"),
    watchedPlayerId: v.number(),
    watchedPlayerName: v.string(),
    watchedPlayerLevel: v.number(),
    watchedPlayerGuildName: v.optional(v.string()),
    watchedPlayerStr: v.optional(v.number()),
    watchedPlayerDef: v.optional(v.number()),
    watchedPlayerDex: v.optional(v.number()),
    watchedPlayerHp: v.optional(v.number()),
    watchedPlayerMaxHp: v.optional(v.number()),
    watchedPlayerGold: v.optional(v.number()),
    watchedPlayerSafeMode: v.optional(v.boolean()),
    watchedPlayerLastActivity: v.optional(v.number()),
    tag: v.string(), // "friend" | "enemy" | "trader" | "guild_mate" | "other"
    notes: v.optional(v.string()),
    addedAt: v.number(),
    lastChecked: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Tasks (daily/weekly/monthly)
  tasks: defineTable({
    userId: v.id("users"),
    taskType: v.string(), // "daily" | "weekly" | "monthly"
    description: v.string(),
    currentAmount: v.number(),
    targetAmount: v.number(),
    expReward: v.number(),
    otherReward: v.optional(v.string()),
    isCompleted: v.boolean(),
    refreshAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"]),

  // Active Modifiers (travel/chest/battle/quest)
  activeModifiers: defineTable({
    userId: v.id("users"),
    category: v.string(), // "travel" | "chest" | "battle" | "quest"
    modifierType: v.string(), // "step_speed" | "experience" | "drop_rate" | "gold"
    totalPercent: v.number(),
    sourceCount: v.number(),
    sources: v.array(v.object({
      name: v.string(),
      percent: v.number(),
      expiresAt: v.optional(v.number()),
      isPermanent: v.boolean(),
    })),
  })
    .index("by_userId", ["userId"]),

  // Server-side SMMO API credentials. Never return smmoApiKey to clients.
  apiKeys: defineTable({
    userId: v.id("users"),
    smmoApiKey: v.string(),
    smmoPlayerId: v.number(),
    lastValidated: v.number(),
  })
    .index("by_userId", ["userId"]),

  // Profession status
  professionStatus: defineTable({
    userId: v.id("users"),
    professionName: v.string(),
    professionLevel: v.number(),
    isWorking: v.boolean(),
    finishesAt: v.optional(v.number()),
    expReward: v.optional(v.number()),
    profPointReward: v.optional(v.number()),
    goldReward: v.optional(v.number()),
  })
    .index("by_userId", ["userId"]),

  // App settings
  appSettings: defineTable({
    userId: v.id("users"),
    apiKey: v.optional(v.string()),
    guildId: v.optional(v.number()),
    autoRefreshInterval: v.number(),
    notificationsEnabled: v.boolean(),
    theme: v.string(),
  })
    .index("by_userId", ["userId"]),
});

export default schema;
