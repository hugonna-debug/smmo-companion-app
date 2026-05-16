# AGENTS.md

## Cursor Cloud specific instructions

### Overview

SMMO Companion is a full-stack TypeScript app: React 19 + Vite frontend, Convex serverless backend. See `README.md` for the complete command reference and project structure.

### Prerequisites

- **Bun** is the package manager (not npm). All scripts use `bun run`.
- **Convex credentials** are required in `.env.local`:
  - `VITE_CONVEX_URL` — Convex deployment URL (e.g. `https://xyz.convex.cloud`)
  - `CONVEX_DEPLOY_KEY` — deploy key for CLI auth

### Convex generated files

The `convex/_generated/` directory is `.gitignore`d and must exist for the app to compile. When `CONVEX_DEPLOY_KEY` is available, run `bun run sync` (`bunx convex dev --once`) to regenerate it. Without the key, stub files (`api.ts`, `server.ts`, `dataModel.ts`) can be created from the templates in `node_modules/convex/src/cli/codegen_templates/` — see the dynamic data model and TypeScript API templates.

### Key commands

| Task | Command |
|------|---------|
| Install deps | `bun install` |
| Dev server | `bun run dev` (port 5173) |
| Lint + format check | `bun run check` |
| Lint only | `bun run lint` |
| Typecheck | `bun run typecheck` |
| Build | `bun run build` |
| Sync Convex backend | `bun run sync` |
| Sync + build | `bun run sync:build` |
| E2E tests | `bun run test scripts/<test-file>.ts` |

### Gotchas

- The `node_modules` symlink at the repo root may point to a stale `/tmp/` path from a prior VM. If so, remove it (`rm -f node_modules node_modules_orig`) before running `bun install`.
- `bun run check` reports baseline formatting/import-order issues in the existing codebase (not regressions).
- The Vite cache is stored at `/tmp/vite-cache` (configured in `vite.config.ts`), so it does not persist across VMs.
- Without a valid `VITE_CONVEX_URL` in `.env.local`, the frontend renders a black screen. A placeholder URL (e.g. `https://placeholder.convex.cloud`) allows the landing/login UI to render, but backend queries will fail silently.
- Convex `codegen` and `env` CLI commands require network access to the Convex cloud API; they will fail if `CONVEX_DEPLOY_KEY` is not set.
