## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## $(date +%Y-%m-%d) - [IDOR via Short-Circuit Logic]
**Vulnerability:** The `setPriceAlert` mutation allowed unauthenticated users to bypass authorization due to short-circuit evaluation (`userId && item.userId !== userId` evaluates to falsy when `userId` is null). This allowed unauthenticated users to modify other users' settings.
**Learning:** In public Convex mutations, always explicitly reject unauthenticated users first before proceeding to perform authorization checks. Short-circuit logic can inadvertently allow unauthorized modifications if not carefully constructed.
**Prevention:** Always include `if (!userId) throw new Error("Not authenticated");` early in public mutations before performing ownership checks (e.g., `item.userId !== userId`).
