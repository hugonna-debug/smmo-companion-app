import { describe, expect, test } from "bun:test";
import {
  transformEquipmentItem,
  transformPlayerData,
  transformPlayerSkills,
} from "../convex/smmoTransforms";

describe("SMMO API transforms", () => {
  test("maps v1 and v2 player info into playerData fields", () => {
    const data = transformPlayerData(
      {
        id: 123,
        name: "Live Hero",
        level: 42,
        hp: 90,
        max_hp: 100,
        exp: 5000,
        gold: 123456,
        steps: 987,
        npc_kills: 44,
        user_kills: 12,
        quests_complete: 7,
        safeMode: 1,
        guild: { id: 55, name: "Wolves" },
        current_location: { id: 9, name: "Simpletopia" },
        tasks_completed: 3,
        boss_kills: 2,
        market_trades: 11,
        reputation: 5,
        bounties_completed: 1,
        dailies_unlocked: 4,
        chests_opened: 8,
      },
      {
        id: 123,
        name: "Live Hero",
        level: 42,
        currencies: { gold: 222222, diamonds: 13 },
        stats: {
          core: { str: 10, def: 20, dex: 30 },
          equipment: { str: 40, def: 50, dex: 60 },
          bonus: {
            fixed: { str: 1, def: 2, dex: 3 },
            percentage: { str: 4, def: 5, dex: 6 },
          },
          total: { str: 51, def: 72, dex: 93 },
        },
        current_health: 91,
        max_health: 101,
        current_energy: 14,
        max_energy: 20,
        current_quest_points: 6,
        max_quest_points: 10,
        available_stat_points: 99,
        safe_mode: false,
        membership: 1,
      },
      1_700_000_000_000,
    );

    expect(data).toEqual({
      playerId: 123,
      playerName: "Live Hero",
      level: 42,
      hp: 91,
      maxHp: 101,
      exp: 5000,
      expToNextLevel: 5000,
      gold: 222222,
      diamonds: 13,
      steps: 987,
      npcKills: 44,
      pvpKills: 12,
      pvpDeaths: 0,
      questsComplete: 7,
      tasksCompleted: 3,
      bossKills: 2,
      marketTrades: 11,
      reputation: 5,
      bountiesCompleted: 1,
      dailiesUnlocked: 4,
      chestsOpened: 8,
      guildId: 55,
      guildName: "Wolves",
      safeMode: false,
      energy: 14,
      maxEnergy: 20,
      questPoints: 6,
      maxQuestPoints: 10,
      availableStatPoints: 99,
      membership: 1,
      coreStr: 10,
      coreDef: 20,
      coreDex: 30,
      equipStr: 40,
      equipDef: 50,
      equipDex: 60,
      bonusStr: 1,
      bonusDef: 2,
      bonusDex: 3,
      totalStr: 51,
      totalDef: 72,
      totalDex: 93,
      locationId: 9,
      locationName: "Simpletopia",
      lastUpdated: 1_700_000_000_000,
    });
  });

  test("maps skill rows into playerSkills fields", () => {
    expect(
      transformPlayerSkills([
        { skill: "woodcutting", level: 3, exp: 192 },
        { skill: "fishing", level: 7, exp: 1200 },
      ]),
    ).toEqual([
      { skill: "woodcutting", level: 3, exp: 192 },
      { skill: "fishing", level: 7, exp: 1200 },
    ]);
  });

  test("normalizes equipment slots and extracts stat modifiers", () => {
    expect(
      transformEquipmentItem("12291", "Wood Axe", {
        id: 12291,
        name: "Honeycomb Axe",
        type: "Tool",
        rarity: "rare",
        level: 15,
        stat1: "str",
        stat1modifier: 125,
        stat2: "def",
        stat2modifier: 75,
        stat3: "crit",
        stat3modifier: 2.5,
      }),
    ).toEqual({
      slot: "wood_axe",
      itemId: 12291,
      itemName: "Tool Honeycomb Axe",
      rarity: "rare",
      strBonus: 125,
      defBonus: 75,
      critPercent: 2.5,
      level: 15,
    });
  });

  test("falls back to v1 fields and coerces numeric strings", () => {
    const data = transformPlayerData(
      {
        id: "456",
        name: "Fallback Hero",
        level: "8",
        hp: "7",
        max_hp: "10",
        exp: "1234",
        exp_to_next_level: "2000",
        gold: "99",
        steps: "12",
        npc_kills: "3",
        user_kills: "4",
        pvp_deaths: "5",
        quests_complete: "6",
        safeMode: "true",
      },
      {},
      1_700_000_000_100,
    );

    expect(data).toMatchObject({
      playerId: 456,
      playerName: "Fallback Hero",
      level: 8,
      hp: 7,
      maxHp: 10,
      exp: 1234,
      expToNextLevel: 2000,
      gold: 99,
      pvpDeaths: 5,
      safeMode: true,
      lastUpdated: 1_700_000_000_100,
    });
  });

  test("filters unnamed skills and falls back to item_name", () => {
    expect(
      transformPlayerSkills([
        { skill: "", level: 99, exp: 999 },
        { skill: "mining", level: "12", exp: "345" },
      ]),
    ).toEqual([{ skill: "mining", level: 12, exp: 345 }]);

    expect(
      transformEquipmentItem(10, "Shield", {
        id: 10,
        item_name: "Guard Wall",
        rarity: "elite",
        stat1: "armour",
        stat1modifier: "44",
      }),
    ).toMatchObject({
      slot: "shield",
      itemName: "Guard Wall",
      rarity: "elite",
      defense: 44,
    });
  });
});
