## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2026-06-09 - [IDOR via Short-Circuit Authorization Checks]
**Vulnerability:** Found `setPriceAlert` checking `!item || (userId && item.userId !== userId)`. This short-circuit logic allows an unauthenticated user (where `userId` is null) to bypass the `item.userId !== userId` check, causing IDOR as they can manipulate items that do not belong to them.
**Learning:** Checking for an unauthenticated user inside a generic check using `userId && ...` can lead to the check succeeding when it shouldn't, exposing IDOR vulnerabilities for public endpoints.
**Prevention:** In public Convex mutations, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks to prevent IDOR vulnerabilities.
