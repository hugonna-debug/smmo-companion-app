## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-07-31 - [IDOR in public mutations via short-circuit logic]
**Vulnerability:** The public `setPriceAlert` mutation allowed unauthenticated users to modify any user's market tracking alerts due to flawed short-circuit logic (`!item || (userId && item.userId !== userId)`).
**Learning:** Using `userId && ...` logic for authorization bypasses the check entirely if the user is unauthenticated (null), exposing the mutation to IDOR attacks. This is only safe in internal background jobs.
**Prevention:** In public Convex mutations and actions, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks.
