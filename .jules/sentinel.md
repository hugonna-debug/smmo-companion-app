## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## $(date +%Y-%m-%d) - [Missing Authentication and IDOR via Short-Circuit Logic]
**Vulnerability:** Unauthenticated users could bypass authorization checks in `setPriceAlert` due to flawed short-circuit logic `(userId && item.userId !== userId)`. Furthermore, `quickAiSearch` and `generateImage` actions lacked authentication entirely.
**Learning:** Checking ownership with `userId && ...` allows unauthenticated users (`userId === null`) to bypass the check because the left side evaluates to false, skipping the ownership enforcement. Missing authentication on external API integrations allows unauthorized usage.
**Prevention:** In public Convex mutations and actions, explicitly reject unauthenticated users (`if (!userId) throw new Error("Not authenticated");`) *before* performing any database reads, ownership checks, or external API calls.
