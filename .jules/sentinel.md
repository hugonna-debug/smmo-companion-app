## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2024-06-16 - [IDOR / Logic Flaw in Authorization Check]
**Vulnerability:** Found  mutation used short-circuit logic `userId && item.userId !== userId` allowing unauthenticated users (`userId` is null/falsy) to bypass the ownership check entirely and modify items belonging to other users.
**Learning:** Checking ownership after checking if a user exists with `&&` logic allows unauthenticated requests to slip through if the unauthenticated user check is not handled strictly first.
**Prevention:** In public Convex mutations, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) BEFORE performing any authorization checks to prevent IDOR vulnerabilities caused by short-circuit logic.
## 2024-06-16 - [IDOR / Logic Flaw in Authorization Check]
**Vulnerability:** Found `setPriceAlert` mutation used short-circuit logic `userId && item.userId !== userId` allowing unauthenticated users (`userId` is null/falsy) to bypass the ownership check entirely and modify items belonging to other users.
**Learning:** Checking ownership after checking if a user exists with `&&` logic allows unauthenticated requests to slip through if the unauthenticated user check is not handled strictly first.
**Prevention:** In public Convex mutations, explicitly reject unauthenticated users (e.g., `if (!userId) throw new Error("Not authenticated");`) BEFORE performing any authorization checks to prevent IDOR vulnerabilities caused by short-circuit logic.
