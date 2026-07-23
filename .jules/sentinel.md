## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2025-02-23 - [Insecure Direct Object Reference / Broken Access Control in setPriceAlert]
**Vulnerability:** Found `setPriceAlert` public mutation missing an explicit unauthenticated rejection.
**Learning:** Short-circuit logic like `userId && item.userId !== userId` in authorization checks allows unauthenticated users to bypass the check entirely.
**Prevention:** In public Convex mutations and actions, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks or interacting with external APIs.
