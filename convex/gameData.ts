import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ── Player Data ──

export const getPlayerData = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("playerData"),
      _creationTime: v.number(),
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
      energy: v.optional(v.number()),
      maxEnergy: v.optional(v.number()),
      questPoints: v.optional(v.number()),
      maxQuestPoints: v.optional(v.number()),
      availableStatPoints: v.optional(v.number()),
      membership: v.optional(v.number()),
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
      strRank: v.optional(v.string()),
      defRank: v.optional(v.string()),
      dexRank: v.optional(v.string()),
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
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("playerData")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

// ── Player Skills ──

export const getPlayerSkills = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("playerSkills"),
      _creationTime: v.number(),
      userId: v.id("users"),
      skill: v.string(),
      level: v.number(),
      exp: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("playerSkills")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ── Equipment ──

export const getEquipment = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("equipment"),
      _creationTime: v.number(),
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
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("equipment")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ── Temple Boost ──

export const getTempleBoost = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("templeBoost"),
      _creationTime: v.number(),
      userId: v.id("users"),
      godName: v.string(),
      godTitle: v.string(),
      bonus: v.string(),
      activatedAt: v.number(),
      expiresAt: v.number(),
      worshipsUsedToday: v.number(),
      maxWorshipsPerDay: v.number(),
      worshipResetAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("templeBoost")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

// ── Guild Info ──

export const getGuildInfo = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("guildInfo"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("guildInfo")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

// ── Guild Members ──

export const getGuildMembers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("guildMembers"),
      _creationTime: v.number(),
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
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("guildMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ── Guild Task ──

export const getGuildTask = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("guildTask"),
      _creationTime: v.number(),
      userId: v.id("users"),
      taskType: v.string(),
      currentAmount: v.number(),
      targetAmount: v.number(),
      expReward: v.number(),
      powerPointReward: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("guildTask")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

// ── Guild Sanctuary ──

export const getGuildSanctuary = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("guildSanctuary"),
      _creationTime: v.number(),
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
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("guildSanctuary")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ── Guild Wars ──

export const getGuildWars = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("guildWars"),
      _creationTime: v.number(),
      userId: v.id("users"),
      enemyGuildId: v.number(),
      enemyGuildName: v.string(),
      ourScore: v.number(),
      enemyScore: v.number(),
      status: v.optional(v.string()),
      isBlacklisted: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("guildWars")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const toggleGuildBlacklist = mutation({
  args: { warId: v.id("guildWars") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const war = await ctx.db.get(args.warId);
    if (!war || war.userId !== userId) return null;
    await ctx.db.patch(args.warId, { isBlacklisted: !war.isBlacklisted });
    return null;
  },
});

// ── PvP Targets ──

export const getPvpTargets = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("pvpTargets"),
      _creationTime: v.number(),
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
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("pvpTargets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const skipTarget = mutation({
  args: { targetId: v.id("pvpTargets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const target = await ctx.db.get(args.targetId);
    if (!target || target.userId !== userId) return null;
    await ctx.db.patch(args.targetId, { isSkipped: true });
    return null;
  },
});

// ── Buffs ──

export const getBuffs = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("buffs"),
      _creationTime: v.number(),
      userId: v.id("users"),
      buffName: v.string(),
      buffType: v.string(),
      expiresAt: v.number(),
      bonusPercent: v.optional(v.number()),
      iconEmoji: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("buffs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ── World Bosses ──

export const getWorldBosses = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("worldBosses"),
      _creationTime: v.number(),
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
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("worldBosses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ── Diamond Market ──

export const getDiamondMarket = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("diamondMarket"),
      _creationTime: v.number(),
      userId: v.id("users"),
      sellerId: v.number(),
      sellerName: v.string(),
      diamondAmount: v.number(),
      diamondsRemaining: v.number(),
      pricePerDiamond: v.number(),
      lastUpdated: v.string(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("diamondMarket")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ── Orphanage ──

export const getOrphanage = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("orphanage"),
      _creationTime: v.number(),
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
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("orphanage")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ── Settings ──

export const getSettings = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("appSettings"),
      _creationTime: v.number(),
      userId: v.id("users"),
      guildId: v.optional(v.number()),
      autoRefreshInterval: v.number(),
      notificationsEnabled: v.boolean(),
      theme: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const settings = await ctx.db
      .query("appSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!settings) return null;

    return {
      _id: settings._id,
      _creationTime: settings._creationTime,
      userId: settings.userId,
      guildId: settings.guildId,
      autoRefreshInterval: settings.autoRefreshInterval,
      notificationsEnabled: settings.notificationsEnabled,
      theme: settings.theme,
    };
  },
});

export const updateSettings = mutation({
  args: {
    guildId: v.optional(v.number()),
    autoRefreshInterval: v.optional(v.number()),
    notificationsEnabled: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const existing = await ctx.db
      .query("appSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      const update: Record<string, unknown> = {};
      if (args.guildId !== undefined) update.guildId = args.guildId;
      if (args.autoRefreshInterval !== undefined) update.autoRefreshInterval = args.autoRefreshInterval;
      if (args.notificationsEnabled !== undefined) update.notificationsEnabled = args.notificationsEnabled;
      await ctx.db.patch(existing._id, update);
    } else {
      await ctx.db.insert("appSettings", {
        userId,
        guildId: args.guildId,
        autoRefreshInterval: args.autoRefreshInterval ?? 60,
        notificationsEnabled: args.notificationsEnabled ?? true,
        theme: "dark",
      });
    }
    return null;
  },
});

export const getApiKeyStatus = query({
  args: {},
  returns: v.object({
    hasApiKey: v.boolean(),
    smmoPlayerId: v.optional(v.number()),
    lastValidated: v.optional(v.number()),
    lastSync: v.optional(v.number()),
    playerName: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { hasApiKey: false };

    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
    if (!apiKey) return { hasApiKey: false };

    const player = await ctx.db
      .query("playerData")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
    const playerMatchesKey = player?.playerId === apiKey.smmoPlayerId;

    return {
      hasApiKey: true,
      smmoPlayerId: apiKey.smmoPlayerId,
      lastValidated: apiKey.lastValidated,
      lastSync: playerMatchesKey ? player.lastUpdated : undefined,
      playerName: playerMatchesKey ? player.playerName : undefined,
    };
  },
});

export const getSmmoApiKeyInternal = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      smmoApiKey: v.string(),
      smmoPlayerId: v.number(),
      lastValidated: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .unique();
    if (!apiKey) return null;

    return {
      smmoApiKey: apiKey.smmoApiKey,
      smmoPlayerId: apiKey.smmoPlayerId,
      lastValidated: apiKey.lastValidated,
    };
  },
});

export const saveSmmoApiKeyInternal = internalMutation({
  args: {
    userId: v.id("users"),
    smmoApiKey: v.string(),
    smmoPlayerId: v.number(),
    lastValidated: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        smmoApiKey: args.smmoApiKey,
        smmoPlayerId: args.smmoPlayerId,
        lastValidated: args.lastValidated,
      });
      return null;
    }

    await ctx.db.insert("apiKeys", args);
    return null;
  },
});

export const touchSmmoApiKeyInternal = internalMutation({
  args: {
    userId: v.id("users"),
    lastValidated: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        lastValidated: args.lastValidated,
      });
    }
    return null;
  },
});

// ── Guild Contribution ──

