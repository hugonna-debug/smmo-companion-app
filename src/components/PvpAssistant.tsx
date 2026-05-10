import { useMemo, useState } from "react";
import { defaultFilters, mockTargets } from "../data/defaultSettings";
import { filterTargets, getNextTarget } from "../services/targetQueue";
import type {
  BlacklistState,
  PvpFilters,
  PvpSessionLogEntry,
  PvpTarget
} from "../types";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createLog(
  type: PvpSessionLogEntry["type"],
  message: string
): PvpSessionLogEntry {
  return {
    id: createId(),
    createdAt: new Date().toLocaleTimeString(),
    type,
    message
  };
}

export function PvpAssistant() {
  const [filters, setFilters] = useState<PvpFilters>(defaultFilters);
  const [blacklist, setBlacklist] = useState<BlacklistState>({
    playerIds: [],
    guildNames: []
  });
  const [recentlySkippedIds, setRecentlySkippedIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<PvpSessionLogEntry[]>([
    createLog("info", "Prototype loaded with mock targets only.")
  ]);

  const validTargets = useMemo(
    () => filterTargets(mockTargets, filters, blacklist, recentlySkippedIds),
    [filters, blacklist, recentlySkippedIds]
  );

  const currentTarget = getNextTarget(validTargets);

  function addLog(type: PvpSessionLogEntry["type"], message: string): void {
    setLogs((current) => [createLog(type, message), ...current].slice(0, 50));
  }

  function updateFilterNumber(key: keyof PvpFilters, value: string): void {
    const nextValue = Number(value);

    setFilters((current) => ({
      ...current,
      [key]: Number.isFinite(nextValue) ? nextValue : 0
    }));
  }

  function updateFilterBoolean(key: keyof PvpFilters, value: boolean): void {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  }

  function resetSession(): void {
    setRecentlySkippedIds([]);
    setBlacklist({
      playerIds: [],
      guildNames: []
    });
    setLogs([createLog("info", "Session reset. Mock targets restored.")]);
  }

  function skipTarget(target: PvpTarget): void {
    setRecentlySkippedIds((current) => [...new Set([target.id, ...current])]);
    addLog("skip", `Skipped ${target.name}.`);
  }

  function blacklistPlayer(target: PvpTarget): void {
    setBlacklist((current) => ({
      ...current,
      playerIds: [...new Set([target.id, ...current.playerIds])]
    }));

    addLog("blacklist", `Blacklisted player ${target.name}.`);
  }

  function blacklistGuild(target: PvpTarget): void {
    const guildName = target.guildName;

    if (!guildName) {
      addLog("error", "This target has no guild name to blacklist.");
      return;
    }

    setBlacklist((current) => ({
      ...current,
      guildNames: [...new Set([guildName, ...current.guildNames])]
    }));

    addLog("blacklist", `Blacklisted guild ${guildName}.`);
  }

  function stopSession(): void {
    addLog("info", "PvP target session stopped. No background action is running.");
  }

  function openTarget(target: PvpTarget): void {
    if (!target.profileUrl) {
      addLog(
        "info",
        `No real profile URL is configured for ${target.name}. Manual action only.`
      );
      return;
    }

    window.open(target.profileUrl, "_blank", "noopener,noreferrer");
    addLog("info", `Opened profile for ${target.name}. Manual action required.`);
  }

  return (
    <section className="panel">
      <h2>PvP Target Assistant</h2>
      <p className="muted">
        Mock-data prototype. This UI is for planning the manual target flow.
        Real API integration is intentionally disabled.
      </p>

      <div className="grid two">
        <div>
          <h3>Filters</h3>

          <div className="form-row">
            <label htmlFor="minLevel">Minimum level</label>
            <input
              id="minLevel"
              type="number"
              min="1"
              value={filters.minLevel}
              onChange={(event) =>
                updateFilterNumber("minLevel", event.target.value)
              }
            />
          </div>

          <div className="form-row">
            <label htmlFor="maxLevel">Maximum level</label>
            <input
              id="maxLevel"
              type="number"
              min="1"
              value={filters.maxLevel}
              onChange={(event) =>
                updateFilterNumber("maxLevel", event.target.value)
              }
            />
          </div>

          <div className="form-row">
            <label htmlFor="minHealthPercent">Minimum health percent</label>
            <input
              id="minHealthPercent"
              type="number"
              min="0"
              max="100"
              value={filters.minHealthPercent}
              onChange={(event) =>
                updateFilterNumber("minHealthPercent", event.target.value)
              }
            />
          </div>

          <div className="form-row">
            <label htmlFor="maxHealthPercent">Maximum health percent</label>
            <input
              id="maxHealthPercent"
              type="number"
              min="0"
              max="100"
              value={filters.maxHealthPercent}
              onChange={(event) =>
                updateFilterNumber("maxHealthPercent", event.target.value)
              }
            />
          </div>

          <div className="form-row">
            <label>
              <input
                type="checkbox"
                checked={filters.excludeBlacklistedPlayers}
                onChange={(event) =>
                  updateFilterBoolean(
                    "excludeBlacklistedPlayers",
                    event.target.checked
                  )
                }
              />{" "}
              Exclude blacklisted players
            </label>
          </div>

          <div className="form-row">
            <label>
              <input
                type="checkbox"
                checked={filters.excludeBlacklistedGuilds}
                onChange={(event) =>
                  updateFilterBoolean(
                    "excludeBlacklistedGuilds",
                    event.target.checked
                  )
                }
              />{" "}
              Exclude blacklisted guilds
            </label>
          </div>

          <div className="form-row">
            <label>
              <input
                type="checkbox"
                checked={filters.excludeRecentlySkipped}
                onChange={(event) =>
                  updateFilterBoolean(
                    "excludeRecentlySkipped",
                    event.target.checked
                  )
                }
              />{" "}
              Exclude recently skipped targets
            </label>
          </div>

          <div className="button-row">
            <button className="secondary" type="button" onClick={resetSession}>
              Reset Mock Session
            </button>
            <button className="danger" type="button" onClick={stopSession}>
              Stop
            </button>
          </div>
        </div>

        <div>
          <h3>Current Target</h3>

          {currentTarget ? (
            <article className="target-card">
              <h3>{currentTarget.name}</h3>

              <ul className="stat-list">
                <li>
                  <span>ID</span>
                  <strong>{currentTarget.id}</strong>
                </li>
                <li>
                  <span>Level</span>
                  <strong>{currentTarget.level}</strong>
                </li>
                <li>
                  <span>Health</span>
                  <strong>{currentTarget.healthPercent}%</strong>
                </li>
                <li>
                  <span>Guild</span>
                  <strong>{currentTarget.guildName || "Unknown"}</strong>
                </li>
                <li>
                  <span>Last checked</span>
                  <strong>
                    {new Date(currentTarget.lastCheckedAt).toLocaleTimeString()}
                  </strong>
                </li>
              </ul>

              {currentTarget.notes ? (
                <p className="muted">{currentTarget.notes}</p>
              ) : null}

              <div className="button-row">
                <button type="button" onClick={() => openTarget(currentTarget)}>
                  Open Target
                </button>
                <button
                  className="secondary"
                  type="button"
                  onClick={() => skipTarget(currentTarget)}
                >
                  Next Target
                </button>
                <button
                  className="secondary"
                  type="button"
                  onClick={() => blacklistPlayer(currentTarget)}
                >
                  Blacklist Player
                </button>
                <button
                  className="secondary"
                  type="button"
                  onClick={() => blacklistGuild(currentTarget)}
                >
                  Blacklist Guild
                </button>
              </div>
            </article>
          ) : (
            <div className="target-card">
              <h3>No valid target</h3>
              <p className="muted">
                No mock target matches the current filters, skipped list, or
                blacklist settings.
              </p>
              <button className="secondary" type="button" onClick={resetSession}>
                Reset Mock Session
              </button>
            </div>
          )}
        </div>
      </div>

      <section>
        <h3>Session Summary</h3>
        <ul className="stat-list">
          <li>
            <span>Valid mock targets</span>
            <strong>{validTargets.length}</strong>
          </li>
          <li>
            <span>Skipped targets</span>
            <strong>{recentlySkippedIds.length}</strong>
          </li>
          <li>
            <span>Blacklisted players</span>
            <strong>{blacklist.playerIds.length}</strong>
          </li>
          <li>
            <span>Blacklisted guilds</span>
            <strong>{blacklist.guildNames.length}</strong>
          </li>
        </ul>
      </section>

      <section>
        <h3>Session Log</h3>
        <div className="log" aria-live="polite">
          {logs.map((log) => (
            <p key={log.id}>
              [{log.createdAt}] {log.type.toUpperCase()}: {log.message}
            </p>
          ))}
        </div>
      </section>
    </section>
  );
}
