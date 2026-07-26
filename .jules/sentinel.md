## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2026-07-26 - [IDOR Vulnerability in public mutation]
**Vulnerability:** Found `setPriceAlert` public mutation in Convex allowed unauthorized modification of price alerts due to short-circuit logic `(userId && item.userId !== userId)`.
**Learning:** Public mutations that do not explicitly reject unauthenticated users first can be exploited if the subsequent authorization checks short-circuit on null user IDs, allowing unauthorized writes.
**Prevention:** Explicitly reject unauthenticated users (`if (!userId) throw new Error("Not authenticated");`) before interacting with databases or APIs in public mutations or actions.
