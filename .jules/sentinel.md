## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2025-05-30 - [IDOR / Broken Access Control in Public Mutations]
**Vulnerability:** Found `setPriceAlert` used short-circuit logic (`userId && item.userId !== userId`) which allowed unauthenticated users to bypass authorization checks.
**Learning:** In public Convex mutations, compound checks using `userId && ...` evaluate to falsy when unauthenticated, failing open instead of secure.
**Prevention:** Explicitly reject unauthenticated users (`if (!userId) throw new Error("Not authenticated");`) *before* performing ownership authorization checks.
