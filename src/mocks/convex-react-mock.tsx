import type React from "react";
import { useEffect, useState } from "react";

// Local storage key for auth status
const AUTH_KEY = "smmo_preview_logged_in";

// In-memory data store for queries so they persist updates across mutations during the preview session!
const createInitialData = () => {
  return {
    playerData: {
      userId: "test-user-id",
      name: "Test Agent",
      level: 125,
      gold: 4850392,
      totalStr: 450,
      totalDef: 380,
      totalDex: 420,
      totalHp: 1800,
      maxHp: 1800,
      safeMode: false,
      guildId: 104,
      guildName: "DeepMind Legends",
    },
    pvpAssistantQueue: [
      {
        _id: "queue_1",
        userId: "test-user-id",
        targetPlayerId: 98765,
        targetName: "GoldHoarder_99",
        targetLevel: 110,
        targetStr: 390,
        targetDef: 310,
        targetDex: 350,
        targetHp: 850,
        targetMaxHp: 1500,
        targetGuildId: 50,
        targetGuildName: "Gold Digger Guild",
        targetGold: 1250000,
        targetSafeMode: false,
        status: "queued",
        priority: 1,
        addedAt: Date.now() - 3600000,
        attempts: 0,
      },
      {
        _id: "queue_2",
        userId: "test-user-id",
        targetPlayerId: 12345,
        targetName: "SafePlayer_X",
        targetLevel: 130,
        targetStr: 480,
        targetDef: 420,
        targetDex: 410,
        targetHp: 2000,
        targetMaxHp: 2000,
        targetGuildName: "Peacemakers",
        targetGold: 500000,
        targetSafeMode: true,
        status: "queued",
        priority: 2,
        addedAt: Date.now() - 1800000,
        attempts: 1,
      },
      {
        _id: "queue_3",
        userId: "test-user-id",
        targetPlayerId: 54321,
        targetName: "EasyPrey_Smmo",
        targetLevel: 95,
        targetStr: 220,
        targetDef: 200,
        targetDex: 250,
        targetHp: 300,
        targetMaxHp: 1000,
        targetGold: 950000,
        targetSafeMode: false,
        status: "queued",
        priority: 3,
        addedAt: Date.now() - 600000,
        attempts: 0,
      },
    ],
    pvpBlacklist: [
      {
        _id: "blacklist_1",
        userId: "test-user-id",
        targetPlayerId: 88888,
        targetName: "ToxicGamer_PvP",
        reason: "Too high defense, keeps dodging",
        addedAt: Date.now() - 7200000,
      },
    ],
    aiAdvisorMessages: [
      {
        _id: "msg_1",
        userId: "test-user-id",
        role: "assistant",
        content:
          "Hello! I am your SMMO AI Advisor. I can analyze your stats, suggest the best targets in your PvP assistant queue, or help you maximize your trading profit in the market. Ask me anything!",
        category: "general",
        timestamp: Date.now() - 60000,
      },
    ],
    personalItems: [
      {
        _id: "item_1",
        userId: "test-user-id",
        itemId: 4001,
        itemName: "Aegis Shield of Antigravity",
        category: "inventory",
        rarity: "Epic",
        quantity: 1,
        value: 1200000,
        imageUrl: "https://simplemmo.com/assets/items/shield.png",
        isFavorite: true,
      },
      {
        _id: "item_2",
        userId: "test-user-id",
        itemId: 4002,
        itemName: "Godly Elixir of Experience",
        category: "storage",
        rarity: "Legendary",
        quantity: 5,
        value: 2500000,
        imageUrl: "https://simplemmo.com/assets/items/elixir.png",
        isFavorite: false,
      },
    ],
    vaultCodes: [
      {
        _id: "code_1",
        userId: "test-user-id",
        code: "WOLF2026",
        source: "simple_wolf",
        reward: "50,000 Gold + 2 EXP",
        rewardType: "gold",
        isRedeemed: false,
        addedAt: Date.now() - 3600000,
      },
    ],
    collectionProgress: [],
    playerWatchlist: [
      {
        _id: "watch_1",
        userId: "test-user-id",
        watchedPlayerId: 77777,
        watchedPlayerName: "LuckyTrader",
        watchedPlayerLevel: 140,
        tag: "trader",
        notes: "Sells cheap keys at 9 AM",
        addedAt: Date.now(),
        lastChecked: Date.now(),
      },
    ],
    tasks: [
      {
        _id: "task_1",
        userId: "test-user-id",
        taskType: "daily",
        description: "Defeat 5 PvP targets using the Assistant",
        currentAmount: 2,
        targetAmount: 5,
        expReward: 1500,
        isCompleted: false,
      },
    ],
    activeModifiers: [
      {
        _id: "mod_1",
        userId: "test-user-id",
        category: "travel",
        modifierType: "step_speed",
        totalPercent: 15,
        sourceCount: 1,
        sources: [
          { name: "SMMO Supporter Badge", percent: 15, isPermanent: true },
        ],
      },
    ],
  };
};

// Global preview state store
let previewData = createInitialData();

export const resetPreviewData = () => {
  previewData = createInitialData();
};

