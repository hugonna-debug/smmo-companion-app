## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-06-09 - [IDOR vulnerability via short-circuit auth checks]
**Vulnerability:** Found `setPriceAlert` allowed unauthenticated users to patch any `marketTracking` item because `if (!item || (userId && item.userId !== userId)) return;` allows execution to proceed when `userId` is `null`.
**Learning:** Short-circuit logic checking `userId &&` inside a public mutation bypasses authorization entirely when unauthenticated because the condition evaluates to falsy, thus skipping the `return`.
**Prevention:** In public Convex mutations, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks to prevent IDOR vulnerabilities.
