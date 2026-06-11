## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2024-05-27 - [IDOR / Authentication Bypass via Short-circuit Logic]
**Vulnerability:** Found `setPriceAlert` public mutation in `convex/market.ts` allowed unauthenticated users to bypass authorization checks due to weak condition logic: `if (!item || (userId && item.userId !== userId)) return;`. This logic passes when `userId` is `null`.
**Learning:** Short-circuit logic checking authentication and ownership in a single condition can silently skip checks for unauthenticated requests, leading to IDOR.
**Prevention:** In public endpoints, always reject unauthenticated requests explicitly (`if (!userId) throw new Error("Not authenticated");`) before attempting to validate resource ownership.
