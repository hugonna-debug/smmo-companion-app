import { useMutation, useQuery } from "convex/react";
import {
  Brain,
  Send,
  Trash2,
  Sparkles,
  User,
  Bot,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const QUICK_PROMPTS = [
  { label: "Build Advice", icon: "⚔️", category: "build", prompt: "Analyze my current build and suggest stat allocation priorities." },
  { label: "War Strategy", icon: "🏰", category: "war", prompt: "What's the best PvP strategy for The Deers given our current wars?" },
  { label: "Market Tips", icon: "💰", category: "market", prompt: "Which items should I buy or sell based on current market trends?" },
  { label: "Daily Plan", icon: "📋", category: "general", prompt: "Create an optimal daily routine for maximizing my progression." },
];

export function AiAdvisorPage() {
  const messages = useQuery(api.gameData.getAiAdvisorMessages);
  const player = useQuery(api.gameData.getPlayerData);
  const addMessage = useMutation(api.gameData.addAiAdvisorMessage);
  const clearMessages = useMutation(api.gameData.clearAiAdvisorMessages);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;
    setInput("");

    // Add user message
    await addMessage({
      role: "user",
      content,
      category: selectedCategory ?? "general",
    });

    // Simulate AI thinking (in real version, this calls Gemini/OpenAI)
    setIsThinking(true);
    setTimeout(async () => {
      const response = generateMockResponse(content, player);
      await addMessage({
        role: "assistant",
        content: response,
        category: selectedCategory ?? "general",
      });
      setIsThinking(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (messages === undefined || player === undefined) {
    return (
      <div className="p-3 md:p-4 space-y-3">
        <div className="h-6 w-40 rounded bg-muted animate-pulse" />
        <div className="game-card h-16 animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={`askel-${i}`} className="game-card h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  const chatMessages = messages.filter(m => m.role !== "system")
    .sort((a, b) => a.timestamp - b.timestamp);
  const systemMsg = messages.find(m => m.role === "system");

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-4xl flex flex-col" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="size-5 text-chart-5" />
          <h1 className="text-lg font-bold">AI Advisor</h1>
          <Badge variant="outline" className="text-[9px] border-chart-5/30 text-chart-5">
            <Sparkles className="size-2.5 mr-0.5" />
            Gemini + GPT
          </Badge>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[10px] text-muted-foreground hover:text-destructive"
            onClick={() => clearMessages()}
          >
            <Trash2 className="size-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Player context card */}
      {player && (
        <div className="game-card bg-chart-5/5 border-chart-5/20">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="size-3 text-chart-5" />
            <span className="text-[10px] text-chart-5 font-medium uppercase tracking-wider">Advisor Context</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
            <span>⚔ STR {(player.totalStr ?? 0).toLocaleString()}</span>
            <span>🛡 DEF {player.totalDef ?? 0}</span>
            <span>🏃 DEX {(player.totalDex ?? 0).toLocaleString()}</span>
            <span>Lv. {player.level.toLocaleString()}</span>
            <span className="text-primary/70">⚜ {player.guildName}</span>
          </div>
        </div>
      )}

      {/* Quick prompts */}
      {chatMessages.length === 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground">Quick questions:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                type="button"
                className="game-card text-left hover:border-chart-5/30 transition-colors"
                onClick={() => {
                  setSelectedCategory(qp.category);
                  handleSend(qp.prompt);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{qp.icon}</span>
                  <div>
                    <p className="text-xs font-medium">{qp.label}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{qp.prompt}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {systemMsg && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-chart-5/5 border border-chart-5/10">
            <Bot className="size-3.5 text-chart-5 shrink-0" />
            <p className="text-[10px] text-chart-5/80">{systemMsg.content}</p>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div
            key={msg._id}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="size-7 rounded-full bg-chart-5/10 flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="size-3.5 text-chart-5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/80 border border-border"
              }`}
            >
              <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <div className="flex items-center gap-2 mt-1">
                {msg.category && msg.category !== "general" && (
                  <Badge variant="outline" className={`text-[8px] h-4 ${
                    msg.role === "user" ? "border-primary-foreground/30 text-primary-foreground/70" : "border-border"
                  }`}>
                    {getCategoryIcon(msg.category)} {msg.category}
                  </Badge>
                )}
                <span className={`text-[9px] ${
                  msg.role === "user" ? "text-primary-foreground/50" : "text-muted-foreground/50"
                }`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
            {msg.role === "user" && (
              <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <User className="size-3.5 text-primary" />
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-2 justify-start">
            <div className="size-7 rounded-full bg-chart-5/10 flex items-center justify-center shrink-0 mt-0.5">
              <Brain className="size-3.5 text-chart-5" />
            </div>
            <div className="bg-secondary/80 border border-border rounded-xl px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Loader2 className="size-3 text-chart-5 animate-spin" />
                <span className="text-[11px] text-muted-foreground">Analyzing your stats...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Category selector */}
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {[
          { key: null, label: "General", icon: "💬" },
          { key: "build", label: "Build", icon: "⚔️" },
          { key: "war", label: "War", icon: "🏰" },
          { key: "market", label: "Market", icon: "💰" },
        ].map((cat) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === cat.key
                ? "bg-chart-5/10 text-chart-5 border border-chart-5/20"
                : "text-muted-foreground hover:text-foreground bg-secondary/30"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI advisor anything about your SMMO strategy..."
            rows={1}
            className="w-full text-xs bg-input border border-border rounded-lg px-3 py-2 pr-10 resize-none focus:outline-none focus:ring-1 focus:ring-chart-5 min-h-[36px] max-h-[100px]"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-chart-5 hover:bg-chart-5/10"
            onClick={() => handleSend()}
            disabled={!input.trim() || isThinking}
          >
            <Send className="size-3.5" />
          </Button>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Mock responses · Connect Gemini & OpenAI API keys for real AI analysis
      </p>
    </div>
  );
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case "build": return "⚔️";
    case "war": return "🏰";
    case "market": return "💰";
    default: return "💬";
  }
}

function generateMockResponse(question: string, player: any): string {
  const q = question.toLowerCase();

  if (q.includes("build") || q.includes("stat") || q.includes("str") || q.includes("dex")) {
    return `Based on your current stats (${(player?.totalStr ?? 52400).toLocaleString()} STR, ${player?.totalDef ?? 5} DEF, ${(player?.totalDex ?? 6950).toLocaleString()} DEX):\n\n**Recommendation:**\n• Your STR is in the Top 0.57% — incredible for a Warrior build\n• DEF at 5 is a full glass cannon. Consider investing 200-500 points for survivability\n• DEX at 6,950 gives solid dodge — keep building this after hitting 55K STR\n\n**Priority:** STR to 55K → DEX to 8K → DEF to 500\n\nYour spATK +107% with Mortem worship is optimal for your build.`;
  }

  if (q.includes("war") || q.includes("pvp") || q.includes("guild")) {
    return `**War Strategy for The Deers:**\n\n1. **Priority Targets:** Focus on Dark Knights (2,341 vs 1,876) — we're ahead, push the lead\n2. **Cult of Cthulhu** (1,567 vs 1,890) — we're behind, rally guild members\n3. **Shadow Realm** (3,421 vs 3,398) — razor thin margin, this is the decisive war\n\n**Your Role:** With 52.4K STR, target their members with <40K STR for reliable kills. Avoid safe mode players.\n\n**Rate Limit:** Stay under 40 req/min to avoid API throttling.`;
  }

  if (q.includes("market") || q.includes("buy") || q.includes("sell") || q.includes("price")) {
    return `**Market Analysis:**\n\n📈 **Rising:** The Stick (+8.3% this week) — good to hold\n📈 **Rising:** Emeris (+7.4%) — extremely rare, only 8 in circulation\n📉 **Dipping:** Dragon King Shield (-6.5%) — potential buy opportunity below 250M\n\n**Tip:** Your Damaged Archdemon Amulet (Str) is trending up. Consider buying a second one for storage.\n\n**Diamond Market:** Best rate is 15M/diamond from DiamondDealer. Consider stocking up.`;
  }

  if (q.includes("daily") || q.includes("routine") || q.includes("plan")) {
    return `**Optimal Daily Plan for The Guy:**\n\n🌅 **Morning:**\n• Worship Mortem (2/2 daily) → +20% STR buff\n• Complete daily quest\n• Run PvP queue (high-priority targets)\n\n⚔️ **Midday:**\n• Hit world bosses (Frost Wyrm at 16% HP — finish it!)\n• Treasure Hunting runs (your highest skill at Lv.124)\n• Check market for deals\n\n🌙 **Evening:**\n• Guild war contributions (focus Cult of Cthulhu)\n• Mining/Crafting sessions\n• Vault code check\n\n**EP Management:** Use 500 EP across top priorities. PvP + bosses first.`;
  }

  return `I've analyzed your question in the context of your profile:\n\n• **Level:** ${(player?.level ?? 29727).toLocaleString()} (${player?.playerClass ?? "Warrior"})\n• **Guild:** ${player?.guildName ?? "The Deers"}\n• **Key Strength:** Top 0.57% STR with ${(player?.totalStr ?? 52400).toLocaleString()} total\n\nCould you be more specific? I can help with:\n• **Build optimization** — stat allocation, gear upgrades\n• **War strategy** — PvP targets, guild coordination\n• **Market analysis** — buy/sell timing, price trends\n• **Daily planning** — EP usage, progression priorities`;
}
