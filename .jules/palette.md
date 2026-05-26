## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2026-05-26 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Inconsistent usage of `aria-label` on icon-only buttons across multiple components (e.g., action buttons in PvP Assistant and Watchlist). While `title` attributes were present for tooltips, they do not sufficiently replace `aria-label` for screen readers across all contexts.
**Action:** Ensure that *all* icon-only buttons include descriptive `aria-label` attributes that convey their action (e.g., "Remove from watchlist", "Skip", "Attack next"). Always audit icon-only interactions for screen reader accessibility.
