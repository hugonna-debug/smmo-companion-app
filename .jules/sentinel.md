## 2024-10-31 - [SSRF in Discord Webhook]
**Vulnerability:** Found a Server-Side Request Forgery (SSRF) vulnerability in `convex/guild.ts` where users could provide any URL for a Discord Webhook. The server would make a POST request to this URL, potentially exposing internal services or aiding in reconnaissance.
**Learning:** External webhook URLs provided by users must be validated on the server side to ensure they only point to the expected external service.
**Prevention:** Implement input validation to verify that URLs begin with trusted domains (e.g., `https://discord.com/api/webhooks/` or `https://discordapp.com/api/webhooks/`) both at the point of configuration saving and execution.
