## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.

## 2024-05-27 - [Missing Authentication on External Tool Integrations]
**Vulnerability:** Found `quickAiSearch` and `generateImage` in `convex/viktorTools.ts` were publicly exposed without verifying user authentication.
**Learning:** Any function defined as an `action` is exposed directly to clients via the Convex API. These specific actions make calls to an external service (Viktor Spaces API) which likely incurs costs or has rate limits. Unauthenticated endpoints allow attackers to abuse external tool credentials, leading to resource exhaustion, unauthorized access to paid capabilities, or a denial of wallet via API costs.
**Prevention:** In Convex, always explicitly check for user authentication using `getAuthUserId` at the beginning of all public `action` (and `mutation`/`query`) handlers that do not explicitly require anonymous access. Do not rely on external tools to perform user verification on behalf of the application if the request passes through the server.
