## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2024-05-26 - [IDOR in public mutations via short-circuit logic]
**Vulnerability:** Found `setPriceAlert` publicly exposed with a short-circuit auth check `if (!item || (userId && item.userId !== userId))`.
**Learning:** This short-circuit logic allows unauthenticated users (`userId` is null) to bypass the ownership check entirely, leading to IDOR.
**Prevention:** In public Convex mutations and actions, explicitly reject unauthenticated users (`if (!userId) throw new Error("Not authenticated");`) before performing authorization checks or interacting with external APIs.
