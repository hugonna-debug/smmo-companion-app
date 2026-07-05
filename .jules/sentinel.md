## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-05-26 - [Missing Authentication on External API Wrappers]
**Vulnerability:** Found `quickAiSearch` and `generateImage` in `convex/viktorTools.ts` did not check `getAuthUserId(ctx)`, allowing any public user to trigger the backend API calls to Viktor Spaces and potentially exhaust API limits or incur costs.
**Learning:** Convex functions exposed as `action` or `mutation` are publicly accessible by default. Wrapping external API calls without explicit authentication checks can lead to unauthenticated abuse of third-party services.
**Prevention:** Always verify `getAuthUserId(ctx)` at the start of any `action` or `mutation` that wraps external API calls or sensitive logic to ensure only authenticated users can execute them.
