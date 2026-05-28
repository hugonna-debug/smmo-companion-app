## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `setPriceAlert` mutation permitted unauthenticated users to update any user's tracked item because of the faulty conditional check `!item || (userId && item.userId !== userId)`.
**Learning:** Short-circuit evaluation relying on optional `userId` context allows unauthenticated users to bypass checks if explicitly returning on false instead of true.
**Prevention:** In Convex mutations, explicitly check if the user is authenticated with `if (!userId) return;` before proceeding to other authorization checks.
