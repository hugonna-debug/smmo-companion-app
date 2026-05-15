import { useMutation, useQuery } from "convex/react";
import {
  Lock,
  Check,
  Copy,
  Clock,
  Gift,
  Coins,
  Sparkles,
  Gem,
  Zap,
  Package,
  AlertTriangle,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTimeRemaining } from "@/lib/gameUtils";

type VaultFilter = "all" | "active" | "redeemed" | "expired";

const REWARD_ICONS: Record<string, React.ReactNode> = {
  gold: <Coins className="size-3.5 text-gold-accent" />,
  exp: <Sparkles className="size-3.5 text-xp" />,
  diamond: <Gem className="size-3.5 text-info" />,
  buff: <Zap className="size-3.5 text-chart-2" />,
  item: <Package className="size-3.5 text-chart-3" />,
};

const SOURCE_LABELS: Record<string, string> = {
  simple_wolf: "🐺 Simple Wolf",
  community: "👥 Community",
  manual: "✏️ Manual",
};

export function VaultPage() {
  const codes = useQuery(api.gameData.getVaultCodes);
  const toggleRedeemed = useMutation(api.gameData.toggleVaultRedeemed);
  const removeCode = useMutation(api.gameData.removeVaultCode);
  const [filter, setFilter] = useState<VaultFilter>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (codes === undefined) {
    return <VaultSkeleton />;
  }

  const now = Date.now();
  const active = codes.filter((c) => !c.isRedeemed && (!c.expiresAt || c.expiresAt > now));
  const redeemed = codes.filter((c) => c.isRedeemed);
  const expired = codes.filter((c) => !c.isRedeemed && c.expiresAt && c.expiresAt <= now);

  const filteredCodes =
    filter === "active" ? active :
    filter === "redeemed" ? redeemed :
    filter === "expired" ? expired :
    codes;

  // Sort: active first (by expiry soonest), then redeemed (newest first), then expired
  const sorted = [...filteredCodes].sort((a, b) => {
    const aStatus = a.isRedeemed ? 2 : (a.expiresAt && a.expiresAt <= now) ? 3 : 1;
    const bStatus = b.isRedeemed ? 2 : (b.expiresAt && b.expiresAt <= now) ? 3 : 1;
    if (aStatus !== bStatus) return aStatus - bStatus;
    if (aStatus === 1 && a.expiresAt && b.expiresAt) return a.expiresAt - b.expiresAt;
    return b.addedAt - a.addedAt;
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="size-5 text-chart-3" />
          <h1 className="text-lg font-bold">Vault</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] border-success/30 text-success">
            {active.length} active
          </Badge>
          <Badge variant="outline" className="text-[10px] border-muted-foreground/30">
            {redeemed.length} redeemed
          </Badge>
        </div>
      </div>

      {/* Simple Wolf Info */}
      <div className="game-card border-chart-3/20 bg-chart-3/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🐺</span>
          <div>
            <p className="text-sm font-semibold">Simple Wolf Codes</p>
            <p className="text-[10px] text-muted-foreground">
              Vault codes from Simple Wolf and the SMMO community. Copy → paste into game vault.
            </p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
        {(["all", "active", "redeemed", "expired"] as const).map((f) => {
          const count = f === "all" ? codes.length : f === "active" ? active.length : f === "redeemed" ? redeemed.length : expired.length;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {f === "all" ? `All (${count})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Codes List */}
      {sorted.length === 0 ? (
        <div className="game-card text-center py-8">
          <Lock className="size-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No codes in this category</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sorted.map((code) => {
            const isExp = !code.isRedeemed && code.expiresAt && code.expiresAt <= now;
            const isExpiringSoon = !code.isRedeemed && code.expiresAt && code.expiresAt > now && (code.expiresAt - now) < 86400000 * 2;

            return (
              <div
                key={code._id}
                className={`game-card ${
                  code.isRedeemed ? "opacity-50" :
                  isExp ? "opacity-40 border-destructive/20" :
                  isExpiringSoon ? "border-warning/30" :
                  "border-chart-3/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                    code.isRedeemed ? "bg-success/10" : isExp ? "bg-destructive/10" : "bg-chart-3/10"
                  }`}>
                    {code.isRedeemed ? (
                      <Check className="size-4 text-success" />
                    ) : isExp ? (
                      <Clock className="size-4 text-destructive" />
                    ) : (
                      <Gift className="size-4 text-chart-3" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Code + copy button */}
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-bold font-mono text-primary tracking-wider">
                        {code.code}
                      </code>
                      {!code.isRedeemed && !isExp && (
                        <button
                          type="button"
                          onClick={() => handleCopy(code.code)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedCode === code.code ? (
                            <Check className="size-3.5 text-success" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Reward */}
                    {code.reward && (
                      <div className="flex items-center gap-1.5 mt-1">
                        {REWARD_ICONS[code.rewardType || "item"] || <Gift className="size-3.5" />}
                        <span className="text-[11px] text-foreground/80">{code.reward}</span>
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground flex-wrap">
                      <span>{SOURCE_LABELS[code.source] || code.source}</span>
                      {code.expiresAt && !code.isRedeemed && !isExp && (
                        <span className={isExpiringSoon ? "text-warning font-medium" : ""}>
                          ⏰ {formatTimeRemaining(code.expiresAt)}
                        </span>
                      )}
                      {isExp && <span className="text-destructive">Expired</span>}
                      {code.isRedeemed && code.redeemedAt && (
                        <span className="text-success">
                          ✓ Redeemed {new Date(code.redeemedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {code.notes && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1 italic">{code.notes}</p>
                    )}

                    {isExpiringSoon && !code.isRedeemed && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-warning">
                        <AlertTriangle className="size-3" />
                        <span>Expiring soon — redeem now!</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    {!isExp && (
                      <button
                        type="button"
                        onClick={() => toggleRedeemed({ codeId: code._id })}
                        className={`p-1.5 rounded-md transition-colors ${
                          code.isRedeemed
                            ? "bg-muted/50 text-muted-foreground hover:bg-muted"
                            : "bg-success/10 text-success hover:bg-success/20"
                        }`}
                        title={code.isRedeemed ? "Mark as not redeemed" : "Mark as redeemed"}
                      >
                        <Check className="size-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeCode({ codeId: code._id })}
                      className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      title="Remove code"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* External link */}
      <div className="game-card border-dashed flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium">More codes?</p>
          <p className="text-[10px] text-muted-foreground">
            Check Simple Wolf's latest posts for new vault codes
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-[10px] h-7 border-primary/30 text-primary">
          <ExternalLink className="size-3" />
          Simple Wolf
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Mock data · Codes are tracked locally — copy and paste into SMMO vault
      </p>
    </div>
  );
}

function VaultSkeleton() {
  return (
    <div className="p-3 md:p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-24 rounded bg-muted animate-pulse" />
      </div>
      <div className="game-card h-16 animate-pulse" />
      <div className="flex gap-1 h-8 rounded-lg bg-muted animate-pulse" />
      {[...Array(5)].map((_, i) => (
        <div key={`vskel-${i}`} className="game-card h-20 animate-pulse" />
      ))}
    </div>
  );
}
