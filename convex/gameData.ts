import { mutation, query } from "./_generated/server";
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
      apiKey: v.optional(v.string()),
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
    return await ctx.db
      .query("appSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const updateSettings = mutation({
  args: {
    apiKey: v.optional(v.string()),
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
      if (args.apiKey !== undefined) update.apiKey = args.apiKey;
      if (args.guildId !== undefined) update.guildId = args.guildId;
      if (args.autoRefreshInterval !== undefined) update.autoRefreshInterval = args.autoRefreshInterval;
      if (args.notificationsEnabled !== undefined) update.notificationsEnabled = args.notificationsEnabled;
      await ctx.db.patch(existing._id, update);
    } else {
      await ctx.db.insert("appSettings", {
        userId,
        apiKey: args.apiKey,
        guildId: args.guildId,
        autoRefreshInterval: args.autoRefreshInterval ?? 60,
        notificationsEnabled: args.notificationsEnabled ?? true,
        theme: "dark",
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
      // If has all new fields including bank, skip
      if (existing.bank !== undefined && existing.spAtkDamage !== undefined) {
        return null;
      }
      // Stale data — clear everything and re-seed below
      const tables = [
        "playerData", "playerSkills", "equipment", "templeBoost", "guildInfo", "guildMembers",
        "guildContribution", "guildTask", "guildSanctuary", "guildWars", "pvpTargets", "buffs",
        "worldBosses", "diamondMarket", "orphanage", "appSettings",
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
      guildName: "The Deers",
      safeMode: false,
      // V2 fields
      energy: 500,
      maxEnergy: 500,
      questPoints: 250,
      maxQuestPoints: 250,
      availableStatPoints: 0,
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
      name: "The Deers",
      tag: "DEER",
      ownerId: 112045,
      exp: 4582100,
      currentSeasonExp: 891250,
      legacyExp: 22950,
      memberCount: 42,
      eligibleForWar: true,
      icon: "S_Holy03.png",
    });

    // ── Guild Members ──
    const members = [
      { memberId: 112045, memberName: "DeerKing", position: "Leader", level: 31200, safeMode: false, currentHp: 210000, maxHp: 210000, warrior: true, steps: 45200, npcKills: 67000, pvpKills: 49200, lastActivity: now - 300000 },
      { memberId: 1143782, memberName: "The Guy", position: "Member", level: 29727, safeMode: false, currentHp: 148710, maxHp: 148710, warrior: true, steps: 30845, npcKills: 30116, pvpKills: 29427, lastActivity: now - 60000 },
      { memberId: 234567, memberName: "ForestArcher", position: "Officer", level: 28450, safeMode: false, currentHp: 178000, maxHp: 185000, warrior: true, steps: 38500, npcKills: 51200, pvpKills: 34300, lastActivity: now - 1800000 },
      { memberId: 345678, memberName: "StoneGuard", position: "Member", level: 25100, safeMode: true, currentHp: 125000, maxHp: 125000, warrior: false, steps: 27000, npcKills: 28900, pvpKills: 3200, lastActivity: now - 7200000 },
      { memberId: 456789, memberName: "MoonlitBlade", position: "Officer", level: 30500, safeMode: false, currentHp: 45000, maxHp: 168000, warrior: true, steps: 39800, npcKills: 45600, pvpKills: 41800, lastActivity: now - 900000 },
      { memberId: 567890, memberName: "WildFawn", position: "Member", level: 22300, safeMode: false, currentHp: 98000, maxHp: 105000, warrior: false, steps: 18500, npcKills: 19800, pvpKills: 2100, lastActivity: now - 86400000 },
      { memberId: 678901, memberName: "AntlerSmash", position: "Member", level: 27800, safeMode: false, currentHp: 152000, maxHp: 152000, warrior: true, steps: 34000, npcKills: 38100, pvpKills: 29800, lastActivity: now - 420000 },
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
        currentValue: 32500000, targetValue: 50000000, percentage: 65, isActive: false, inProgress: true,
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
        effects: ["+35% Rarity Rate (Travel)", "+10% EXP (Travel)", "+5% Rarity Rate (Chest)"],
        currentValue: 245000000, targetValue: 350000000, percentage: 70, isActive: false, inProgress: true,
      },
      {
        tierKey: "tier_2", tierName: "Tier 2",
        effects: ["+50% Rarity Rate (Travel)", "+15% EXP (Travel)", "+15% Rarity Rate (Chest)"],
        currentValue: 0, targetValue: 500000000, percentage: 0, isActive: false, inProgress: false,
      },
    ];
    for (const tier of orphanageTiers) {
      await ctx.db.insert("orphanage", { userId, ...tier });
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

// Clear all data for a user (useful for re-seeding)
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
