## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2025-02-23 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `if (!item || (userId && item.userId !== userId)) return;` in public mutations allowing unauthenticated IDOR.
**Learning:** Short-circuit logic checking `userId && ...` allows unauthenticated requests (where `userId` is null) to bypass authorization checks entirely in public mutations.
**Prevention:** In public Convex mutations, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks to prevent IDOR vulnerabilities.
