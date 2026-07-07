## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2024-10-27 - [IDOR in setPriceAlert mutation]
**Vulnerability:** The `setPriceAlert` mutation in `convex/market.ts` lacked a direct check on `userId`. It used a short-circuit logic: `if (!item || (userId && item.userId !== userId)) return;`. When unauthenticated, `userId` is null, rendering the right side of the OR condition false and allowing the mutation to proceed for any `trackingId`.
**Learning:** Short-circuit boolean logic using `userId && ...` fails open when `userId` is null. Unauthenticated requests bypass these checks entirely if not explicitly caught earlier.
**Prevention:** In public Convex mutations and actions, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks or interacting with external APIs.
