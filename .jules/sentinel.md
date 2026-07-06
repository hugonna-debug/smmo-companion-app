## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2026-07-06 - [Insecure Direct Object Reference / Broken Access Control in setPriceAlert]
**Vulnerability:** Found `setPriceAlert` used short-circuit logic `userId && item.userId !== userId` which allows unauthenticated users to modify other users' data.
**Learning:** Short-circuit logic can inadvertently allow unauthenticated users to bypass authorization checks.
**Prevention:** Always explicitly check for authentication (`if (!userId) throw new Error("Not authenticated");`) before checking authorization.
