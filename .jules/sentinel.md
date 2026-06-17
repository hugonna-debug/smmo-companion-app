## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-06-17 - IDOR Bypass
**Vulnerability:** IDOR (Short-Circuit Logic Bypass)
**Learning:** In `convex/market.ts`, authorization used a short-circuit bypass `(userId && item.userId !== userId)`, which allowed unauthenticated users (where `userId` is null) to mutate `setPriceAlert`.
**Prevention:** Avoid short-circuit logic for authorization; explicitly assert `if (!userId) throw new Error("Not authenticated");` prior to ownership checks.