export const getGuildContribution = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("guildContribution"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("guildContribution")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

// ── Seed Demo Data (matches real "The Guy" character stats from screenshots) ──

export const seedDemoData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Check if data already exists — if missing new fields, clear and re-seed
    const existing = await ctx.db
      .query("playerData")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      // Check if new tables are seeded
      const hasVault = await ctx.db.query("vaultCodes").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
      const hasCollection = await ctx.db.query("collectionProgress").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
      const hasWatchlist = await ctx.db.query("playerWatchlist").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
      // If has all fields and all new tables, skip
      const hasTasks = await ctx.db.query("tasks").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
      const hasModifiers = await ctx.db.query("activeModifiers").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
      const hasProfession = await ctx.db.query("professionStatus").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
      // If has all fields and all tables, skip
      if (existing.bank !== undefined && existing.spAtkDamage !== undefined && existing.safeMode === true && hasVault && hasCollection && hasWatchlist && hasTasks && hasModifiers && hasProfession) {
        return null;
      }
      // Stale data — clear everything and re-seed below
      const tables = [
        "playerData", "playerSkills", "equipment", "templeBoost", "guildInfo", "guildMembers",
        "guildContribution", "guildTask", "guildSanctuary", "guildWars", "pvpTargets", "buffs",
        "worldBosses", "diamondMarket", "orphanage", "appSettings",
        "marketTracking", "personalItems", "pvpAssistantQueue", "pvpBlacklist", "aiAdvisorMessages",
        "vaultCodes", "collectionProgress", "playerWatchlist", "tasks", "activeModifiers", "professionStatus",
      ] as const;
      for (const table of tables) {
        const docs = await ctx.db
          .query(table)
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
        }
      }
    }

    const now = Date.now();

    // ── Player Data (Real "The Guy" stats from screenshots) ──
    await ctx.db.insert("playerData", {
      userId,
      playerId: 1143782,
      playerName: "The Guy",
      level: 29727,
      hp: 148710,
      maxHp: 148710,
      exp: 22093106258,
      expToNextLevel: 22093106329,
      gold: 10000,
      bank: 689500000,
      diamonds: 1200,
      steps: 30845,
      npcKills: 30116,
      pvpKills: 29427,
      pvpDeaths: 1203,
      questsComplete: 108,
      questsPerformed: 64911,
      tasksCompleted: 945,
      bossKills: 19,
      marketTrades: 26486,
      p2pTrades: 173,
      reputation: 47,
      bountiesCompleted: 1,
      dailiesUnlocked: 186,
      chestsOpened: 12143,
      guildId: 1337,
      guildName: "Eternal Gladiators",
      safeMode: true,
      // V2 fields
      energy: 500,
      maxEnergy: 500,
      questPoints: 250,
      maxQuestPoints: 250,
      availableStatPoints: 112,
      membership: 1,
      // Stat breakdown — real values from Profile Stats screenshot
      // STR: 52,400 total. Most from gear (+29,550 from equipment) + core base
      coreStr: 18800,
      coreDef: 5,
      coreDex: 950,
      equipStr: 29550,
      equipDef: 22700,
      equipDex: 0,
      bonusStr: 4050,
      bonusDef: 0,
      bonusDex: 6000,
      totalStr: 52400,
      totalDef: 5,
      totalDex: 6950,
      spAtkDamage: 107,
      strRank: "Top 0.57%",
      defRank: "Top 84.08%",
      dexRank: "Top 1.2%",
      title: "Guardian of Simpletopia",
      playerClass: "Warrior",
      joinDate: "28 Feb 2024",
      totalExp: 22093106329,
      awards: 54,
      avatarsUnlocked: 31,
      professionTime: "26d 11h 34m",
      forumPosts: 0,
      locationId: 5,
      locationName: "Simpletopia",
      lastUpdated: now,
    });

    // ── Player Skills (7 real skills from Profile Stats screenshot) ──
    const skills = [
      { skill: "woodcutting", level: 25, exp: 18200 },
      { skill: "fishing", level: 29, exp: 24500 },
      { skill: "treasure_hunting", level: 124, exp: 892100 },
      { skill: "mining", level: 59, exp: 67300 },
      { skill: "crafting", level: 53, exp: 54800 },
      { skill: "event_gathering", level: 18, exp: 9400 },
      { skill: "knight", level: 5, exp: 1200 },
    ];
    for (const s of skills) {
      await ctx.db.insert("playerSkills", { userId, ...s });
    }

    // ── Equipment (14 real slots from Equipment screenshot) ──
    const equipmentData = [
      { slot: "helmet", itemName: "Manifestation of Mortem", rarity: "celestial", defBonus: 550, critPercent: 20 },
      { slot: "amulet", itemName: "Damaged Archdemon Amulet (Str)", rarity: "legendary", strBonus: 4050, critPercent: 3 },
      { slot: "armour", itemName: "Emeris", rarity: "celestial", defBonus: 8000, strBonus: 3500, critPercent: 15 },
      { slot: "weapon", itemName: "The Stick", rarity: "legendary", strBonus: 12500, defBonus: 2000, critPercent: 30 },
      { slot: "shield", itemName: "Dragon King Shield", rarity: "legendary", defBonus: 4700, critPercent: 9.5 },
      { slot: "greaves", itemName: "Purple Witch Greaves", rarity: "legendary", defBonus: 3700, strBonus: 950, critPercent: 2.5 },
      { slot: "gauntlet", itemName: "Wraithclaw", rarity: "legendary", defBonus: 2500, strBonus: 1500 },
      { slot: "boots", itemName: "Graviton Boots", rarity: "legendary", defBonus: 3250, strBonus: 1500, critPercent: 1 },
      { slot: "pet", itemName: "Dwayne Johnson", rarity: "legendary", strBonus: 4100, defBonus: 2650, critPercent: 0.5 },
      { slot: "special", itemName: "Lovely Licky Larry the First", rarity: "legendary", strBonus: 3300, defBonus: 2600, critPercent: 0.5 },
      { slot: "wood_axe", itemName: "Honeycomb Axe", rarity: "rare" },
      { slot: "fishing_rod", itemName: "Honeycomb Harpoon", rarity: "rare" },
      { slot: "pickaxe", itemName: "Honeycomb Pickaxe (Untradable)", rarity: "rare" },
      { slot: "shovel", itemName: "Honeycomb Shovel", rarity: "rare" },
    ];
    for (const eq of equipmentData) {
      await ctx.db.insert("equipment", {
        userId,
        slot: eq.slot,
        itemName: eq.itemName,
        rarity: eq.rarity,
        strBonus: eq.strBonus,
        defBonus: eq.defBonus,
        critPercent: eq.critPercent,
      });
    }

    // ── Temple Boost (Mortem active — matches Temple screenshot) ──
    await ctx.db.insert("templeBoost", {
      userId,
      godName: "Mortem",
      godTitle: "The God of Death",
      bonus: "+20% Strength",
      activatedAt: now - 1200000, // 20 min ago
      expiresAt: now + 2400000, // 40 min left
      worshipsUsedToday: 2,
      maxWorshipsPerDay: 2,
      worshipResetAt: now + 76377000, // ~21h
    });

    // ── Guild Info ──
    await ctx.db.insert("guildInfo", {
      userId,
      guildId: 1337,
      name: "Eternal Gladiators",
      tag: "EG",
      ownerId: 112045,
      exp: 4582100,
      currentSeasonExp: 891250,
      legacyExp: 22950,
      memberCount: 50,
      eligibleForWar: true,
      icon: "S_Holy03.png",
    });

    // ── Guild Members ──
    const members = [
      { memberId: 112045, memberName: "DeerKing", position: "Leader", level: 31200, safeMode: true, currentHp: 210000, maxHp: 210000, warrior: true, steps: 45200, npcKills: 67000, pvpKills: 49200, lastActivity: now - 300000 },
      { memberId: 1143782, memberName: "The Guy", position: "Member", level: 29727, safeMode: true, currentHp: 148710, maxHp: 148710, warrior: true, steps: 30845, npcKills: 30116, pvpKills: 29427, lastActivity: now - 60000 },
      { memberId: 234567, memberName: "ForestArcher", position: "Officer", level: 28450, safeMode: true, currentHp: 178000, maxHp: 185000, warrior: true, steps: 38500, npcKills: 51200, pvpKills: 34300, lastActivity: now - 1800000 },
      { memberId: 345678, memberName: "StoneGuard", position: "Member", level: 25100, safeMode: true, currentHp: 125000, maxHp: 125000, warrior: false, steps: 27000, npcKills: 28900, pvpKills: 3200, lastActivity: now - 7200000 },
      { memberId: 456789, memberName: "MoonlitBlade", position: "Officer", level: 30500, safeMode: true, currentHp: 45000, maxHp: 168000, warrior: true, steps: 39800, npcKills: 45600, pvpKills: 41800, lastActivity: now - 900000 },
      { memberId: 567890, memberName: "WildFawn", position: "Member", level: 22300, safeMode: true, currentHp: 98000, maxHp: 105000, warrior: false, steps: 18500, npcKills: 19800, pvpKills: 2100, lastActivity: now - 86400000 },
      { memberId: 678901, memberName: "AntlerSmash", position: "Member", level: 27800, safeMode: true, currentHp: 152000, maxHp: 152000, warrior: true, steps: 34000, npcKills: 38100, pvpKills: 29800, lastActivity: now - 420000 },
    ];
    for (const m of members) {
      await ctx.db.insert("guildMembers", { userId, ...m });
    }

    // ── Guild Contribution ──
    await ctx.db.insert("guildContribution", {
      userId,
      memberId: 1143782,
      goldDeposited: 45000000,
      powerPointsDeposited: 890,
      pveKills: 30116,
      pveExp: 1580000,
      pvpKills: 29427,
      pvpExp: 2350000,
      taxGuildBank: 12000000,
      taxSanctuary: 8000000,
    });

    // ── Guild Task ──
    await ctx.db.insert("guildTask", {
      userId,
      taskType: "travel",
      currentAmount: 18450,
      targetAmount: 30000,
      expReward: 75000,
      powerPointReward: 10,
    });

    // ── Guild Sanctuary ──
    const sanctuaryTiers = [
      {
        tierKey: "tier_1", tierName: "Tier 1",
        effects: ["+15% Raid EXP (Guild)", "+5% PvP EXP (Guild)", "+25% Gather EXP (Guild)"],
        currentValue: 25000000, targetValue: 25000000, percentage: 100, isActive: true, inProgress: false,
      },
      {
        tierKey: "tier_2", tierName: "Tier 2",
        effects: ["+25% Raid EXP (Guild)", "+10% PvP EXP (Guild)", "+35% Gather EXP (Guild)"],
        currentValue: 27351000, targetValue: 50000000, percentage: 55, isActive: false, inProgress: true,
      },
      {
        tierKey: "tier_3", tierName: "Tier 3",
        effects: ["+45% Raid EXP (Guild)", "+15% PvP EXP (Guild)", "+45% Gather EXP (Guild)"],
        currentValue: 0, targetValue: 75000000, percentage: 0, isActive: false, inProgress: false,
      },
    ];
    for (const tier of sanctuaryTiers) {
      await ctx.db.insert("guildSanctuary", { userId, ...tier });
    }

    // ── Guild Wars ──
    const warsData = [
      { enemyGuildId: 2045, enemyGuildName: "Touhou", ourScore: 1289, enemyScore: 987, status: "ongoing", isBlacklisted: false },
      { enemyGuildId: 3891, enemyGuildName: "Dark Knights", ourScore: 2341, enemyScore: 1876, status: "ongoing", isBlacklisted: false },
      { enemyGuildId: 1456, enemyGuildName: "Phoenix Rising", ourScore: 892, enemyScore: 1034, status: "ongoing", isBlacklisted: false },
      { enemyGuildId: 5672, enemyGuildName: "The Pacifists", ourScore: 456, enemyScore: 123, status: "hold", isBlacklisted: true },
      { enemyGuildId: 7834, enemyGuildName: "Shadow Realm", ourScore: 3421, enemyScore: 3398, status: "ongoing", isBlacklisted: false },
      { enemyGuildId: 9201, enemyGuildName: "Cult of Cthulhu", ourScore: 1567, enemyScore: 1890, status: "ongoing", isBlacklisted: false },
      { enemyGuildId: 4510, enemyGuildName: "Space Pirates", ourScore: 789, enemyScore: 654, status: "hold", isBlacklisted: false },
    ];
    for (const war of warsData) {
      await ctx.db.insert("guildWars", { userId, ...war });
    }

    // ── PvP Targets (with safeMode flags for filtering) ──
    const targetsData = [
      { targetPlayerId: 12045, targetName: "xDarkLordx", targetLevel: 28500, targetHpPercent: 72, targetGuildId: 2045, targetGuildName: "Touhou", targetGold: 45000, targetSafeMode: false, isSkipped: false },
      { targetPlayerId: 23891, targetName: "NightBlade99", targetLevel: 30100, targetHpPercent: 100, targetGuildId: 3891, targetGuildName: "Dark Knights", targetGold: 82000, targetSafeMode: false, isSkipped: false },
      { targetPlayerId: 34567, targetName: "CrystalMage", targetLevel: 26800, targetHpPercent: 45, targetGuildId: 2045, targetGuildName: "Touhou", targetGold: 21000, targetSafeMode: false, isSkipped: false },
      { targetPlayerId: 45678, targetName: "IronFist_VII", targetLevel: 29200, targetHpPercent: 88, targetGuildId: 7834, targetGuildName: "Shadow Realm", targetGold: 67000, targetSafeMode: false, isSkipped: false },
      { targetPlayerId: 56789, targetName: "QueenBee", targetLevel: 27600, targetHpPercent: 15, targetGuildId: 9201, targetGuildName: "Cult of Cthulhu", targetGold: 9500, targetSafeMode: true, isSkipped: false },
      { targetPlayerId: 67890, targetName: "StormRider", targetLevel: 29800, targetHpPercent: 63, targetGuildId: 3891, targetGuildName: "Dark Knights", targetGold: 54000, targetSafeMode: false, isSkipped: false },
      { targetPlayerId: 78901, targetName: "PixelKnight", targetLevel: 25200, targetHpPercent: 91, targetGuildId: 4510, targetGuildName: "Space Pirates", targetGold: 32000, targetSafeMode: false, isSkipped: false },
      { targetPlayerId: 89012, targetName: "MoonWalker", targetLevel: 31000, targetHpPercent: 34, targetGuildId: 7834, targetGuildName: "Shadow Realm", targetGold: 110000, targetSafeMode: false, isSkipped: false },
    ];
    for (const target of targetsData) {
      await ctx.db.insert("pvpTargets", { userId, ...target });
    }

    // ── Buffs ──
    const buffsData = [
      { buffName: "Mortem's Blessing", buffType: "worship", expiresAt: now + 2400000, bonusPercent: 20, iconEmoji: "💀" },
      { buffName: "Sprint Boost", buffType: "sprint", expiresAt: now + 1800000, bonusPercent: 25, iconEmoji: "🏃" },
      { buffName: "Vault Bonus: Travel EXP", buffType: "vault", expiresAt: now + 7200000, bonusPercent: 15, iconEmoji: "🔐" },
      { buffName: "Vault Bonus: Battle EXP", buffType: "vault", expiresAt: now + 7200000, bonusPercent: 15, iconEmoji: "⚔️" },
    ];
    for (const buff of buffsData) {
      await ctx.db.insert("buffs", { userId, ...buff });
    }

    // ── World Bosses ──
    const bosses = [
      { bossId: 130, name: "One Above All", level: 396, isGod: false, str: 160, def: 511, dex: 247, currentHp: 2841000, maxHp: 3828797, enableTime: Math.floor(now / 1000) - 3600 },
      { bossId: 134, name: "Bees", level: 951, isGod: false, str: 817, def: 967, dex: 698, currentHp: 8458320, maxHp: 8458320, enableTime: Math.floor(now / 1000) - 1200 },
      { bossId: 142, name: "The Leviathan", level: 1200, isGod: true, str: 1450, def: 1890, dex: 1120, currentHp: 15200000, maxHp: 22000000, enableTime: Math.floor(now / 1000) - 7200 },
      { bossId: 156, name: "Frost Wyrm", level: 680, isGod: false, str: 540, def: 720, dex: 410, currentHp: 890000, maxHp: 5600000, enableTime: Math.floor(now / 1000) - 14400 },
    ];
    for (const boss of bosses) {
      await ctx.db.insert("worldBosses", { userId, ...boss });
    }

    // ── Diamond Market ──
    const diamonds = [
      { sellerId: 329952, sellerName: "Tounuo-Senpai", diamondAmount: 280, diamondsRemaining: 280, pricePerDiamond: 17857143, lastUpdated: "2026-05-15T12:00:00Z" },
      { sellerId: 204889, sellerName: "BK-201", diamondAmount: 10, diamondsRemaining: 10, pricePerDiamond: 201201201, lastUpdated: "2026-05-15T10:30:00Z" },
      { sellerId: 510234, sellerName: "DiamondDealer", diamondAmount: 500, diamondsRemaining: 342, pricePerDiamond: 15000000, lastUpdated: "2026-05-15T08:45:00Z" },
      { sellerId: 782103, sellerName: "GoldRush99", diamondAmount: 50, diamondsRemaining: 50, pricePerDiamond: 22500000, lastUpdated: "2026-05-14T23:15:00Z" },
    ];
    for (const d of diamonds) {
      await ctx.db.insert("diamondMarket", { userId, ...d });
    }

    // ── Orphanage ──
    const orphanageTiers = [
      {
        tierKey: "tier_1", tierName: "Tier 1",
        effects: ["+35% Rarity Rate (Travel)", "+10% EXP (Travel)", "+10% Rarity Rate (Chest)"],
        currentValue: 350000000, targetValue: 350000000, percentage: 100, isActive: true, inProgress: false,
      },
      {
        tierKey: "tier_2", tierName: "Tier 2",
        effects: ["+50% Rarity Rate (Travel)", "+15% EXP (Travel)", "+15% Rarity Rate (Chest)", "+2% Gold (Travel)"],
        currentValue: 500000000, targetValue: 500000000, percentage: 100, isActive: true, inProgress: false,
      },
      {
        tierKey: "tier_3", tierName: "Tier 3",
        effects: ["+80% Rarity Rate (Travel)", "+30% EXP (Travel)", "+30% Rarity Rate (Chest)", "+5% Gold (Travel)"],
        currentValue: 200000000, targetValue: 1000000000, percentage: 20, isActive: false, inProgress: true,
      },
    ];
    for (const tier of orphanageTiers) {
      await ctx.db.insert("orphanage", { userId, ...tier });
    }

    // ── Market Tracking (Watchlist items) ──
    const marketItems = [
      {
        itemId: 48201, itemName: "The Stick", rarity: "legendary", type: "weapon",
        currentLow: 450000000, currentHigh: 680000000, lastPrice: 520000000,
        priceHistory: [
          { price: 490000000, timestamp: now - 86400000 * 7 },
          { price: 510000000, timestamp: now - 86400000 * 5 },
          { price: 480000000, timestamp: now - 86400000 * 3 },
          { price: 520000000, timestamp: now - 86400000 },
        ],
        circulation: 23, notes: "My main weapon — tracking for guild mates", alertBelow: 400000000,
      },
      {
        itemId: 51034, itemName: "Emeris", rarity: "celestial", type: "armour",
        currentLow: 1200000000, currentHigh: 1800000000, lastPrice: 1450000000,
        priceHistory: [
          { price: 1100000000, timestamp: now - 86400000 * 14 },
          { price: 1350000000, timestamp: now - 86400000 * 7 },
          { price: 1450000000, timestamp: now - 86400000 },
        ],
        circulation: 8, notes: "Best armour in game, extremely rare",
      },
      {
        itemId: 39882, itemName: "Damaged Archdemon Amulet (Str)", rarity: "legendary", type: "amulet",
        currentLow: 180000000, currentHigh: 320000000, lastPrice: 245000000,
        priceHistory: [
          { price: 200000000, timestamp: now - 86400000 * 10 },
          { price: 230000000, timestamp: now - 86400000 * 5 },
          { price: 245000000, timestamp: now - 86400000 },
        ],
        circulation: 47, alertBelow: 150000000,
      },
      {
        itemId: 62110, itemName: "Graviton Boots", rarity: "legendary", type: "boots",
        currentLow: 95000000, currentHigh: 150000000, lastPrice: 110000000,
        priceHistory: [
          { price: 120000000, timestamp: now - 86400000 * 6 },
          { price: 105000000, timestamp: now - 86400000 * 3 },
          { price: 110000000, timestamp: now - 86400000 },
        ],
        circulation: 31,
      },
      {
        itemId: 77450, itemName: "Dragon King Shield", rarity: "legendary", type: "shield",
        currentLow: 220000000, currentHigh: 380000000, lastPrice: 290000000,
        priceHistory: [
          { price: 310000000, timestamp: now - 86400000 * 8 },
          { price: 275000000, timestamp: now - 86400000 * 4 },
          { price: 290000000, timestamp: now - 86400000 },
        ],
        circulation: 15, notes: "Price dipping — good buy window",
      },
    ];
    for (const item of marketItems) {
      await ctx.db.insert("marketTracking", {
        userId, itemId: item.itemId, itemName: item.itemName,
        rarity: item.rarity, type: item.type,
        currentLow: item.currentLow, currentHigh: item.currentHigh,
        lastPrice: item.lastPrice, priceHistory: item.priceHistory,
        circulation: item.circulation, notes: item.notes,
        alertBelow: item.alertBelow,
        addedAt: now - 86400000 * 14, lastChecked: now - 300000,
      });
    }

    // ── Personal Items (inventory, storage, showcase, custom) ──
    const personalItemsData = [
      { itemId: 48201, itemName: "The Stick", category: "inventory", rarity: "legendary", quantity: 1, value: 520000000, isFavorite: true },
      { itemId: 51034, itemName: "Emeris", category: "inventory", rarity: "celestial", quantity: 1, value: 1450000000, isFavorite: true },
      { itemId: 39882, itemName: "Damaged Archdemon Amulet (Str)", category: "inventory", rarity: "legendary", quantity: 1, value: 245000000, isFavorite: false },
      { itemId: 88201, itemName: "Gold Ore", category: "storage", rarity: "common", quantity: 847, value: 5000, isFavorite: false },
      { itemId: 88305, itemName: "Diamond Ore", category: "storage", rarity: "rare", quantity: 23, value: 125000, isFavorite: false },
      { itemId: 88450, itemName: "Celestial Fragment", category: "storage", rarity: "celestial", quantity: 3, value: 50000000, isFavorite: true },
      { itemId: 90100, itemName: "Simpletopia Badge", category: "showcase", rarity: "legendary", quantity: 1, value: 0, isFavorite: true, notes: "Guardian of Simpletopia title proof" },
      { itemId: 90205, itemName: "Deer Antler Trophy", category: "showcase", rarity: "elite", quantity: 1, value: 0, isFavorite: true, notes: "The Deers guild war champion" },
      { itemId: 90310, itemName: "First Kill Medal", category: "showcase", rarity: "rare", quantity: 1, value: 0, isFavorite: false },
      { itemName: "Mortem Avatar (Dark)", category: "avatar", rarity: "legendary", quantity: 1, isFavorite: true, notes: "Death god theme" },
      { itemName: "Crystal Deer Avatar", category: "avatar", rarity: "elite", quantity: 1, isFavorite: false, notes: "Guild exclusive" },
      { itemName: "Honeycomb Set (Full)", category: "custom", rarity: "rare", quantity: 4, notes: "Axe + Harpoon + Pickaxe + Shovel", isFavorite: false },
      { itemName: "War Trophies Collection", category: "custom", rarity: "legendary", quantity: 12, notes: "Drops from guild war victories", isFavorite: true },
    ];
    for (const pi of personalItemsData) {
      await ctx.db.insert("personalItems", {
        userId,
        itemId: pi.itemId,
        itemName: pi.itemName,
        category: pi.category,
        rarity: pi.rarity,
        quantity: pi.quantity,
        value: pi.value,
        notes: pi.notes,
        acquiredAt: now - Math.floor(Math.random() * 86400000 * 30),
        isFavorite: pi.isFavorite,
      });
    }

    // ── PvP Assistant Queue ──
    const pvpQueueData = [
      { targetPlayerId: 12045, targetName: "xDarkLordx", targetLevel: 28500, targetStr: 48200, targetDef: 3200, targetDex: 5800, targetHp: 98000, targetMaxHp: 136000, targetGuildId: 2045, targetGuildName: "Touhou", targetGold: 45000, targetSafeMode: false, status: "queued", priority: 1, allyKills: 3, enemyKills: 7, attempts: 0 },
      { targetPlayerId: 23891, targetName: "NightBlade99", targetLevel: 30100, targetStr: 55100, targetDef: 4100, targetDex: 7200, targetHp: 145000, targetMaxHp: 145000, targetGuildId: 3891, targetGuildName: "Dark Knights", targetGold: 82000, targetSafeMode: false, status: "queued", priority: 1, allyKills: 1, enemyKills: 12, attempts: 0 },
      { targetPlayerId: 34567, targetName: "CrystalMage", targetLevel: 26800, targetStr: 41500, targetDef: 2100, targetDex: 4500, targetHp: 52000, targetMaxHp: 118000, targetGuildId: 2045, targetGuildName: "Touhou", targetGold: 21000, targetSafeMode: false, status: "queued", priority: 2, allyKills: 5, enemyKills: 2, attempts: 0 },
      { targetPlayerId: 45678, targetName: "IronFist_VII", targetLevel: 29200, targetStr: 51300, targetDef: 3800, targetDex: 6300, targetHp: 128000, targetMaxHp: 142000, targetGuildId: 7834, targetGuildName: "Shadow Realm", targetGold: 67000, targetSafeMode: false, status: "queued", priority: 2, allyKills: 0, enemyKills: 4, attempts: 0 },
      { targetPlayerId: 67890, targetName: "StormRider", targetLevel: 29800, targetStr: 49800, targetDef: 3600, targetDex: 6100, targetHp: 91000, targetMaxHp: 140000, targetGuildId: 3891, targetGuildName: "Dark Knights", targetGold: 54000, targetSafeMode: false, status: "queued", priority: 2, allyKills: 2, enemyKills: 8, attempts: 0 },
      { targetPlayerId: 89012, targetName: "MoonWalker", targetLevel: 31000, targetStr: 57200, targetDef: 4500, targetDex: 7800, targetHp: 48000, targetMaxHp: 155000, targetGuildId: 7834, targetGuildName: "Shadow Realm", targetGold: 110000, targetSafeMode: false, status: "queued", priority: 1, allyKills: 0, enemyKills: 15, attempts: 0 },
      { targetPlayerId: 56789, targetName: "QueenBee", targetLevel: 27600, targetStr: 44000, targetDef: 2800, targetDex: 5100, targetHp: 18000, targetMaxHp: 122000, targetGuildId: 9201, targetGuildName: "Cult of Cthulhu", targetGold: 9500, targetSafeMode: true, status: "skipped", priority: 3, allyKills: 0, enemyKills: 1, attempts: 1 },
      { targetPlayerId: 78901, targetName: "PixelKnight", targetLevel: 25200, targetStr: 38700, targetDef: 1900, targetDex: 3800, targetHp: 105000, targetMaxHp: 105000, targetGuildId: 4510, targetGuildName: "Space Pirates", targetGold: 32000, targetSafeMode: false, status: "completed", priority: 3, allyKills: 6, enemyKills: 0, attempts: 2 },
    ];
    for (const t of pvpQueueData) {
      await ctx.db.insert("pvpAssistantQueue", {
        userId, ...t, addedAt: now - Math.floor(Math.random() * 3600000),
      });
    }

    // ── PvP Blacklist ──
    const blacklistData = [
      { targetPlayerId: 99001, targetName: "TrollMaster420", reason: "Retaliates with alt accounts" },
      { targetPlayerId: 99002, targetName: "AFK_Farmer", reason: "Not worth the gold — always broke" },
    ];
    for (const bl of blacklistData) {
      await ctx.db.insert("pvpBlacklist", { userId, ...bl, addedAt: now - 86400000 * 5 });
    }

    // ── AI Advisor Messages (sample conversation) ──
    const advisorMsgs = [
      { role: "system", content: "SMMO Strategic Advisor initialized. Analyzing The Guy's profile — Lv.29,727 Warrior with 52,400 STR.", category: "general", timestamp: now - 3600000 },
      { role: "user", content: "Should I invest more into DEX or keep pumping STR? I'm at 52.4K STR and 6.9K DEX.", category: "build", timestamp: now - 3500000 },
      { role: "assistant", content: "With your current build (52.4K STR, Top 0.57%), you're already a top-tier damage dealer. Your DEX at 6,950 gives solid dodge chance. I'd recommend:\n\n**Short term:** Keep STR focus — you're close to top 0.5% breakpoint.\n**Medium term:** Once you hit 55K STR, start splitting 60/40 STR/DEX.\n**DEF note:** Your 5 DEF is a glass cannon build. Consider at least 500 DEF to avoid getting one-shot by high-DEX opponents.\n\nYour spATK +107% is excellent — Mortem worship + Stick combo is meta.", category: "build", timestamp: now - 3400000 },
    ];
    for (const msg of advisorMsgs) {
      await ctx.db.insert("aiAdvisorMessages", { userId, ...msg });
    }

    // ── Vault Codes (Simple Wolf sourced) ──
    const vaultCodesData = [
      { code: "SIMPLEWOLF2026", source: "simple_wolf", reward: "500,000 Gold", rewardType: "gold", isRedeemed: true, addedAt: now - 86400000 * 20, redeemedAt: now - 86400000 * 19, notes: "Monthly code from Simple Wolf" },
      { code: "DEERPOWER", source: "simple_wolf", reward: "+10% STR Buff (2h)", rewardType: "buff", isRedeemed: true, addedAt: now - 86400000 * 14, redeemedAt: now - 86400000 * 13 },
      { code: "MORTEMRISES", source: "simple_wolf", reward: "5 Diamonds", rewardType: "diamond", isRedeemed: false, addedAt: now - 86400000 * 3, expiresAt: now + 86400000 * 4, notes: "Expires soon!" },
      { code: "TREASUREHUNT50", source: "community", reward: "Rare Treasure Map", rewardType: "item", isRedeemed: false, addedAt: now - 86400000 * 1 },
      { code: "SPRING2026EVENT", source: "simple_wolf", reward: "Spring Event Box", rewardType: "item", isRedeemed: false, addedAt: now - 3600000, expiresAt: now + 86400000 * 7, notes: "Limited time spring event" },
      { code: "GUILDWAR500", source: "community", reward: "500,000 Gold", rewardType: "gold", isRedeemed: true, addedAt: now - 86400000 * 30, redeemedAt: now - 86400000 * 29 },
      { code: "NEWADVENTURE", source: "simple_wolf", reward: "1,000,000 EXP", rewardType: "exp", isRedeemed: false, addedAt: now - 86400000 * 2, expiresAt: now + 86400000 * 5 },
    ];
    for (const vc of vaultCodesData) {
      await ctx.db.insert("vaultCodes", { userId, ...vc });
    }

    // ── Collection Progress ──
    const collectionData = [
      // Avatars
      { category: "avatar", itemName: "Default Avatar", isOwned: true, rarity: "common", source: "quest", obtainedAt: now - 86400000 * 300 },
      { category: "avatar", itemName: "Mortem Avatar (Dark)", isOwned: true, rarity: "legendary", source: "boss", obtainedAt: now - 86400000 * 45, notes: "Death god theme" },
      { category: "avatar", itemName: "Crystal Deer Avatar", isOwned: true, rarity: "elite", source: "event", obtainedAt: now - 86400000 * 60, notes: "Guild exclusive" },
      { category: "avatar", itemName: "Golden Warrior Avatar", isOwned: true, rarity: "legendary", source: "shop", obtainedAt: now - 86400000 * 90 },
      { category: "avatar", itemName: "Celestial Knight Avatar", isOwned: false, rarity: "celestial", source: "boss", notes: "Drops from The Leviathan" },
      { category: "avatar", itemName: "Shadow Assassin Avatar", isOwned: false, rarity: "legendary", source: "craft" },
      { category: "avatar", itemName: "Spring Bloom Avatar", isOwned: true, rarity: "rare", source: "event", obtainedAt: now - 86400000 * 15 },
      { category: "avatar", itemName: "Fire Lord Avatar", isOwned: false, rarity: "legendary", source: "boss", notes: "Frost Wyrm drop" },
      { category: "avatar", itemName: "Pixel Art Avatar", isOwned: true, rarity: "common", source: "shop", obtainedAt: now - 86400000 * 120 },
      { category: "avatar", itemName: "Anniversary 2025 Avatar", isOwned: true, rarity: "elite", source: "event", obtainedAt: now - 86400000 * 200 },
      // Backgrounds
      { category: "background", itemName: "Simpletopia Sunset", isOwned: true, rarity: "rare", source: "quest", obtainedAt: now - 86400000 * 150 },
      { category: "background", itemName: "Dark Forest", isOwned: true, rarity: "elite", source: "shop", obtainedAt: now - 86400000 * 100 },
      { category: "background", itemName: "Celestial Void", isOwned: false, rarity: "celestial", source: "boss" },
      { category: "background", itemName: "Guild War Arena", isOwned: true, rarity: "legendary", source: "event", obtainedAt: now - 86400000 * 30 },
      { category: "background", itemName: "Ocean Depths", isOwned: false, rarity: "rare", source: "quest" },
      // Titles
      { category: "title", itemName: "Guardian of Simpletopia", isOwned: true, rarity: "legendary", source: "quest", obtainedAt: now - 86400000 * 80, notes: "Current title" },
      { category: "title", itemName: "War Veteran", isOwned: true, rarity: "elite", source: "event", obtainedAt: now - 86400000 * 40 },
      { category: "title", itemName: "Dragon Slayer", isOwned: false, rarity: "legendary", source: "boss" },
      { category: "title", itemName: "Market Mogul", isOwned: false, rarity: "elite", source: "trade", notes: "Need 50K market trades" },
      { category: "title", itemName: "The Unstoppable", isOwned: false, rarity: "celestial", source: "quest", notes: "100K PvP kills required" },
      // Badges
      { category: "badge", itemName: "First Blood", isOwned: true, rarity: "common", source: "quest", obtainedAt: now - 86400000 * 280 },
      { category: "badge", itemName: "10K PvP Kills", isOwned: true, rarity: "rare", source: "quest", obtainedAt: now - 86400000 * 100 },
      { category: "badge", itemName: "25K PvP Kills", isOwned: true, rarity: "elite", source: "quest", obtainedAt: now - 86400000 * 20 },
      { category: "badge", itemName: "50K PvP Kills", isOwned: false, rarity: "legendary", source: "quest", notes: "29,427 / 50,000" },
      { category: "badge", itemName: "Boss Hunter", isOwned: true, rarity: "rare", source: "boss", obtainedAt: now - 86400000 * 50 },
      { category: "badge", itemName: "Guild Champion", isOwned: true, rarity: "legendary", source: "event", obtainedAt: now - 86400000 * 10 },
    ];
    for (const c of collectionData) {
      await ctx.db.insert("collectionProgress", { userId, ...c });
    }

    // ── Tasks (DAILY/WEEKLY/MONTHLY from video) ──
    const tasksData = [
      // Daily tasks
      { taskType: "daily", description: "Defeat 50 NPCs", currentAmount: 12, targetAmount: 50, expReward: 125000, isCompleted: false },
      { taskType: "daily", description: "Win 15 PvP battles", currentAmount: 15, targetAmount: 15, expReward: 200000, otherReward: "1x Bronze Key", isCompleted: true },
      { taskType: "daily", description: "Take 500 steps", currentAmount: 234, targetAmount: 500, expReward: 80000, isCompleted: false },
      { taskType: "daily", description: "Complete 10 quests", currentAmount: 3, targetAmount: 10, expReward: 150000, isCompleted: false },
      { taskType: "daily", description: "Gather 20 materials", currentAmount: 8, targetAmount: 20, expReward: 95000, isCompleted: false },
      { taskType: "daily", description: "Craft 5 items", currentAmount: 0, targetAmount: 5, expReward: 110000, isCompleted: false },
      { taskType: "daily", description: "Earn 100,000 gold", currentAmount: 45000, targetAmount: 100000, expReward: 75000, isCompleted: false },
      // Weekly tasks
      { taskType: "weekly", description: "Kill 200 players in PvP", currentAmount: 147, targetAmount: 200, expReward: 890000, otherReward: "1x Gold Key", isCompleted: false, refreshAt: now + 5 * 86400000 },
      { taskType: "weekly", description: "Complete 70 quests", currentAmount: 42, targetAmount: 70, expReward: 750000, otherReward: "1x Gold Key", isCompleted: false, refreshAt: now + 5 * 86400000 },
      { taskType: "weekly", description: "Take 3,500 steps", currentAmount: 1890, targetAmount: 3500, expReward: 600000, isCompleted: false, refreshAt: now + 5 * 86400000 },
      { taskType: "weekly", description: "Gather 150 materials", currentAmount: 67, targetAmount: 150, expReward: 500000, isCompleted: false, refreshAt: now + 5 * 86400000 },
      // Monthly tasks (from video: Kill 395 PvP ✅, Gather 675, Quests 740, Craft 145)
      { taskType: "monthly", description: "Kill 395 players in PvP", currentAmount: 395, targetAmount: 395, expReward: 2080960, otherReward: "2x Gold Keys", isCompleted: true, refreshAt: now + 12 * 86400000 },
      { taskType: "monthly", description: "Gather 675 materials while travelling", currentAmount: 7, targetAmount: 675, expReward: 2080960, otherReward: "2x Gold Keys", isCompleted: false, refreshAt: now + 12 * 86400000 },
      { taskType: "monthly", description: "Successfully perform 740 quests", currentAmount: 168, targetAmount: 740, expReward: 2080960, otherReward: "2x Gold Keys", isCompleted: false, refreshAt: now + 12 * 86400000 },
      { taskType: "monthly", description: "Craft 145 items", currentAmount: 16, targetAmount: 145, expReward: 2080960, otherReward: "2x Gold Keys", isCompleted: false, refreshAt: now + 12 * 86400000 },
    ];
    for (const t of tasksData) {
      await ctx.db.insert("tasks", { userId, ...t });
    }

    // ── Active Modifiers (from video Active Modifiers screen) ──
    const modifiersData = [
      // Travel modifiers
      { category: "travel", modifierType: "step_speed", totalPercent: 5, sourceCount: 1, sources: [
        { name: "Orphanage", percent: 5, isPermanent: false },
      ]},
      { category: "travel", modifierType: "experience", totalPercent: 20, sourceCount: 2, sources: [
        { name: "Potion", percent: 5, expiresAt: now + 158000, isPermanent: false },
        { name: "Temple", percent: 15, expiresAt: now + 3578000, isPermanent: false },
      ]},
      { category: "travel", modifierType: "drop_rate", totalPercent: 5, sourceCount: 1, sources: [
        { name: "Orphanage", percent: 5, isPermanent: false },
      ]},
      // Chest modifiers
      { category: "chest", modifierType: "drop_rate", totalPercent: 5, sourceCount: 1, sources: [
        { name: "Orphanage", percent: 5, isPermanent: false },
      ]},
      // Battle modifiers
      { category: "battle", modifierType: "experience", totalPercent: 15, sourceCount: 1, sources: [
        { name: "Temple", percent: 15, expiresAt: now + 3578000, isPermanent: false },
      ]},
      // Quest modifiers
      { category: "quest", modifierType: "experience", totalPercent: 10, sourceCount: 1, sources: [
        { name: "Sanctuary", percent: 10, isPermanent: false },
      ]},
    ];
    for (const m of modifiersData) {
      await ctx.db.insert("activeModifiers", { userId, ...m });
    }

    // ── Profession Status (Warrior from video) ──
    await ctx.db.insert("professionStatus", {
      userId,
      professionName: "Warrior",
      professionLevel: 409,
      isWorking: true,
      finishesAt: now + 2398000, // ~40 min
      expReward: 23938,
      profPointReward: 238,
      goldReward: 100,
    });

    // ── Player Watchlist ──
    const watchlistData = [
      { watchedPlayerId: 112045, watchedPlayerName: "DeerKing", watchedPlayerLevel: 31200, watchedPlayerGuildName: "The Deers", watchedPlayerStr: 58900, watchedPlayerDef: 4200, watchedPlayerDex: 7500, watchedPlayerHp: 210000, watchedPlayerMaxHp: 210000, watchedPlayerGold: 250000, watchedPlayerSafeMode: false, watchedPlayerLastActivity: now - 300000, tag: "friend", notes: "Guild leader — coordinate war targets", addedAt: now - 86400000 * 60, lastChecked: now - 600000 },
      { watchedPlayerId: 456789, watchedPlayerName: "MoonlitBlade", watchedPlayerLevel: 30500, watchedPlayerGuildName: "The Deers", watchedPlayerStr: 54200, watchedPlayerDef: 3900, watchedPlayerDex: 6800, watchedPlayerHp: 45000, watchedPlayerMaxHp: 168000, watchedPlayerGold: 89000, watchedPlayerSafeMode: false, watchedPlayerLastActivity: now - 900000, tag: "friend", notes: "Low HP — might need backup in war", addedAt: now - 86400000 * 30, lastChecked: now - 1800000 },
      { watchedPlayerId: 23891, watchedPlayerName: "NightBlade99", watchedPlayerLevel: 30100, watchedPlayerGuildName: "Dark Knights", watchedPlayerStr: 55100, watchedPlayerDef: 4100, watchedPlayerDex: 7200, watchedPlayerHp: 145000, watchedPlayerMaxHp: 145000, watchedPlayerGold: 82000, watchedPlayerSafeMode: false, watchedPlayerLastActivity: now - 7200000, tag: "enemy", notes: "Top DK player — focus in wars", addedAt: now - 86400000 * 14, lastChecked: now - 3600000 },
      { watchedPlayerId: 89012, watchedPlayerName: "MoonWalker", watchedPlayerLevel: 31000, watchedPlayerGuildName: "Shadow Realm", watchedPlayerStr: 57200, watchedPlayerDef: 4500, watchedPlayerDex: 7800, watchedPlayerHp: 48000, watchedPlayerMaxHp: 155000, watchedPlayerGold: 110000, watchedPlayerSafeMode: false, watchedPlayerLastActivity: now - 14400000, tag: "enemy", notes: "High STR but low HP — easy target when weakened", addedAt: now - 86400000 * 7, lastChecked: now - 7200000 },
      { watchedPlayerId: 510234, watchedPlayerName: "DiamondDealer", watchedPlayerLevel: 22100, watchedPlayerGuildName: undefined, watchedPlayerStr: 28500, watchedPlayerDef: 1800, watchedPlayerDex: 3200, watchedPlayerHp: 95000, watchedPlayerMaxHp: 95000, watchedPlayerGold: 5000000, watchedPlayerSafeMode: true, watchedPlayerLastActivity: now - 43200000, tag: "trader", notes: "Best diamond prices — check daily", addedAt: now - 86400000 * 10, lastChecked: now - 43200000 },
      { watchedPlayerId: 67890, watchedPlayerName: "StormRider", watchedPlayerLevel: 29800, watchedPlayerGuildName: "Dark Knights", watchedPlayerStr: 49800, watchedPlayerDef: 3600, watchedPlayerDex: 6100, watchedPlayerHp: 91000, watchedPlayerMaxHp: 140000, watchedPlayerGold: 54000, watchedPlayerSafeMode: false, watchedPlayerLastActivity: now - 5400000, tag: "enemy", notes: "Second most kills on DK side", addedAt: now - 86400000 * 14, lastChecked: now - 5400000 },
    ];
    for (const w of watchlistData) {
      await ctx.db.insert("playerWatchlist", { userId, ...w });
    }

    // ── Settings ──
    await ctx.db.insert("appSettings", {
      userId,
      autoRefreshInterval: 60,
      notificationsEnabled: true,
      theme: "dark",
    });

    return null;
  },
});

