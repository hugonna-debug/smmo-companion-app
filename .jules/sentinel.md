## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-07-27 - [IDOR vulnerability due to Short-Circuit Authentication Check]
**Vulnerability:** Found `setPriceAlert` allowed unauthenticated users to modify other users' price alerts due to a flawed check: `if (!item || (userId && item.userId !== userId)) return;`.
**Learning:** Short-circuit logic like `userId && ...` evaluates to false/falsy when `userId` is null (unauthenticated). If this condition is used to block access (e.g. `if (bad_condition) return;`), an unauthenticated request bypasses the block because the short-circuit makes the entire condition false.
**Prevention:** In public Convex mutations and actions, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks or interacting with external APIs.
