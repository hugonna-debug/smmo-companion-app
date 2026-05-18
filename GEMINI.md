# SMMO Companion App

A full-stack companion application for SimpleMMO (SMMO), providing enhanced player tracking, guild management, PvP optimization, and market analytics.

## Project Overview

*   **Purpose:** To serve as a high-performance dashboard and toolset for SimpleMMO players, offering real-time data sync, automated PvP targeting assistance, and detailed game state visualization.
*   **Technologies:**
    *   **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, Lucide Icons.
    *   **Backend:** Convex (Real-time database, Auth, Serverless functions).
    *   **Package Manager:** Bun.
    *   **Linting/Formatting:** Biome.
    *   **E2E Testing:** Playwright.
*   **Architecture:**
    *   **Convex Backend:** Handles all data persistence, SMMO API synchronization (`convex/syncPlayer.ts`), authentication, and server-side game logic.
    *   **React Frontend:** A responsive SPA using standard routing (`react-router-dom`). Layouts are divided into `PublicLayout` (unauthenticated) and `AppLayout` (authenticated, includes sidebar).
    *   **Data Flow:** Uses Convex's reactive queries for real-time UI updates. Backend functions in `convex/gameData.ts` and `convex/smmoApi.ts` bridge the gap between SMMO's API and the local database.

## Building and Running

### Development

1.  **Backend (Convex):**
    ```bash
    bunx convex dev
    ```
    This starts the Convex development server and watches for changes in the `convex/` directory.

2.  **Frontend (Vite):**
    ```bash
    bun run dev
    ```
    Starts the Vite development server.

### Production Build

```bash
bun run sync:build
```
This pushes the latest Convex schema/functions and builds the frontend for production.

### Testing

```bash
# Run e2e tests
bun run test <test-file>

# Examples:
bun run test:demo
bun run test:auth
```

## Project Structure

*   `convex/`: Backend implementation.
    *   `schema.ts`: Database definitions (Player data, Guilds, PvP queue, etc.).
    *   `gameData.ts`: Core queries and mutations for the frontend.
    *   `smmoApi.ts`: Low-level SMMO API client/wrapper.
    *   `syncPlayer.ts`: Logic for syncing player state from SMMO.
    *   `auth.ts`: Authentication configuration.
*   `src/`: Frontend implementation.
    *   `pages/`: Individual view components (Dashboard, PvP Assistant, Guild, etc.).
    *   `components/`: Reusable UI components. `ui/` contains shadcn primitives.
    *   `hooks/`: Custom React hooks (e.g., `useIsMobile`).
    *   `lib/`: Utility functions and constants.
*   `scripts/`: Automation scripts for testing, logging, and screenshots.

## Development Conventions

*   **Linting & Formatting:** Use Biome. Run `bun run format` before committing.
*   **Path Aliases:** Use `@/` to import from the `src/` directory.
*   **Convex Functions:**
    *   Always provide a `returns` validator in queries and mutations.
    *   Prefer `withIndex` over `filter` for database queries.
    *   Public functions go in `query`/`mutation`, internal ones in `internalQuery`/`internalMutation`.
*   **UI Components:**
    *   Leverage existing shadcn/ui components in `src/components/ui/`.
    *   Use Tailwind CSS v4 for styling.
    *   Mobile-first design: Use `useIsMobile()` hook for responsive logic.
*   **SMMO API Guard:** Be mindful of the 40 requests/minute rate limit. Check `convex/apiKeys.ts` or `convex/smmoApi.ts` for implementation details on rate limiting.
