## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2026-08-05 - Insecure Authentication Check Allows IDOR
**Vulnerability:** Public mutation `setPriceAlert` used short-circuit logic `(userId && item.userId !== userId)` which bypassed authorization when `userId` was null (unauthenticated).
**Learning:** Short-circuit logic fails open for unauthenticated users, allowing unauthorized state modifications.
**Prevention:** Always explicitly reject unauthenticated users in public mutations (e.g. `if (!userId) throw new Error("Not authenticated");`) before accessing or checking resource ownership.
