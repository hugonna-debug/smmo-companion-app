## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-08-01 - [Short-circuit authorization bypass]
**Vulnerability:** Found setPriceAlert mutation bypassed authorization checks for unauthenticated users due to userId && item.userId !== userId short-circuit logic.
**Learning:** In public Convex mutations and actions, explicitly rejecting unauthenticated users prevents IDOR vulnerabilities caused by short-circuit logic.
**Prevention:** In public Convex mutations and actions, explicitly reject unauthenticated users before performing authorization checks.
