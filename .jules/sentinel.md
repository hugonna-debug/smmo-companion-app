## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-06-18 - [Insecure Direct Object Reference via Convex Short-Circuit Auth Logic]
**Vulnerability:** Found `setPriceAlert` was publicly exposed and used an insecure `if (!item || (userId && item.userId !== userId)) return;` check for authorization without an explicit authentication check first.
**Learning:** In public Convex mutations, short-circuit logic (like checking `userId && item.userId !== userId`) fails open when `userId` is `null` (unauthenticated). If the user isn't authenticated, the check passes, potentially allowing an unauthenticated user to modify data they don't own if they can guess the `trackingId`.
**Prevention:** In public Convex mutations, always explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks to prevent IDOR vulnerabilities.
