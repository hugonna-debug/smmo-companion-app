## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2024-06-14 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found IDOR vulnerability in the `setPriceAlert` public mutation where the ownership check short-circuited if the user was unauthenticated (`userId` was null). This allowed unauthenticated users to modify any user's alerts.
**Learning:** Short-circuit logic `userId && item.userId !== userId` in public mutations allows unauthenticated requests to bypass authorization logic if `userId` is not explicitly enforced before checking ownership.
**Prevention:** In public Convex mutations, explicitly reject unauthenticated users (`if (!userId) throw new Error("Not authenticated");`) before performing authorization checks to prevent IDOR vulnerabilities caused by short-circuit logic.
