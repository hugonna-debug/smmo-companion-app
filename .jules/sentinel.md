## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-07-03 - [IDOR in setPriceAlert via short-circuit auth check]
**Vulnerability:** The public `setPriceAlert` mutation allowed unauthenticated users to modify any user's price alerts because the authorization check `if (!item || (userId && item.userId !== userId))` bypassed the check when `userId` was null.
**Learning:** Short-circuit logic checking `userId &&` before authorization condition allows unauthenticated access if the `userId` null check is missing in public API routes.
**Prevention:** In public Convex mutations and actions, explicitly reject unauthenticated users (`if (!userId) throw new Error("Not authenticated");`) before performing authorization checks to prevent IDOR vulnerabilities.