// ── Market Tracking ──

export const getMarketTracking = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("marketTracking"),
      _creationTime: v.number(),
      userId: v.id("users"),
      itemId: v.number(),
      itemName: v.string(),
      rarity: v.optional(v.string()),
      type: v.optional(v.string()),
      currentLow: v.optional(v.number()),
      currentHigh: v.optional(v.number()),
      lastPrice: v.optional(v.number()),
      priceHistory: v.optional(v.array(v.object({ price: v.number(), timestamp: v.number() }))),
      circulation: v.optional(v.number()),
      notes: v.optional(v.string()),
      alertBelow: v.optional(v.number()),
      addedAt: v.number(),
      lastChecked: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("marketTracking")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addMarketItem = mutation({
  args: {
    itemId: v.number(),
    itemName: v.string(),
    rarity: v.optional(v.string()),
    type: v.optional(v.string()),
    notes: v.optional(v.string()),
    alertBelow: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const now = Date.now();
    await ctx.db.insert("marketTracking", {
      userId,
      itemId: args.itemId,
      itemName: args.itemName,
      rarity: args.rarity,
      type: args.type,
      notes: args.notes,
      alertBelow: args.alertBelow,
      addedAt: now,
      lastChecked: now,
    });
    return null;
  },
});

export const removeMarketItem = mutation({
  args: { trackingId: v.id("marketTracking") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const item = await ctx.db.get(args.trackingId);
    if (!item || item.userId !== userId) return null;
    await ctx.db.delete(args.trackingId);
    return null;
  },
});

