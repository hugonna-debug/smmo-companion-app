## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-05-26 - [Authentication Bypass IDOR in setPriceAlert]
**Vulnerability:** Found `setPriceAlert` used short-circuit logic `!item || (userId && item.userId !== userId)` which allowed unauthenticated users (where userId is null) to bypass the condition and modify any item's price alert.
**Learning:** In Convex public mutations, always explicitly check for authentication (`if (!userId) throw new Error("Not authenticated");`) before evaluating ownership to avoid logic flaws.
**Prevention:** Avoid short-circuit logic with optional user IDs in authorization checks unless explicitly intended for internal/background jobs.
