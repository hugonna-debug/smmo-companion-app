## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2025-02-23 - Dynamic aria-labels for sorting instead of aria-sort
**Learning:** `aria-sort` attribute is invalid on generic buttons and only works for grid/table headers, creating accessibility validation issues.
**Action:** Use conditional `aria-label`s on generic sorting buttons to encode the sort state (e.g., `aria-label="Sort by Name (ascending)"`) instead of using `aria-sort`. Use `aria-pressed={state}` on toggle filter buttons.