export const updateMarketNotes = mutation({
  args: { trackingId: v.id("marketTracking"), notes: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const item = await ctx.db.get(args.trackingId);
    if (!item || item.userId !== userId) return null;
    await ctx.db.patch(args.trackingId, { notes: args.notes });
    return null;
  },
});

// ── Personal Items ──

export const getPersonalItems = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("personalItems"),
      _creationTime: v.number(),
      userId: v.id("users"),
      itemId: v.optional(v.number()),
      itemName: v.string(),
      category: v.string(),
      rarity: v.optional(v.string()),
      quantity: v.number(),
      value: v.optional(v.number()),
      imageUrl: v.optional(v.string()),
      notes: v.optional(v.string()),
      acquiredAt: v.optional(v.number()),
      isFavorite: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("personalItems")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addPersonalItem = mutation({
  args: {
    itemId: v.optional(v.number()),
    itemName: v.string(),
    category: v.string(),
    rarity: v.optional(v.string()),
    quantity: v.number(),
    value: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    await ctx.db.insert("personalItems", {
      userId,
      itemId: args.itemId,
      itemName: args.itemName,
      category: args.category,
      rarity: args.rarity,
      quantity: args.quantity,
      value: args.value,
      notes: args.notes,
      acquiredAt: Date.now(),
      isFavorite: false,
    });
    return null;
  },
});

