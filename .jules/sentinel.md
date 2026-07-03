## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-10-24 - Fix Auth Bypass IDOR and Unauthorized API Usage
**Vulnerability:** Public mutations and actions used short-circuit logic (`userId && item.userId !== userId`) or lacked user validation, leading to IDOR and unauthorized API access.
**Learning:** Unauthenticated requests yield a null `userId`, passing falsy short-circuit checks and exposing endpoints to unauthorized actors.
**Prevention:** Explicitly reject unauthenticated users with `if (!userId) throw new Error("Not authenticated");` before authorization logic or API calls.
