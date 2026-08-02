## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-08-02 - IDOR via Short-Circuit Auth Logic
**Vulnerability:** Public mutation `setPriceAlert` used short-circuit logic `if (!item || (userId && item.userId !== userId))` allowing unauthenticated users (where `userId` is null) to bypass authorization and modify any item.
**Learning:** Falsy checks on `userId` in `&&` conditions fail open for unauthenticated users in public mutations.
**Prevention:** Explicitly reject unauthenticated users (`if (!userId) throw new Error("Not authenticated");`) at the start of all public mutations/actions.