export const removePersonalItem = mutation({
  args: { itemId: v.id("personalItems") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) return null;
    await ctx.db.delete(args.itemId);
    return null;
  },
});

export const toggleFavoriteItem = mutation({
  args: { itemId: v.id("personalItems") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) return null;
    await ctx.db.patch(args.itemId, { isFavorite: !item.isFavorite });
    return null;
  },
});

// ── PvP Assistant Queue ──

export const getPvpAssistantQueue = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("pvpAssistantQueue"),
      _creationTime: v.number(),
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
      status: v.string(),
      priority: v.number(),
      allyKills: v.optional(v.number()),
      enemyKills: v.optional(v.number()),
      addedAt: v.number(),
      lastAttempt: v.optional(v.number()),
      attempts: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("pvpAssistantQueue")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const updatePvpTargetStatus = mutation({
  args: { targetId: v.id("pvpAssistantQueue"), status: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const target = await ctx.db.get(args.targetId);
    if (!target || target.userId !== userId) return null;
    const update: Record<string, unknown> = { status: args.status };
    if (args.status === "attacking") {
      update.lastAttempt = Date.now();
      update.attempts = target.attempts + 1;
    }
    await ctx.db.patch(args.targetId, update);
    return null;
  },
});

export const getPvpBlacklist = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("pvpBlacklist"),
      _creationTime: v.number(),
      userId: v.id("users"),
      targetPlayerId: v.number(),
      targetName: v.string(),
      reason: v.optional(v.string()),
      addedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("pvpBlacklist")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addToPvpBlacklist = mutation({
  args: { targetId: v.id("pvpAssistantQueue"), reason: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const target = await ctx.db.get(args.targetId);
    if (!target || target.userId !== userId) return null;
    await ctx.db.insert("pvpBlacklist", {
      userId,
      targetPlayerId: target.targetPlayerId,
      targetName: target.targetName,
      reason: args.reason,
      addedAt: Date.now(),
    });
    await ctx.db.patch(args.targetId, { status: "skipped" });
    return null;
  },
});

