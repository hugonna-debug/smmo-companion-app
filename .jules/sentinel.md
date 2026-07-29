## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2025-02-27 - IDOR via short-circuit evaluation
**Vulnerability:** Unauthenticated users could modify any user's price alerts due to a short-circuit logic flaw: `(userId && item.userId !== userId)`.
**Learning:** If `userId` is null, the condition evaluates to falsy, bypassing the authorization check and allowing unauthorized edits.
**Prevention:** In public Convex mutations and actions, explicitly reject unauthenticated users (`if (!userId) throw new Error("Not authenticated");`) before performing authorization checks.
