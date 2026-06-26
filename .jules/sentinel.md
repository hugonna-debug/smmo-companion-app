## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-06-26 - [Insecure Direct Object Reference via Short-Circuit Auth Bypass]
**Vulnerability:** Found `setPriceAlert` was missing strict authentication, allowing unauthenticated users to modify any item's alerts due to `(userId && item.userId !== userId)` evaluating to false for unauthenticated users.
**Learning:** Short-circuit logic like `userId && item.userId !== userId` is dangerous in public mutations because it evaluates to falsy when `userId` is null, effectively bypassing authorization for unauthenticated attackers.
**Prevention:** In public Convex mutations, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks to prevent IDOR vulnerabilities.
