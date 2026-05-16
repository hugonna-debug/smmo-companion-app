import { useAuthActions } from "@convex-dev/auth/react";
import { useAction, useMutation, useQuery } from "convex/react";
import { CheckCircle, ChevronRight, Key, Layout, Loader2, Monitor, RefreshCw, Settings, Smartphone, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useLayout, type DeadZonePosition, type LayoutMode } from "../contexts/LayoutContext";

const POSITION_LABELS: Record<DeadZonePosition, string> = {
  "top-right": "Top Right",
  "top-left": "Top Left",
  "bottom-right": "Bottom Right",
  "bottom-left": "Bottom Left",
};

type RateLimitStatus = {
  limit: number;
  remaining: number;
  resetAt: number;
};

function formatStatusTimestamp(timestamp?: number) {
  if (!timestamp) return "Never";
  return new Date(timestamp).toLocaleString();
}

function LShapePreview({ position, dzWidth, dzHeight }: { position: DeadZonePosition; dzWidth: number; dzHeight: number }) {
  // Mini visual preview of the L-shape layout
  const w = dzWidth;
  const h = dzHeight;

  const getDeadStyle = (): React.CSSProperties => {
    switch (position) {
      case "top-right":
        return { top: 0, right: 0, width: `${w}%`, height: `${h}%` };
      case "top-left":
        return { top: 0, left: 0, width: `${w}%`, height: `${h}%` };
      case "bottom-right":
        return { bottom: 0, right: 0, width: `${w}%`, height: `${h}%` };
      case "bottom-left":
        return { bottom: 0, left: 0, width: `${w}%`, height: `${h}%` };
    }
  };

  return (
    <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border-2 border-border max-w-[120px]">
      {/* Green = usable area */}
      <div className="absolute inset-0 bg-emerald-500/30" />
      {/* Red = dead zone */}
      <div
        className="absolute bg-red-500/40 border border-red-500/50 flex items-center justify-center"
        style={getDeadStyle()}
      >
        <span className="text-[8px] text-red-300 font-medium text-center leading-tight px-1">
          Game<br />Window
        </span>
      </div>
      {/* Label */}
      <div className="absolute bottom-1 left-1">
        <span className="text-[7px] text-emerald-300 font-medium">App</span>
      </div>
    </div>
  );
}

