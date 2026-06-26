## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2024-05-27 - Simulating Aria-sort on standard buttons
**Learning:** The `aria-sort` attribute is invalid on generic `<button>` elements (it's reserved for table/grid headers). To make sort controls accessible outside of tables, you must encode the sort state directly into the `aria-label` (e.g., `aria-label="Sort by Name (ascending)"`).
**Action:** When implementing custom sort buttons outside of grid/table structures, use dynamic `aria-label` strings to communicate the active sort state rather than relying on `aria-sort`. Also use `aria-pressed` for generic toggle-filter buttons.
