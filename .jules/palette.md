## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2024-06-23 - Dynamic ARIA Labels for Virtual Tables
**Learning:** In responsive lists that behave like tables (e.g., Watchlists), standard sorting buttons often incorrectly use `aria-sort` (which is restricted to grid/table columns). Screen readers fail to announce state changes correctly on these custom generic buttons.
**Action:** Replace `aria-sort` on generic `<button>` elements with dynamic `aria-label` attributes that encode the state (e.g., "Sort by Level (ascending)"). Pair with `aria-pressed` to clearly indicate the currently active toggle. Ensure icon-only delete actions include contextual variables (like the target user's name) in their `aria-label` for disambiguation.
