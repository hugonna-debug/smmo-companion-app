## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-05-27 - [Insecure Direct Object Reference / Missing Authentication]
**Vulnerability:** Found an IDOR vulnerability in the `setPriceAlert` mutation where a short-circuited check `(userId && item.userId !== userId)` allowed unauthenticated users (where `userId` is null) to bypass ownership verification and modify any price alert tracking if they knew its ID.
**Learning:** Short-circuited logic involving potentially null `userId`s can inadvertently lead to severe access control bypasses. When `userId` is null, the AND condition fails, causing the whole OR check to bypass authorization.
**Prevention:** In public Convex mutations, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks to prevent IDOR vulnerabilities.