function LayoutSettings() {
  const { config, setConfig } = useLayout();

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Layout className="size-4 text-primary" />
          Screen Layout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-[11px] text-muted-foreground">
          L-Shape mode leaves a transparent zone for your game in split-screen. Content wraps around it.
        </p>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfig({ mode: "normal" as LayoutMode })}
            className={`flex-1 flex items-center gap-2 rounded-lg border p-3 transition-all ${
              config.mode === "normal"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted/50"
            }`}
          >
            <Monitor className="size-4" />
            <div className="text-left">
              <p className="text-xs font-medium">Normal</p>
              <p className="text-[10px] text-muted-foreground">Full screen</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setConfig({ mode: "lshape" as LayoutMode })}
            className={`flex-1 flex items-center gap-2 rounded-lg border p-3 transition-all ${
              config.mode === "lshape"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted/50"
            }`}
          >
            <Smartphone className="size-4" />
            <div className="text-left">
              <p className="text-xs font-medium">L-Shape</p>
              <p className="text-[10px] text-muted-foreground">Split screen</p>
            </div>
          </button>
        </div>

        {/* L-Shape settings (only when L-shape is selected) */}
        {config.mode === "lshape" && (
          <div className="space-y-4 pt-2 border-t border-border">
            {/* Preview + Position */}
            <div className="flex gap-4">
              <LShapePreview
                position={config.deadZonePosition}
                dzWidth={config.deadZoneWidth}
                dzHeight={config.deadZoneHeight}
              />
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Game Window Position</Label>
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    {(Object.keys(POSITION_LABELS) as DeadZonePosition[]).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setConfig({ deadZonePosition: pos })}
                        className={`text-[10px] rounded px-2 py-1.5 border transition-all ${
                          config.deadZonePosition === pos
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        {POSITION_LABELS[pos]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Size sliders */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-[10px] text-muted-foreground">Game Width</Label>
                  <span className="text-[10px] text-muted-foreground">{config.deadZoneWidth}%</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={80}
                  value={config.deadZoneWidth}
                  onChange={(e) => setConfig({ deadZoneWidth: Number(e.target.value) })}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Label className="text-[10px] text-muted-foreground">Game Height</Label>
                  <span className="text-[10px] text-muted-foreground">{config.deadZoneHeight}%</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={80}
                  value={config.deadZoneHeight}
                  onChange={(e) => setConfig({ deadZoneHeight: Number(e.target.value) })}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SettingsPage() {
  const user = useQuery(api.auth.currentUser);
  const apiKeyStatus = useQuery(api.gameData.getApiKeyStatus);
  const validateApiKey = useAction(api.smmoApi.validateAndSaveApiKey);
  const syncAll = useAction(api.syncPlayer.syncAll);
  const getRateLimitStatus = useAction(api.smmoApi.getRateLimitStatus);
  const clearData = useMutation(api.gameData.clearUserData);
  const seedDemo = useMutation(api.gameData.seedDemoData);
  const { signIn, signOut } = useAuthActions();
  const deleteAccount = useMutation(api.users.deleteAccount);
  const navigate = useNavigate();

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStep, setPasswordStep] = useState<"request" | "verify">("request");
  const [apiKey, setApiKey] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus | null>(null);

  useEffect(() => {
    if (apiKeyStatus?.smmoPlayerId && playerId === "") {
      setPlayerId(String(apiKeyStatus.smmoPlayerId));
    }
  }, [apiKeyStatus?.smmoPlayerId, playerId]);

  useEffect(() => {
    void getRateLimitStatus()
      .then(setRateLimit)
      .catch(() => {
        // Rate limit state is advisory; action failures still surface on sync.
      });
  }, [getRateLimitStatus]);

  const handleValidateApiKey = async () => {
    const parsedPlayerId = Number(playerId);
    if (!apiKey.trim() || !Number.isInteger(parsedPlayerId) || parsedPlayerId <= 0) {
      toast.error("Enter both an API key and a valid SMMO player ID");
      return;
    }

    setSavingKey(true);
    try {
      const result = await validateApiKey({
        apiKey,
        playerId: parsedPlayerId,
      });
      setRateLimit(result.rateLimit);

      if (!result.success) {
        toast.error(result.message ?? "Could not validate SMMO API key");
        return;
      }

      setApiKey("");
      toast.success(`API key validated for ${result.playerName ?? "player"}`);
    } catch {
      toast.error("Failed to validate SMMO API key");
    } finally {
      setSavingKey(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const result = await syncAll();
      setRateLimit(result.rateLimit);

      if (!result.success) {
        toast.error(result.message ?? "Could not sync SMMO data");
        return;
      }

      toast.success(
        `Synced ${result.playerName ?? "player"} (${result.skills ?? 0} skills, ${result.equipment ?? 0} items)`,
      );
    } catch {
      toast.error("Failed to sync SMMO data");
    } finally {
      setSyncing(false);
    }
  };

  const handleResetData = async () => {
    try {
      await clearData();
      await seedDemo();
      toast.success("Demo data refreshed");
    } catch {
      toast.error("Failed to reset data");
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.append("email", user?.email || "");
    formData.append("flow", "reset");
    try {
      await signIn("password", formData);
      setPasswordStep("verify");
    } catch {
      setError("Could not send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("email", user?.email || "");
    formData.append("flow", "reset-verification");
    try {
      await signIn("password", formData);
      setSuccess("Password changed!");
      setTimeout(() => {
        setChangePasswordOpen(false);
        setPasswordStep("request");
        setSuccess("");
      }, 1500);
    } catch {
      setError("Invalid code or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError("");
    try {
      await deleteAccount();
      await signOut();
      navigate("/");
    } catch {
      setError("Could not delete account.");
      setLoading(false);
    }
  };

  return (
    <div className="p-3 md:p-4 space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Settings className="size-5 text-muted-foreground" />
        <h1 className="text-lg font-bold">Settings</h1>
      </div>

      {/* Profile */}
      <Card className="overflow-hidden border-border">
        <div className="h-12 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" />
        <CardContent className="-mt-6 pb-4">
          <div className="flex items-end gap-3">
            <Avatar className="size-12 border-2 border-background shadow">
              <AvatarFallback className="text-sm bg-primary/20 text-primary font-bold">
                {user?.name?.charAt(0).toUpperCase() || <User className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="pb-0.5">
              <p className="font-semibold text-sm">{user?.name || "Adventurer"}</p>
              <p className="text-[11px] text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings - NEW */}
      <LayoutSettings />

      {/* API Key */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Key className="size-4 text-primary" />
            Live SMMO API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[11px] text-muted-foreground">
            Store your SimpleMMO API key securely in Convex and sync real player
            data server-side. Get your key from{" "}
            <a
              href="https://web.simple-mmo.com/p-api/home"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              web.simple-mmo.com/p-api/home
            </a>
          </p>

          <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
            <div className="space-y-1.5">
              <Label htmlFor="smmo-api-key" className="text-[10px] text-muted-foreground uppercase tracking-wider">
                API Key
              </Label>
              <Input
                id="smmo-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={apiKeyStatus?.hasApiKey ? "Enter a new key to replace" : "Enter API key"}
                className="h-8 text-xs bg-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smmo-player-id" className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Player ID
              </Label>
              <Input
                id="smmo-player-id"
                type="number"
                inputMode="numeric"
                min={1}
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="1143782"
                className="h-8 text-xs bg-input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              size="sm"
              className="h-8 text-xs bg-primary text-primary-foreground"
              onClick={handleValidateApiKey}
              disabled={savingKey}
            >
              {savingKey ? <Loader2 className="size-3 animate-spin" /> : "Validate & Save"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleSyncNow}
              disabled={syncing || !apiKeyStatus?.hasApiKey}
            >
              {syncing ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
              Sync Now
            </Button>
          </div>

          {apiKeyStatus?.hasApiKey && (
            <div className="rounded-lg border border-success/20 bg-success/5 p-3 text-[11px]">
              <div className="flex items-center gap-1.5 font-medium text-success">
                <CheckCircle className="size-3.5" />
                API key configured
              </div>
              <div className="mt-2 grid gap-1 text-muted-foreground sm:grid-cols-2">
                <p>
                  Player ID:{" "}
                  <span className="text-foreground">{apiKeyStatus.smmoPlayerId}</span>
                </p>
                <p>
                  Player:{" "}
                  <span className="text-foreground">{apiKeyStatus.playerName ?? "Pending sync"}</span>
                </p>
                <p>
                  Validated:{" "}
                  <span className="text-foreground">{formatStatusTimestamp(apiKeyStatus.lastValidated)}</span>
                </p>
                <p>
                  Last sync:{" "}
                  <span className="text-foreground">{formatStatusTimestamp(apiKeyStatus.lastSync)}</span>
                </p>
              </div>
            </div>
          )}

          {rateLimit && (
            <div className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1.5 text-[10px] text-muted-foreground">
              <span>
                Rate limit: {rateLimit.remaining}/{rateLimit.limit} requests remaining
              </span>
              {rateLimit.remaining === 0 && (
                <span>Resets {new Date(rateLimit.resetAt).toLocaleTimeString()}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <RefreshCw className="size-4 text-muted-foreground" />
            Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button
            type="button"
            onClick={handleResetData}
            className="w-full flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 text-left"
          >
            <div>
              <p className="font-medium text-xs">Reset Demo Data</p>
              <p className="text-[11px] text-muted-foreground">
                Clear and re-seed all mock game data
              </p>
            </div>
            <ChevronRight className="size-3.5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <User className="size-4 text-muted-foreground" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button
            type="button"
            onClick={() => setChangePasswordOpen(true)}
            className="w-full flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 text-left"
          >
            <div>
              <p className="font-medium text-xs">Change Password</p>
              <p className="text-[11px] text-muted-foreground">Update your password</p>
            </div>
            <ChevronRight className="size-3.5 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteAccountOpen(true)}
            className="w-full flex items-center justify-between rounded-lg border border-destructive/20 p-3 transition-colors hover:bg-destructive/5 text-left"
          >
            <div>
              <p className="font-medium text-xs text-destructive">Delete Account</p>
              <p className="text-[11px] text-muted-foreground">Permanently remove your data</p>
            </div>
            <Trash2 className="size-3.5 text-destructive" />
          </button>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">Change Password</DialogTitle>
            <DialogDescription className="text-xs">
              {passwordStep === "request"
                ? "We'll send a verification code to your email."
                : "Enter the code and your new password."}
            </DialogDescription>
          </DialogHeader>
          {passwordStep === "request" ? (
            <form onSubmit={handleRequestPasswordReset}>
              <p className="text-xs text-muted-foreground py-3">
                Code will be sent to: <span className="font-medium text-foreground">{user?.email}</span>
              </p>
              {error && <p className="text-xs text-destructive bg-destructive/10 rounded px-2 py-1.5 mb-3">{error}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={loading}>
                  {loading && <Loader2 className="size-3 animate-spin" />} Send Code
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-xs">Code</Label>
                <Input id="code" name="code" type="text" placeholder="Enter code" autoComplete="one-time-code" required className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs">New Password</Label>
                <Input id="newPassword" name="newPassword" type="password" placeholder="••••••••" minLength={6} autoComplete="new-password" required className="h-8 text-xs" />
              </div>
              {error && <p className="text-xs text-destructive bg-destructive/10 rounded px-2 py-1.5">{error}</p>}
              {success && <p className="text-xs text-success bg-success/10 rounded px-2 py-1.5">{success}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => { setPasswordStep("request"); setError(""); }}>Back</Button>
                <Button type="submit" size="sm" disabled={loading}>
                  {loading && <Loader2 className="size-3 animate-spin" />} Change Password
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">Delete Account</DialogTitle>
            <DialogDescription className="text-xs">This cannot be undone. All data will be permanently removed.</DialogDescription>
          </DialogHeader>
          {error && <p className="text-xs text-destructive bg-destructive/10 rounded px-2 py-1.5">{error}</p>}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteAccountOpen(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount} disabled={loading}>
              {loading && <Loader2 className="size-3 animate-spin" />} Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
