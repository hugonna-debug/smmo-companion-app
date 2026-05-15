import { useMutation, useQuery } from "convex/react";
import {
  Heart,
  Sparkles,
  Coins,
  Footprints,
  Skull,
  Swords,
  ScrollText,
  RefreshCw,
  Gem,
  ChevronRight,
  Battery,
  Landmark,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  formatGold,
  formatNumber,
  formatTimeRemaining,
  SLOT_ICONS,
  SLOT_LABELS,
  SKILL_INFO,
} from "@/lib/gameUtils";

// XP needed per skill level (simplified scaling)
function skillXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level));
}

export function DashboardPage() {
  const player = useQuery(api.gameData.getPlayerData);
  const equipment = useQuery(api.gameData.getEquipment);
  const buffs = useQuery(api.gameData.getBuffs);
  const skills = useQuery(api.gameData.getPlayerSkills);
  const bosses = useQuery(api.gameData.getWorldBosses);
  const temple = useQuery(api.gameData.getTempleBoost);
  const diamondMarket = useQuery(api.gameData.getDiamondMarket);
  const seedDemo = useMutation(api.gameData.seedDemoData);
  const [seeding, setSeeding] = useState(false);

  // Auto-seed demo data if none exists or if stale data or new tables missing
  const vaultCodes = useQuery(api.gameData.getVaultCodes);
  const isStale = player !== null && player !== undefined && player.bank === undefined;
  const needsReseed = vaultCodes !== undefined && vaultCodes.length === 0 && player !== null && player !== undefined;
  useEffect(() => {
    if ((player === null || isStale || needsReseed) && !seeding) {
      setSeeding(true);
      seedDemo().then(() => setSeeding(false));
    }
  }, [player, isStale, needsReseed, seedDemo, seeding]);

  if (player === undefined || equipment === undefined || buffs === undefined || skills === undefined) {
    return <LoadingSkeleton />;
  }

  if (player === null) {
    return (
      <div className="p-4 flex flex-col items-center justify-center gap-3 min-h-[50vh]">
        <RefreshCw className="size-6 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading game data...</p>
      </div>
    );
  }

  const hpPercent = Math.round((player.hp / player.maxHp) * 100);
  const expPercent = player.expToNextLevel > 0
    ? Math.round(((player.expToNextLevel - (player.expToNextLevel - player.exp)) / player.expToNextLevel) * 100)
    : 100;
  const expRemaining = player.expToNextLevel - player.exp;
  const kdRatio = player.pvpDeaths > 0 ? (player.pvpKills / player.pvpDeaths).toFixed(2) : "∞";
  const energyPct = player.energy !== undefined && player.maxEnergy ? Math.round((player.energy / player.maxEnergy) * 100) : null;
  const qpPct = player.questPoints !== undefined && player.maxQuestPoints ? Math.round((player.questPoints / player.maxQuestPoints) * 100) : null;

  // Count low HP bosses for alert
  const lowBosses = (bosses ?? []).filter(b => (b.currentHp / b.maxHp) < 0.25);

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      {/* Player Header */}
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-xl">
          ⚔️
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gold truncate">{player.playerName}</h1>
            {player.safeMode && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/20 text-success font-medium">SAFE</span>
            )}
            {player.membership === 1 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rarity-celestial/15 text-rarity-celestial font-medium">VIP</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>Lv. {formatNumber(player.level)}</span>
            {player.playerClass && (
              <span className="text-chart-4">{player.playerClass}</span>
            )}
            {player.guildName && (
              <Link to="/guild" className="text-primary/80 hover:text-primary transition-colors">⚜ {player.guildName}</Link>
            )}
          </div>
          {player.title && (
            <p className="text-[10px] text-gold-dim italic">{player.title}</p>
          )}
        </div>
        <Button variant="outline" size="sm" className="text-[11px] h-7 px-2 border-border">
          <RefreshCw className="size-3" />
          Refresh
        </Button>
      </div>

      {/* HP, XP, Energy+QP Bars */}
      <div className="game-card space-y-2.5">
        {/* HP — RED bar like real SMMO */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Heart className="size-3.5 text-destructive" />
              <span className="text-[11px] font-medium">Health</span>
            </div>
            <span className="text-[11px] font-mono text-destructive">
              {formatNumber(player.hp)} / {formatNumber(player.maxHp)} ({hpPercent}%)
            </span>
          </div>
          <div className="stat-bar">
            <div className="stat-bar-fill bg-destructive" style={{ width: `${hpPercent}%` }} />
          </div>
        </div>

        {/* XP — GREEN bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-xp" />
              <span className="text-[11px] font-medium">Experience</span>
            </div>
            <span className="text-[11px] font-mono text-xp">
              {formatNumber(expRemaining)} EXP to next level
            </span>
          </div>
          <div className="stat-bar">
            <div className="stat-bar-fill bg-xp" style={{ width: `${expPercent}%` }} />
          </div>
        </div>

        {/* EP + QP side by side — YELLOW + BLUE like real SMMO */}
        {(energyPct !== null || qpPct !== null) && (
          <div className="grid grid-cols-2 gap-3">
            {energyPct !== null && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <Battery className="size-3 text-yellow-500" />
                    <span className="text-[10px] font-medium">EP</span>
                  </div>
                  <span className="text-[10px] font-mono text-yellow-500">
                    {player.energy}/{player.maxEnergy}
                  </span>
                </div>
                <div className="stat-bar">
                  <div className="stat-bar-fill bg-yellow-500" style={{ width: `${energyPct}%` }} />
                </div>
              </div>
            )}
            {qpPct !== null && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <ScrollText className="size-3 text-blue-500" />
                    <span className="text-[10px] font-medium">QP</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-500">
                    {formatNumber(player.questPoints!)}/{formatNumber(player.maxQuestPoints!)}
                  </span>
                </div>
                <div className="stat-bar">
                  <div className="stat-bar-fill bg-blue-500" style={{ width: `${qpPct}%` }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Currencies — 3 column like real SMMO */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={<Coins className="size-3.5 text-gold-accent" />} label="Gold" value={formatGold(player.gold)} />
        <StatCard icon={<Landmark className="size-3.5 text-gold-accent" />} label="Bank" value={formatGold(player.bank ?? 0)} />
        <StatCard icon={<Gem className="size-3.5 text-info" />} label="Diamonds" value={formatNumber(player.diamonds ?? 0)} />
      </div>

      {/* Statistics — 3 column like real SMMO */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={<Footprints className="size-3.5 text-chart-5" />} label="Steps" value={formatNumber(player.steps)} />
        <StatCard icon={<Swords className="size-3.5 text-chart-4" />} label="PvP Kills" value={formatNumber(player.pvpKills)} />
        <StatCard icon={<Skull className="size-3.5 text-muted-foreground" />} label="NPC Kills" value={formatNumber(player.npcKills)} />
      </div>

      {/* Temple Boost (active god only) */}
      {temple && temple.expiresAt > Date.now() && (
        <TempleBoostCard temple={temple} />
      )}

      {/* Combat Stats with Rankings */}
      {player.totalStr !== undefined && (
        <div className="game-card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gold-dim uppercase tracking-wider">Combat Stats</h2>
            {player.spAtkDamage !== undefined && (
              <span className="text-[10px] text-chart-2 font-medium">spATK +{player.spAtkDamage}%</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatBreakdownV2 label="STR" color="text-chart-4" total={player.totalStr ?? 0} rank={player.strRank} />
            <StatBreakdownV2 label="DEF" color="text-chart-1" total={player.totalDef ?? 0} rank={player.defRank} />
            <StatBreakdownV2 label="DEX" color="text-chart-5" total={player.totalDex ?? 0} rank={player.dexRank} />
          </div>
        </div>
      )}

      {/* Skills — all 7 */}
      {skills.length > 0 && (
        <div className="game-card">
          <h2 className="text-xs font-semibold text-gold-dim uppercase tracking-wider mb-2">Skills</h2>
          <div className="grid grid-cols-2 gap-2">
            {skills.map((s) => {
              const xpNeeded = skillXpForLevel(s.level);
              const pct = Math.min(100, Math.round((s.exp / xpNeeded) * 100));
              const info = SKILL_INFO[s.skill] || { icon: "🎯", color: "text-muted-foreground" };
              const displayName = s.skill.replace(/_/g, " ");
              return (
                <div key={s._id} className="flex items-center gap-2 p-1.5 rounded-md bg-secondary/30">
                  <span className="text-sm">{info.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium capitalize">{displayName}</span>
                      <span className="text-[10px] font-mono text-primary">Lv. {s.level}</span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden mt-0.5">
                      <div className="h-full rounded-full bg-xp" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* World Boss Alert */}
      {lowBosses.length > 0 && (
        <Link to="/bosses" className="block">
          <div className="game-card border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skull className="size-4 text-destructive" />
                <div>
                  <p className="text-[11px] font-semibold text-destructive">
                    {lowBosses.length} boss{lowBosses.length > 1 ? "es" : ""} near death!
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {lowBosses.map(b => b.name).join(", ")}
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </div>
        </Link>
      )}

      {/* Active Buffs */}
      {buffs.length > 0 && (
        <div className="game-card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gold-dim uppercase tracking-wider">Active Buffs</h2>
            <Link to="/buffs" className="text-[10px] text-primary hover:underline">View All →</Link>
          </div>
          <div className="space-y-1.5">
            {buffs.filter(b => b.expiresAt > Date.now()).slice(0, 3).map((buff) => (
              <BuffItem key={buff._id} buff={buff} />
            ))}
          </div>
        </div>
      )}

      {/* Diamond Market Widget */}
      {diamondMarket && diamondMarket.length > 0 && (
        <div className="game-card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gold-dim uppercase tracking-wider">💎 Diamond Market</h2>
            <span className="text-[10px] text-muted-foreground">{diamondMarket.length} listings</span>
          </div>
          <div className="space-y-1.5">
            {diamondMarket.slice(0, 3).map((d) => {
              const pricePerDiamond = d.pricePerDiamond || 0;
              return (
                <div key={d._id} className="flex items-center justify-between p-1.5 rounded-md bg-secondary/30">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium truncate">{d.sellerName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {d.diamondsRemaining}/{d.diamondAmount} 💎 remaining
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-bold text-gold-accent">{formatGold(pricePerDiamond)}</p>
                    <p className="text-[9px] text-muted-foreground">per 💎</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Equipment Summary */}
      <div className="game-card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-gold-dim uppercase tracking-wider">Equipment</h2>
          <Link to="/equipment" className="text-[10px] text-primary hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {equipment.slice(0, 6).map((eq) => (
            <div
              key={eq._id}
              className={`flex items-center gap-2 p-1.5 rounded-md border ${
                eq.itemName ? "border-blue-500/30 bg-secondary/30" : "border-dashed border-muted-foreground/20 bg-muted/20"
              }`}
            >
              <span className="text-sm shrink-0">{SLOT_ICONS[eq.slot] || "📦"}</span>
              {eq.itemName ? (
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium truncate text-cyan-400">
                    {eq.itemName}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {SLOT_LABELS[eq.slot] || eq.slot}
                  </p>
                </div>
              ) : (
                <span className="text-[11px] text-muted-foreground italic">Empty {SLOT_LABELS[eq.slot] || eq.slot}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Extended Stats */}
      <div className="game-card">
        <h2 className="text-xs font-semibold text-gold-dim uppercase tracking-wider mb-2">More Stats</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
          <StatRow label="K/D Ratio" value={String(kdRatio)} />
          <StatRow label="Boss Kills" value={formatNumber(player.bossKills ?? 0)} />
          <StatRow label="Quests Performed" value={formatNumber(player.questsPerformed ?? 0)} />
          <StatRow label="Quests Completed" value={formatNumber(player.questsComplete)} />
          <StatRow label="Tasks Completed" value={formatNumber(player.tasksCompleted ?? 0)} />
          <StatRow label="Market Trades" value={formatNumber(player.marketTrades ?? 0)} />
          <StatRow label="P2P Trades" value={formatNumber(player.p2pTrades ?? 0)} />
          <StatRow label="Bounties" value={formatNumber(player.bountiesCompleted ?? 0)} />
          <StatRow label="Chests Opened" value={formatNumber(player.chestsOpened ?? 0)} />
          <StatRow label="Dailies" value={formatNumber(player.dailiesUnlocked ?? 0)} />
          <StatRow label="Awards" value={formatNumber(player.awards ?? 0)} />
          <StatRow label="Avatars" value={formatNumber(player.avatarsUnlocked ?? 0)} />
          <StatRow label="Reputation" value={formatNumber(player.reputation ?? 0)} />
          {player.professionTime && <StatRow label="Profession Time" value={player.professionTime} />}
          {player.totalExp !== undefined && <StatRow label="Total EXP" value={formatNumber(player.totalExp)} />}
          {player.joinDate && <StatRow label="Joined" value={player.joinDate} />}
        </div>
      </div>

      {/* Timestamp */}
      <p className="text-[10px] text-muted-foreground text-center">
        Last updated: {new Date(player.lastUpdated).toLocaleTimeString()} · Mock data (connect API key in Settings)
      </p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="game-card flex flex-col items-center text-center py-2.5">
      {icon}
      <span className="text-base font-bold mt-1">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function StatBreakdownV2({ label, color, total, rank }: {
  label: string; color: string; total: number; rank?: string;
}) {
  return (
    <div className="text-center p-2 rounded-md bg-secondary/30">
      <span className={`text-[10px] font-bold ${color}`}>{label}</span>
      <p className={`text-lg font-bold mt-0.5 ${color}`}>{formatNumber(total)}</p>
      {rank && (
        <p className="text-[9px] text-muted-foreground mt-0.5">{rank}</p>
      )}
    </div>
  );
}

function TempleBoostCard({ temple }: { temple: {
  godName: string; godTitle: string; bonus: string;
  expiresAt: number; worshipsUsedToday: number; maxWorshipsPerDay: number; worshipResetAt: number;
}}) {
  const [timeLeft, setTimeLeft] = useState(formatTimeRemaining(temple.expiresAt));
  const [resetTime, setResetTime] = useState(formatTimeRemaining(temple.worshipResetAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeRemaining(temple.expiresAt));
      setResetTime(formatTimeRemaining(temple.worshipResetAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [temple.expiresAt, temple.worshipResetAt]);

  return (
    <div className="game-card border-chart-2/30">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-chart-2/15 flex items-center justify-center text-xl">
          🏛️
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{temple.godName}</span>
            <span className="text-[9px] text-muted-foreground">{temple.godTitle}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-success font-medium">{temple.bonus}</span>
            <span className="text-[10px] font-mono text-primary">{timeLeft}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[9px] text-muted-foreground">
            <span>Worships: {temple.worshipsUsedToday}/{temple.maxWorshipsPerDay}</span>
            <span>Reset: {resetTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuffItem({ buff }: { buff: { buffName: string; buffType: string; expiresAt: number; bonusPercent?: number; iconEmoji?: string } }) {
  const [timeLeft, setTimeLeft] = useState(formatTimeRemaining(buff.expiresAt));
  const isExpired = buff.expiresAt <= Date.now();

  useEffect(() => {
    if (isExpired) return;
    const interval = setInterval(() => {
      setTimeLeft(formatTimeRemaining(buff.expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [buff.expiresAt, isExpired]);

  return (
    <div className={`flex items-center gap-2 p-1.5 rounded-md ${isExpired ? "opacity-40" : "bg-secondary/30"}`}>
      <span className="text-sm">{buff.iconEmoji || "✨"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium truncate">{buff.buffName}</p>
        {buff.bonusPercent && (
          <p className="text-[9px] text-success">+{buff.bonusPercent}% bonus</p>
        )}
      </div>
      <span className={`text-[11px] font-mono ${isExpired ? "text-destructive" : "text-primary"}`}>
        {timeLeft}
      </span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-3 md:p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-lg bg-muted animate-pulse" />
        <div className="space-y-1.5 flex-1">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="game-card space-y-3">
        <div className="h-3 rounded-full bg-muted animate-pulse" />
        <div className="h-3 rounded-full bg-muted animate-pulse" />
        <div className="h-3 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={`skel-${i}`} className="game-card h-16 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
