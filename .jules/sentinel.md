## 2024-05-26 - [Insecure Direct Object Reference / Broken Access Control in Convex]
**Vulnerability:** Found `updatePriceHistory`, `updateCirculationInternal` and `processAndQueueTargets` were publicly exposed as `mutation` instead of `internalMutation`.
**Learning:** Any function defined as `mutation` or `query` is exposed directly to clients via Convex API. This can allow users to bypass business logic and authorization if internal functions are incorrectly defined.
**Prevention:** In Convex, ensure internal-only functions use `internalMutation`, `internalQuery`, or `internalAction` to prevent unintended public API exposure and IDOR vulnerabilities.
## 2024-05-24 - Data Retention Vulnerability in Account Deletion
**Vulnerability:** The `deleteAccount` mutation only removed user authentication data and API keys, leaving all associated personal game data orphaned in the database.
**Learning:** Hard-coded table deletions in multiple places (like `deleteAccount` and `clearUserData`) lead to data retention vulnerabilities when new tables are added or logic is inconsistent.
**Prevention:** Ensure account deletion flows comprehensively sweep all user-associated tables. Consider extracting a single source-of-truth list of user tables to avoid sync issues across cleanup functions.
