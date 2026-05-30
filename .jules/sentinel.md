## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-05-27 - [IDOR in public mutations via short-circuit logic]
**Vulnerability:** Found `setPriceAlert` public mutation in `convex/market.ts` vulnerable to IDOR due to improper authorization check: `!item || (userId && item.userId !== userId)`.
**Learning:** If `userId` is `null` (unauthenticated user), the right side of the OR condition evaluates to `null`, allowing the check to pass and unauthorized modifications to occur.
**Prevention:** Always explicitly check for authentication and throw an error or return early before performing authorization checks: `if (!userId) throw new Error("Not authenticated");`.