export const removeFromPvpBlacklist = mutation({
  args: { blacklistId: v.id("pvpBlacklist") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const entry = await ctx.db.get(args.blacklistId);
    if (!entry || entry.userId !== userId) return null;
    await ctx.db.delete(args.blacklistId);
    return null;
  },
});

// ── AI Advisor ──

export const getAiAdvisorMessages = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("aiAdvisorMessages"),
      _creationTime: v.number(),
      userId: v.id("users"),
      role: v.string(),
      content: v.string(),
      category: v.optional(v.string()),
      timestamp: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("aiAdvisorMessages")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addAiAdvisorMessage = mutation({
  args: {
    role: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    await ctx.db.insert("aiAdvisorMessages", {
      userId,
      role: args.role,
      content: args.content,
      category: args.category,
      timestamp: Date.now(),
    });
    return null;
  },
});

export const clearAiAdvisorMessages = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const msgs = await ctx.db
      .query("aiAdvisorMessages")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const msg of msgs) {
      await ctx.db.delete(msg._id);
    }
    return null;
  },
});

// Clear all data for a user (useful for re-seeding)
// ── Vault Codes ──

export const getVaultCodes = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("vaultCodes"),
      _creationTime: v.number(),
      userId: v.id("users"),
      code: v.string(),
      source: v.string(),
      reward: v.optional(v.string()),
      rewardType: v.optional(v.string()),
      isRedeemed: v.boolean(),
      expiresAt: v.optional(v.number()),
      addedAt: v.number(),
      redeemedAt: v.optional(v.number()),
      notes: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query("vaultCodes").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
  },
});

