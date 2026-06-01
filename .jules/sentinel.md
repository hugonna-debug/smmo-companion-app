## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2026-06-01 - [IDOR in public API ownership check]
**Vulnerability:** Found IDOR bypass via short-circuit logic in public `setPriceAlert` mutation: `if (!item || (userId && item.userId !== userId)) return;`
**Learning:** Unauthenticated calls resulted in `userId` being null, short-circuiting the `item.userId !== userId` check entirely, allowing unauthorized modifications.
**Prevention:** In public Convex mutations, explicitly throw an error (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing object ownership authorization checks to prevent IDOR via falsy values in short-circuit conditions.
