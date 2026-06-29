## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in setPriceAlert]
**Vulnerability:** Found `setPriceAlert` mutation bypassed authorization checks if the user was unauthenticated, because `!item || (userId && item.userId !== userId)` would short-circuit to false when `userId` was null, allowing modification of other users' price alerts.
**Learning:** Short-circuiting auth checks with `userId && ...` inside public mutations is dangerous. If `userId` is null (unauthenticated user), the condition evaluates to `null` (falsy) instead of `true`, entirely bypassing the ownership check.
**Prevention:** In public Convex mutations and actions, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks or interacting with external APIs.
