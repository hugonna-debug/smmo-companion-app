## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2025-03-09 - [Missing Authentication on Public Endpoints]
**Vulnerability:** Found `quickAiSearch` and `generateImage` in `convex/viktorTools.ts` missing `getAuthUserId` checks, and `setPriceAlert` in `convex/market.ts` with short-circuit auth logic.
**Learning:** Publicly exposed `action` and `mutation` handlers must always explicitly authenticate users. The pattern `if (!item || (userId && item.userId !== userId))` allows unauthenticated modifications.
**Prevention:** In public Convex mutations and actions, explicitly reject unauthenticated users (`if (!userId) throw new Error("Not authenticated");`) before performing authorization checks or interacting with external APIs to prevent IDOR and unauthorized API usage.
