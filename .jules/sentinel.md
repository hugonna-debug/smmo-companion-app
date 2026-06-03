## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-06-03 - [IDOR via Unauthenticated Short-Circuit Logic]
**Vulnerability:** Found `setPriceAlert` mutation permitted IDOR because it allowed unauthenticated requests (`userId` is null) to bypass ownership validation via the short-circuit condition `if (!item || (userId && item.userId !== userId)) return;`.
**Learning:** Checking for `userId` presence inside an OR/AND condition instead of enforcing authentication globally in a public mutation creates an IDOR bypass for unauthenticated users when modifying resources.
**Prevention:** In public Convex mutations, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) before performing authorization checks to prevent IDOR vulnerabilities.
