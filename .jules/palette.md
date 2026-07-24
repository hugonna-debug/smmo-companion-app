## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2024-07-24 - Accessible Button Sorting and Filtering
**Learning:** The `aria-sort` attribute is reserved for table, grid, or treegrid column headers. Using it on generic `<button>` elements is invalid accessibility practice. Toggle-like filter buttons also often lack `aria-pressed`, leaving screen readers unaware of the active filter state.
**Action:** Simulate sorting on standard buttons by encoding the sort state into dynamic `aria-label` attributes (e.g., 'Sort by Name (ascending)'). Additionally, use `aria-pressed={boolean}` for toggle-like filter buttons that control content display. Always provide contextual `aria-label`s on icon-only actions (like Trash buttons).
