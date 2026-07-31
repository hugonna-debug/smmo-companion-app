## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-08-01 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `setPriceAlert` in `convex/market.ts` allowed unauthenticated IDOR by incorrectly bypassing the `userId` check (e.g. `if (userId && item.userId !== userId) return;`).
**Learning:** Short-circuit logic such as `userId && item.userId !== userId` fails open if `userId` is not present, allowing an unauthenticated attacker to manipulate items belonging to other users.
**Prevention:** In public Convex mutations and actions, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks.
