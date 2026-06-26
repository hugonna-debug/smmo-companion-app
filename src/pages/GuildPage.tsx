import { useQuery } from "convex/react";
import {
  ChevronDown,
  ChevronUp,
  Coins,
  Crown,
  Footprints,
  Shield,
  Skull,
  Sparkles,
  Star,
  Swords,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  formatGold,
  formatNumber,
  getHpBarColor,
  getHpColor,
} from "@/lib/gameUtils";
import { api } from "../../convex/_generated/api";

function ContribStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/30">
      {icon}
      <div>
        <p className="text-sm font-bold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

type GuildTab =
  | "overview"
  | "members"
  | "sanctuary"
  | "power"
  | "bank"
  | "contribution";

export function GuildPage() {
  const guild = useQuery(api.gameData.getGuildInfo);
  const members = useQuery(api.gameData.getGuildMembers);
  const task = useQuery(api.gameData.getGuildTask);
  const sanctuary = useQuery(api.gameData.getGuildSanctuary);
  const wars = useQuery(api.gameData.getGuildWars);
  const contribution = useQuery(api.gameData.getGuildContribution);
  const [activeTab, setActiveTab] = useState<GuildTab>("overview");
  const [sortBy, setSortBy] = useState<"level" | "pvpKills" | "lastActivity">(
    "level",
  );
  const [sortAsc, setSortAsc] = useState(false);

  if (
    guild === undefined ||
    members === undefined ||
    task === undefined ||
    sanctuary === undefined ||
    wars === undefined
  ) {
    return <GuildSkeleton />;
  }

  if (guild === null) {
    return (
      <div className="p-4 flex flex-col items-center justify-center gap-3 min-h-[50vh]">
        <Shield className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No guild data available</p>
        <p className="text-[11px] text-muted-foreground/60">
          Connect your API key to load guild info
        </p>
      </div>
    );
  }

  const activeWars = wars.filter(w => !w.isBlacklisted);
  const onlineMembers = members.filter(
    m => Date.now() - m.lastActivity < 3600000,
  );
  const warriors = members.filter(m => m.warrior);

  const sortedMembers = [...members].sort((a, b) => {
    const mult = sortAsc ? 1 : -1;
    if (sortBy === "level") return (b.level - a.level) * mult;
    if (sortBy === "pvpKills") return (b.pvpKills - a.pvpKills) * mult;
    return (a.lastActivity - b.lastActivity) * mult;
  });

  const taskPercent = task
    ? Math.round((task.currentAmount / task.targetAmount) * 100)
    : 0;

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      {/* Guild Header */}
      <div className="game-card">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-xl">
            ⚜
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gold truncate">
                {guild.name}
              </h1>
              {guild.tag && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-primary/30 text-primary"
                >
                  [{guild.tag}]
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>{guild.memberCount} members</span>
              <span className="text-success">
                {onlineMembers.length} online
              </span>
              {guild.eligibleForWar && (
                <span className="text-chart-4">⚔ War eligible</span>
              )}
            </div>
          </div>
        </div>

        {/* Guild Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Season XP</p>
            <p className="text-sm font-bold text-primary">
              {formatNumber(guild.currentSeasonExp)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Total XP</p>
            <p className="text-sm font-bold">{formatNumber(guild.exp)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Active Wars</p>
            <p className="text-sm font-bold text-chart-4">
              {activeWars.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Warriors</p>
            <p className="text-sm font-bold text-warning">{warriors.length}</p>
          </div>
        </div>
      </div>

      {/* Guild Task Progress */}
      {task && (
        <div className="game-card">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Target className="size-3.5 text-chart-3" />
              <span className="text-xs font-semibold text-gold-dim uppercase tracking-wider">
                Guild Task
              </span>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {task.taskType}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1">
              <Progress value={taskPercent} className="h-2" />
            </div>
            <span className="text-[11px] font-mono text-primary">
              {taskPercent}%
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              {formatNumber(task.currentAmount)} /{" "}
              {formatNumber(task.targetAmount)}
            </span>
            <span className="text-xp">
              +{formatNumber(task.expReward)} XP · +{task.powerPointReward} PP
            </span>
          </div>
        </div>
      )}

      {/* Tab switcher — 2 rows for 6 tabs */}
      <div className="space-y-1">
        <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
          {(["overview", "members", "power"] as const).map(tab => (
            <button
              key={tab}
              type="button"
              aria-pressed={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {tab === "overview"
                ? `Wars (${activeWars.length})`
                : tab === "members"
                  ? `Members (${members.length})`
                  : "Power"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
          {(["sanctuary", "bank", "contribution"] as const).map(tab => (
            <button
              key={tab}
              type="button"
              aria-pressed={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {tab === "sanctuary"
                ? "Sanctuary"
                : tab === "bank"
                  ? "Bank"
                  : "Contribution"}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab - Guild Wars */}
      {activeTab === "overview" && (
        <div className="space-y-1.5">
          {activeWars.length === 0 ? (
            <div className="game-card text-center py-6">
              <Swords className="size-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No active guild wars
              </p>
            </div>
          ) : (
            activeWars.map(war => {
              const total = war.ourScore + war.enemyScore;
              const ourPct = total > 0 ? (war.ourScore / total) * 100 : 50;
              const winning = war.ourScore > war.enemyScore;
              const tied = war.ourScore === war.enemyScore;
              return (
                <div key={war._id} className="game-card">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold truncate">
                      {war.enemyGuildName}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        winning
                          ? "bg-success/15 text-success"
                          : tied
                            ? "bg-warning/15 text-warning"
                            : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {winning ? "Winning" : tied ? "Tied" : "Losing"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-success">{war.ourScore}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-destructive/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-success transition-all"
                        style={{ width: `${ourPct}%` }}
                      />
                    </div>
                    <span className="text-destructive">{war.enemyScore}</span>
                  </div>
                  {war.status && (
                    <span className="text-[9px] text-muted-foreground mt-1 inline-block">
                      {war.status}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div className="space-y-2">
          {/* Sort controls */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-muted-foreground">Sort:</span>
            {(["level", "pvpKills", "lastActivity"] as const).map(key => {
              const isSorted = sortBy === key;
              const sortLabel =
                key === "level"
                  ? "Level"
                  : key === "pvpKills"
                    ? "PvP"
                    : "Activity";
              const ariaSort = isSorted
                ? sortAsc
                  ? "ascending"
                  : "descending"
                : "none";
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={`Sort by ${sortLabel} (${ariaSort})`}
                  onClick={() => {
                    if (sortBy === key) setSortAsc(!sortAsc);
                    else {
                      setSortBy(key);
                      setSortAsc(false);
                    }
                  }}
                  className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                    sortBy === key
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {key === "level"
                    ? "Level"
                    : key === "pvpKills"
                      ? "PvP Kills"
                      : "Activity"}
                  {sortBy === key &&
                    (sortAsc ? (
                      <ChevronUp className="size-2.5" />
                    ) : (
                      <ChevronDown className="size-2.5" />
                    ))}
                </button>
              );
            })}
          </div>

          {sortedMembers.map(member => {
            const hpPct = Math.round((member.currentHp / member.maxHp) * 100);
            const isOnline = Date.now() - member.lastActivity < 3600000;
            const activityAge = Date.now() - member.lastActivity;
            const activityLabel =
              activityAge < 60000
                ? "just now"
                : activityAge < 3600000
                  ? `${Math.floor(activityAge / 60000)}m ago`
                  : activityAge < 86400000
                    ? `${Math.floor(activityAge / 3600000)}h ago`
                    : `${Math.floor(activityAge / 86400000)}d ago`;

            return (
              <div key={member._id} className="game-card">
                <div className="flex items-center gap-2">
                  <div
                    className={`size-8 rounded-md flex items-center justify-center text-sm shrink-0 ${
                      member.position === "Leader"
                        ? "bg-gold-accent/15 border border-gold-accent/30"
                        : member.position === "Officer"
                          ? "bg-primary/15 border border-primary/30"
                          : "bg-secondary/50 border border-border"
                    }`}
                  >
                    {member.position === "Leader" ? (
                      <Crown className="size-4 text-gold-accent" />
                    ) : member.position === "Officer" ? (
                      <Star className="size-4 text-primary" />
                    ) : (
                      <Users className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">
                        {member.memberName}
                      </span>
                      {member.warrior && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-chart-4/15 text-chart-4">
                          ⚔ WAR
                        </span>
                      )}
                      {member.safeMode && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-success/15 text-success">
                          SAFE
                        </span>
                      )}
                      <span
                        className={`size-1.5 rounded-full ${isOnline ? "bg-success" : "bg-muted-foreground/30"}`}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>Lv. {member.level}</span>
                      <span className="flex items-center gap-0.5">
                        <Swords className="size-2.5" />
                        {formatNumber(member.pvpKills)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Footprints className="size-2.5" />
                        {formatNumber(member.steps)}
                      </span>
                      <span>{activityLabel}</span>
                    </div>
                    {/* HP bar */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getHpBarColor(hpPct)}`}
                          style={{ width: `${hpPct}%` }}
                        />
                      </div>
                      <span
                        className={`text-[9px] font-mono ${getHpColor(hpPct)}`}
                      >
                        {hpPct}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sanctuary Tab */}
      {activeTab === "sanctuary" && (
        <div className="space-y-2">
          {sanctuary.length === 0 ? (
            <div className="game-card text-center py-6">
              <Shield className="size-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No sanctuary data</p>
            </div>
          ) : (
            sanctuary.map(tier => (
              <div
                key={tier._id}
                className={`game-card ${tier.isActive ? "border-primary/30" : ""}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Zap
                      className={`size-3.5 ${tier.isActive ? "text-primary" : tier.inProgress ? "text-warning" : "text-muted-foreground"}`}
                    />
                    <span className="text-sm font-semibold">
                      {tier.tierName}
                    </span>
                  </div>
                  {tier.isActive && (
                    <Badge className="text-[9px] bg-primary/15 text-primary border-0">
                      ACTIVE
                    </Badge>
                  )}
                  {tier.inProgress && (
                    <Badge variant="secondary" className="text-[9px]">
                      IN PROGRESS
                    </Badge>
                  )}
                  {!tier.isActive && !tier.inProgress && (
                    <Badge
                      variant="outline"
                      className="text-[9px] text-muted-foreground"
                    >
                      LOCKED
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Progress value={tier.percentage} className="h-1.5" />
                  <span className="text-[10px] font-mono text-primary">
                    {tier.percentage}%
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mb-1">
                  {formatGold(tier.currentValue)} /{" "}
                  {formatGold(tier.targetValue)}
                </div>
                <div className="flex flex-wrap gap-1">
                  {tier.effects.map(effect => (
                    <span
                      key={effect}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/50 text-foreground/80"
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Power Tab (from video: Rank 5/5, 5,953 PP, tier bonuses) */}
      {activeTab === "power" && (
        <div className="space-y-2">
          <div className="game-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gold-dim uppercase tracking-wider">
                Guild Power
              </h3>
              <Badge className="text-[9px] bg-primary/15 text-primary border-0">
                Rank 5/5
              </Badge>
            </div>
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-gold">5,953</p>
              <p className="text-[10px] text-muted-foreground">Power Points</p>
            </div>
            <div className="space-y-2">
              {[
                { rank: 1, pp: 0, bonus: "+2% Guild EXP", active: true },
                {
                  rank: 2,
                  pp: 500,
                  bonus: "+5% Guild EXP, +1 War Slot",
                  active: true,
                },
                {
                  rank: 3,
                  pp: 1500,
                  bonus: "+10% Guild EXP, +2 War Slots",
                  active: true,
                },
                {
                  rank: 4,
                  pp: 3000,
                  bonus: "+15% Guild EXP, +3 War Slots, Sanctuary Unlock",
                  active: true,
                },
                {
                  rank: 5,
                  pp: 5000,
                  bonus: "+20% Guild EXP, +5 War Slots, Advanced Perks",
                  active: true,
                },
              ].map(tier => (
                <div
                  key={tier.rank}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    tier.active
                      ? "bg-primary/5 border border-primary/20"
                      : "bg-muted/20 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        tier.active
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tier.rank}
                    </div>
                    <span className="text-[11px] font-medium">
                      {tier.bonus}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {formatNumber(tier.pp)} PP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bank Tab (from video: 3.1B balance) */}
      {activeTab === "bank" && (
        <div className="space-y-2">
          <div className="game-card text-center py-4">
            <Coins className="size-8 text-gold-accent mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Guild Bank Balance
            </p>
            <p className="text-2xl font-bold text-gold mt-1">
              {formatGold(3104798179)}
            </p>
          </div>
          <div className="game-card">
            <h3 className="text-xs font-semibold text-gold-dim uppercase tracking-wider mb-3">
              Actions
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className="p-3 rounded-lg bg-success/10 border border-success/20 text-center hover:bg-success/15 transition-colors"
              >
                <Coins className="size-4 text-success mx-auto mb-1" />
                <span className="text-[10px] font-medium text-success">
                  Deposit
                </span>
              </button>
              <button
                type="button"
                className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center hover:bg-destructive/15 transition-colors"
              >
                <Coins className="size-4 text-destructive mx-auto mb-1" />
                <span className="text-[10px] font-medium text-destructive">
                  Withdraw
                </span>
              </button>
              <button
                type="button"
                className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center hover:bg-primary/15 transition-colors"
              >
                <Users className="size-4 text-primary mx-auto mb-1" />
                <span className="text-[10px] font-medium text-primary">
                  Distribute
                </span>
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground text-center mt-2">
              Bank actions require API key · Read-only mode
            </p>
          </div>
          <div className="game-card">
            <h3 className="text-xs font-semibold text-gold-dim uppercase tracking-wider mb-2">
              Recent Transactions
            </h3>
            <div className="space-y-1.5">
              {[
                {
                  player: "DeerKing",
                  type: "deposit",
                  amount: 50000000,
                  time: "2h ago",
                },
                {
                  player: "ForestArcher",
                  type: "deposit",
                  amount: 25000000,
                  time: "5h ago",
                },
                {
                  player: "The Guy",
                  type: "deposit",
                  amount: 10000000,
                  time: "1d ago",
                },
                {
                  player: "AntlerSmash",
                  type: "deposit",
                  amount: 35000000,
                  time: "2d ago",
                },
              ].map((tx, i) => (
                <div
                  key={`tx-${i}`}
                  className="flex items-center justify-between p-1.5 rounded-md bg-secondary/30"
                >
                  <div>
                    <p className="text-[11px] font-medium">{tx.player}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {tx.time}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-bold ${tx.type === "deposit" ? "text-success" : "text-destructive"}`}
                  >
                    {tx.type === "deposit" ? "+" : "-"}
                    {formatGold(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contribution Tab */}
      {activeTab === "contribution" && (
        <div className="space-y-2">
          {contribution === null || contribution === undefined ? (
            <div className="game-card text-center py-6">
              <Target className="size-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No contribution data
              </p>
            </div>
          ) : (
            <>
              <div className="game-card">
                <h3 className="text-xs font-semibold text-gold-dim uppercase tracking-wider mb-3">
                  Your Guild Contribution
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <ContribStat
                    label="Gold Deposited"
                    value={formatGold(contribution.goldDeposited)}
                    icon={<Coins className="size-3.5 text-gold-accent" />}
                  />
                  <ContribStat
                    label="Power Points"
                    value={formatNumber(contribution.powerPointsDeposited)}
                    icon={<Zap className="size-3.5 text-primary" />}
                  />
                  <ContribStat
                    label="PvE Kills"
                    value={formatNumber(contribution.pveKills)}
                    icon={<Skull className="size-3.5 text-chart-3" />}
                  />
                  <ContribStat
                    label="PvE EXP"
                    value={formatNumber(contribution.pveExp)}
                    icon={<Sparkles className="size-3.5 text-xp" />}
                  />
                  <ContribStat
                    label="PvP Kills"
                    value={formatNumber(contribution.pvpKills)}
                    icon={<Swords className="size-3.5 text-chart-4" />}
                  />
                  <ContribStat
                    label="PvP EXP"
                    value={formatNumber(contribution.pvpExp)}
                    icon={<Sparkles className="size-3.5 text-chart-4" />}
                  />
                </div>
              </div>
              <div className="game-card">
                <h3 className="text-xs font-semibold text-gold-dim uppercase tracking-wider mb-3">
                  Tax Contributions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <ContribStat
                    label="Guild Bank Tax"
                    value={formatGold(contribution.taxGuildBank ?? 0)}
                    icon={<Coins className="size-3.5 text-gold-accent" />}
                  />
                  <ContribStat
                    label="Sanctuary Tax"
                    value={formatGold(contribution.taxSanctuary ?? 0)}
                    icon={<Shield className="size-3.5 text-chart-3" />}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Mock data · Guild endpoints require own-guild membership for
        task/sanctuary/contribution
      </p>
    </div>
  );
}

function GuildSkeleton() {
  return (
    <div className="p-3 md:p-4 space-y-3">
      <div className="game-card h-24 animate-pulse" />
      <div className="game-card h-16 animate-pulse" />
      <div className="flex gap-1 h-8 rounded-lg bg-muted animate-pulse" />
      {[...Array(4)].map((_, i) => (
        <div key={`gskel-${i}`} className="game-card h-16 animate-pulse" />
      ))}
    </div>
  );
}
