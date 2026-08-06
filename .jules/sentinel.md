## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-05-27 - [IDOR Vulnerability in Public Mutations]
**Vulnerability:** Found `setPriceAlert` allowed unauthenticated IDOR modification via short-circuit auth checks (`userId && item.userId !== userId`).
**Learning:** Public mutations that accept arbitrary user input or IDs must explicitly reject unauthenticated users (`if (!userId) throw new Error("Not authenticated");`) before checking authorization, to avoid bypasses if `userId` is missing/null.
**Prevention:** In Convex, explicitly validate `userId` existence in public mutations/actions before proceeding with execution.
