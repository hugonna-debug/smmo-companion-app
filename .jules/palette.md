## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2026-06-13 - ARIA Enhancements on Watchlist
**Learning:** The `aria-sort` attribute is strictly for grid/table headers. On generic sort `<button>`s, the sort direction and state should be encoded into a dynamic `aria-label` (e.g. "Sort by Level (ascending)"). Additionally, generic filter `<button>`s used as tabs should implement `aria-pressed` to announce their active state to screen readers.
**Action:** Use dynamic `aria-label`s for sort toggles and `aria-pressed` for filter tabs when built with generic buttons.