const getPath = (apiFunction: any): string => {
  if (!apiFunction) return "";
  if (typeof apiFunction === "string") return apiFunction;
  const functionNameSymbol = Symbol.for("functionName");
  try {
    if (typeof apiFunction === "object" && apiFunction !== null) {
      const val = apiFunction[functionNameSymbol];
      if (typeof val === "string") return val;
    }
  } catch (_e) {}
  try {
    if (typeof apiFunction.toString === "function") {
      const val = apiFunction.toString();
      if (typeof val === "string") return val;
    }
  } catch (_e) {}
  return "";
};

export class ConvexReactClient {}

export const ConvexProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export function useConvexAuth() {
  const [isAuth, setIsAuth] = useState(
    localStorage.getItem(AUTH_KEY) === "true",
  );

  useEffect(() => {
    const checkAuth = () => {
      setIsAuth(localStorage.getItem(AUTH_KEY) === "true");
    };
    window.addEventListener("storage", checkAuth);
    const interval = setInterval(checkAuth, 300);
    return () => {
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  }, []);

  return {
    isAuthenticated: isAuth,
    isLoading: false,
  };
}

export function useQuery(apiFunction: any, ..._args: any[]) {
  const [data, setData] = useState<any>(undefined);
  const [_tick, setTick] = useState(0);

  useEffect(() => {
    const handleQueryUpdate = () => {
      setTick(t => t + 1);
    };
    window.addEventListener("smmo_preview_update", handleQueryUpdate);
    return () => {
      window.removeEventListener("smmo_preview_update", handleQueryUpdate);
    };
  }, []);

  useEffect(() => {
    const path = getPath(apiFunction);

    if (path.includes("getPlayerData")) {
      setData(previewData.playerData);
    } else if (path.includes("getPvpAssistantQueue")) {
      setData(previewData.pvpAssistantQueue);
    } else if (path.includes("getPvpBlacklist")) {
      setData(previewData.pvpBlacklist);
    } else if (
      path.includes("getAiAdvisorMessages") ||
      path.includes("aiAdvisorMessages")
    ) {
      setData(previewData.aiAdvisorMessages);
    } else if (
      path.includes("getPersonalItems") ||
      path.includes("personalItems")
    ) {
      setData(previewData.personalItems);
    } else if (path.includes("getVaultCodes") || path.includes("vaultCodes")) {
      setData(previewData.vaultCodes);
    } else if (
      path.includes("getCollectionProgress") ||
      path.includes("collectionProgress")
    ) {
      setData(previewData.collectionProgress);
    } else if (
      path.includes("getPlayerWatchlist") ||
      path.includes("playerWatchlist")
    ) {
      setData(previewData.playerWatchlist);
    } else if (path.includes("getTasks") || path.includes("tasks")) {
      setData(previewData.tasks);
    } else if (
      path.includes("getActiveModifiers") ||
      path.includes("activeModifiers")
    ) {
      setData(previewData.activeModifiers);
    } else {
      setData([]);
    }
  }, [apiFunction]);

  return data;
}

export function useMutation(apiFunction: any) {
  const path = getPath(apiFunction);

  return async (args: any) => {
    if (path.includes("updatePvpTargetStatus")) {
      const { targetPlayerId, status } = args;
      previewData.pvpAssistantQueue = previewData.pvpAssistantQueue.map(t => {
        if (t.targetPlayerId === targetPlayerId) {
          return {
            ...t,
            status,
            attempts: t.attempts + 1,
            lastAttempt: Date.now(),
          };
        }
        return t;
      });
    } else if (path.includes("addToPvpBlacklist")) {
      const { targetPlayerId, targetName, reason } = args;
      previewData.pvpBlacklist = [
        ...previewData.pvpBlacklist,
        {
          _id: `blacklist_${Date.now()}`,
          userId: "test-user-id",
          targetPlayerId,
          targetName,
          reason: reason || "Added in preview",
          addedAt: Date.now(),
        },
      ];
      previewData.pvpAssistantQueue = previewData.pvpAssistantQueue.filter(
        t => t.targetPlayerId !== targetPlayerId,
      );
    } else if (path.includes("removeFromPvpBlacklist")) {
      const { targetPlayerId } = args;
      previewData.pvpBlacklist = previewData.pvpBlacklist.filter(
        b => b.targetPlayerId !== targetPlayerId,
      );
    } else if (
      path.includes("addMessage") ||
      path.includes("sendAiAdvisorMessage")
    ) {
      const { content, role } = args;
      previewData.aiAdvisorMessages = [
        ...previewData.aiAdvisorMessages,
        {
          _id: `msg_${Date.now()}`,
          userId: "test-user-id",
          role: role || "user",
          content,
          timestamp: Date.now(),
        },
      ];
      if (role === "user") {
        setTimeout(() => {
          previewData.aiAdvisorMessages = [
            ...previewData.aiAdvisorMessages,
            {
              _id: `msg_${Date.now() + 1}`,
              userId: "test-user-id",
              role: "assistant",
              content: `This is a simulated preview response. SMMO Companion parsed your message: "${content}"`,
              timestamp: Date.now(),
            },
          ];
          window.dispatchEvent(new Event("smmo_preview_update"));
        }, 800);
      }
    }

    window.dispatchEvent(new Event("smmo_preview_update"));
    return { success: true };
  };
}

export function useAction(_apiFunction: any) {
  return async (_args: any) => {
    return { success: true };
  };
}
