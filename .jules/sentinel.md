## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-05-26 - [Insecure Direct Object Reference / Missing Authentication]
**Vulnerability:** Found `setPriceAlert` mutation missing strict authentication before authorization check (`userId && item.userId !== userId`), allowing unauthenticated IDOR if a tracking item id was known/guessed.
**Learning:** In public Convex mutations, explicitly rejecting unauthenticated users (`if (!userId) throw new Error("Not authenticated");`) is required to prevent bypasses where `userId` is null, which can cause short-circuited checks like `userId && item.userId !== userId` to pass maliciously.
**Prevention:** Always ensure an explicit authentication check throws an error before proceeding with business logic and authorization in public API endpoints.
