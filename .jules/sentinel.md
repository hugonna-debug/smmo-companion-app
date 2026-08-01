## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2024-05-27 - [Short-Circuit IDOR Vulnerability]
**Vulnerability:** Found `setPriceAlert` mutation bypassed authorization checks for unauthenticated users due to short-circuit evaluation (`userId && item.userId !== userId`).
**Learning:** Short-circuit logic can allow unauthorized actions if the left-hand condition (like `userId`) is falsy and skips the right-hand authorization check.
**Prevention:** In public Convex mutations and actions, explicitly reject unauthenticated users with `if (!userId) throw new Error("Not authenticated");` before executing authorization checks.
