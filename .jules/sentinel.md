## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2024-05-27 - [Broken Access Control via Short-Circuiting in Convex Mutations]
**Vulnerability:** Found `setPriceAlert` allowed unauthenticated users to modify any user's alerts due to `if (!item || (userId && item.userId !== userId)) return;` bypassing the ownership check when `userId` is null.
**Learning:** Checking ownership with `userId && ...` can lead to fail-open logic where unauthenticated requests skip validation.
**Prevention:** In public Convex mutations, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks.