export const addVaultCode = mutation({
  args: { code: v.string(), source: v.string(), reward: v.optional(v.string()), rewardType: v.optional(v.string()), expiresAt: v.optional(v.number()), notes: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    await ctx.db.insert("vaultCodes", { userId, ...args, isRedeemed: false, addedAt: Date.now() });
    return null;
  },
});

export const toggleVaultRedeemed = mutation({
  args: { codeId: v.id("vaultCodes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const code = await ctx.db.get(args.codeId);
    if (!code || code.userId !== userId) return null;
    await ctx.db.patch(args.codeId, { isRedeemed: !code.isRedeemed, redeemedAt: !code.isRedeemed ? Date.now() : undefined });
    return null;
  },
});

export const removeVaultCode = mutation({
  args: { codeId: v.id("vaultCodes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const code = await ctx.db.get(args.codeId);
    if (code && code.userId === userId) await ctx.db.delete(args.codeId);
    return null;
  },
});

// ── Collection Progress ──

export const getCollectionProgress = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("collectionProgress"),
      _creationTime: v.number(),
      userId: v.id("users"),
      category: v.string(),
      itemName: v.string(),
      itemId: v.optional(v.number()),
      isOwned: v.boolean(),
      rarity: v.optional(v.string()),
      obtainedAt: v.optional(v.number()),
      source: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query("collectionProgress").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
  },
});

