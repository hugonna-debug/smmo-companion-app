## $(date +%Y-%m-%d) - Prevent IDOR in short-circuit boolean logic
**Vulnerability:** Found an IDOR vulnerability in `convex/market.ts` within the `setPriceAlert` mutation.
**Learning:** The vulnerability existed due to short-circuit evaluation in the authorization check: `if (!item || (userId && item.userId !== userId)) return;`. When a user was not authenticated, `userId` was null, so the expression `userId && item.userId !== userId` immediately evaluated to null without checking ownership, allowing anyone to bypass the check.
**Prevention:** Always explicitly check authentication with `if (!userId) throw new Error("Not authenticated");` before checking authorization, avoiding combined logic loops with optional auth.
