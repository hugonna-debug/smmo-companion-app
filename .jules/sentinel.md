## 2024-05-21 - [Prevent Stack Trace Leakage in ErrorBoundary]
**Vulnerability:** The React ErrorBoundary component (`src/components/ErrorBoundary.tsx`) was rendering raw error stack traces directly to the UI (`{this.state.error?.stack}`).
**Learning:** This exposes internal application structure, file paths, and potentially third-party library details to end-users, posing a security risk.
**Prevention:** Avoid rendering error stack traces directly in user-facing components. Use error messages or generic fallbacks instead, and log the detailed stack trace to a secure logging service if necessary.