export const toggleCollectionOwned = mutation({
  args: { itemId: v.id("collectionProgress") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) return null;
    await ctx.db.patch(args.itemId, { isOwned: !item.isOwned, obtainedAt: !item.isOwned ? Date.now() : undefined });
    return null;
  },
});

// ── Player Watchlist ──

export const getPlayerWatchlist = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("playerWatchlist"),
      _creationTime: v.number(),
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
      tag: v.string(),
      notes: v.optional(v.string()),
      addedAt: v.number(),
      lastChecked: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query("playerWatchlist").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
  },
});

export const removeWatchlistPlayer = mutation({
  args: { entryId: v.id("playerWatchlist") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const entry = await ctx.db.get(args.entryId);
    if (entry && entry.userId === userId) await ctx.db.delete(args.entryId);
    return null;
  },
});

export const updateWatchlistNotes = mutation({
  args: { entryId: v.id("playerWatchlist"), notes: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const entry = await ctx.db.get(args.entryId);
    if (entry && entry.userId === userId) await ctx.db.patch(args.entryId, { notes: args.notes });
    return null;
  },
});


// ── Tasks ──

export const getTasks = query({
  args: {},
  returns: v.union(v.array(v.object({
    _id: v.id("tasks"),
    _creationTime: v.number(),
    userId: v.id("users"),
    taskType: v.string(),
    description: v.string(),
    currentAmount: v.number(),
    targetAmount: v.number(),
    expReward: v.number(),
    otherReward: v.optional(v.string()),
    isCompleted: v.boolean(),
    refreshAt: v.optional(v.number()),
  })), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.query("tasks").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
  },
});

// ── Active Modifiers ──

export const getActiveModifiers = query({
  args: {},
  returns: v.union(v.array(v.object({
    _id: v.id("activeModifiers"),
    _creationTime: v.number(),
    userId: v.id("users"),
    category: v.string(),
    modifierType: v.string(),
    totalPercent: v.number(),
    sourceCount: v.number(),
    sources: v.array(v.object({
      name: v.string(),
      percent: v.number(),
      expiresAt: v.optional(v.number()),
      isPermanent: v.boolean(),
    })),
  })), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.query("activeModifiers").withIndex("by_userId", (q) => q.eq("userId", userId)).collect();
  },
});

// ── Profession Status ──

export const getProfessionStatus = query({
  args: {},
  returns: v.union(v.object({
    _id: v.id("professionStatus"),
    _creationTime: v.number(),
    userId: v.id("users"),
    professionName: v.string(),
    professionLevel: v.number(),
    isWorking: v.boolean(),
    finishesAt: v.optional(v.number()),
    expReward: v.optional(v.number()),
    profPointReward: v.optional(v.number()),
    goldReward: v.optional(v.number()),
  }), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.query("professionStatus").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
  },
});

export const clearUserData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const tables = [
      "playerData", "playerSkills", "equipment", "templeBoost", "guildInfo", "guildMembers",
      "guildContribution", "guildTask", "guildSanctuary", "guildWars", "pvpTargets", "buffs",
      "worldBosses", "diamondMarket", "orphanage", "appSettings",
      "marketTracking", "personalItems", "pvpAssistantQueue", "pvpBlacklist", "aiAdvisorMessages",
      "vaultCodes", "collectionProgress", "playerWatchlist", "tasks", "activeModifiers", "professionStatus",
    ] as const;
    for (const table of tables) {
      const docs = await ctx.db
        .query(table)
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
    return null;
  },
});
