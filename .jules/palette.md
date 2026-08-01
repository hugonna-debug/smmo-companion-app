## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2024-03-24 - Watchlist Filtering & Sorting Accessibility
**Learning:** Generic `<button>` tags used for grouping, filtering, or sorting content frequently omit contextual structural roles and state attributes (`aria-pressed`, `aria-label`, `role="group"`).
**Action:** When implementing button groups for filtering or sorting, wrap them in a container with `role="group"` and an `aria-label`, encode sorting directions into dynamic `aria-label`s on standard buttons, and use `aria-pressed` to indicate which toggle or filter is active. Ensure icon-only action buttons (like delete/trash) include a specific descriptive `aria-label`.
