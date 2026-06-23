## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2024-05-26 - [Insecure Direct Object Reference / Missing Auth Check in Convex]
**Vulnerability:** Found `setPriceAlert` was missing strict authentication checks `if (!userId)` and the authorization logic `if (userId && item.userId !== userId)` evaluated to false when `userId` was missing, meaning an unauthenticated user could modify any price alert.
**Learning:** Short-circuiting authorization checks via `userId &&` can lead to bypasses if authentication isn't strictly enforced beforehand. An attacker without an account can hit public endpoints and pass those checks because `undefined && true` is false, meaning the `if` guard doesn't trigger and the execution continues.
**Prevention:** In public Convex mutations, explicitly reject unauthenticated users (`if (!userId) throw new Error("Not authenticated");`) before checking authorization.
