## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2025-05-15 - Missing Authentication and IDOR on Public Actions/Mutations
**Vulnerability:** Found `setPriceAlert` using short-circuit auth check `if (!item || (userId && item.userId !== userId))` allowing unauthenticated users to modify data if `userId` was null (IDOR). Also found `quickAiSearch` and `generateImage` actions missing authentication entirely, allowing unauthorized usage of external APIs.
**Learning:** In public Convex mutations and actions, unauthenticated requests result in a `null` userId. Using conditional checks like `userId && ...` bypasses the check for unauthenticated users, leading to IDOR. External API calls must always be protected.
**Prevention:** Explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) at the very beginning of all public actions and mutations before interacting with the database or external APIs.
