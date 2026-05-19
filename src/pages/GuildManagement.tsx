import { useAction, useMutation, useQuery } from "convex/react";
import {
  Bell,
  Loader2,
  RefreshCw,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../convex/_generated/api";

export function GuildManagement() {
  const settings = useQuery(api.guild.getSettings);
  const updateSettings = useMutation(api.guild.updateSettings);
  const syncMembers = useAction(api.guild.syncMembers);

  const [guildId, setGuildId] = useState("");
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [milestones, setMilestones] = useState<string[]>([]);

  const handleUpdateSettings = async () => {
    setIsUpdating(true);
    try {
      await updateSettings({
        guildId: guildId ? parseInt(guildId, 10) : undefined,
        discordWebhookUrl: discordWebhookUrl || undefined,
      });
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSyncMembers = async () => {
    setIsSyncing(true);
    try {
      const result = await syncMembers();
      setMilestones(result.milestones);
      toast.success(
        `Sync complete! Found ${result.memberCount} members and ${result.milestones.length} milestones.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sync failed");
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Pre-fill state when settings load
  useEffect(() => {
    if (settings) {
      if (settings.guildId && !guildId) setGuildId(settings.guildId.toString());
      if (settings.discordWebhookUrl && !discordWebhookUrl)
        setDiscordWebhookUrl(settings.discordWebhookUrl);
    }
  }, [settings, guildId, discordWebhookUrl]);

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="size-6 text-primary" />
            Guild Management
          </h1>
          <p className="text-muted-foreground">
            Configure guild sync and Discord notifications
          </p>
        </div>
        <Button
          onClick={handleSyncMembers}
          disabled={isSyncing || !settings?.guildId}
          className="gap-2"
        >
          {isSyncing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Sync Now
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="size-5" />
              Guild Configuration
            </CardTitle>
            <CardDescription>
              Set your guild ID to track member progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guildId">Guild ID</Label>
              <Input
                id="guildId"
                placeholder="e.g. 1234"
                value={guildId}
                onChange={e => setGuildId(e.target.value)}
              />
            </div>
            <Button
              onClick={handleUpdateSettings}
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating && <Loader2 className="size-4 animate-spin mr-2" />}
              Save Configuration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="size-5" />
              Discord Integration
            </CardTitle>
            <CardDescription>
              Get notified when members reach milestones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook">Discord Webhook URL</Label>
              <Input
                id="webhook"
                placeholder="https://discord.com/api/webhooks/..."
                value={discordWebhookUrl}
                onChange={e => setDiscordWebhookUrl(e.target.value)}
              />
            </div>
            <Button
              onClick={handleUpdateSettings}
              disabled={isUpdating}
              variant="secondary"
              className="w-full"
            >
              Update Webhook
            </Button>
          </CardContent>
        </Card>
      </div>

      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="size-5" />
              Recent Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {milestones.map((m, i) => (
                <li key={i} className="p-3 bg-muted rounded-lg text-sm">
                  {m}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {settings?.lastSyncAt && (
        <p className="text-center text-xs text-muted-foreground">
          Last synced: {new Date(settings.lastSyncAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
