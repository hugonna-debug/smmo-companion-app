## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.
## 2026-06-02 - Adding accessibility to sort/filter buttons
**Learning:**  cannot be used on buttons - it only works on `table`, `grid`, `treegrid` column headers. When simulating sort with simple buttons, using dynamic `aria-label` like "Sort by X (ascending)" is the correct and supported approach. Additionally, filter buttons that change the content below them can benefit from `aria-pressed` to act as a toggle or indicate the currently active filter.
**Action:** Do not use `aria-sort` on generic buttons; build the sorting state into a descriptive `aria-label` or use a native listbox/table header. Use `aria-pressed` for toggle-like filter buttons.
## 2024-05-26 - Adding accessibility to sort/filter buttons
**Learning:** `aria-sort` cannot be used on buttons - it only works on `table`, `grid`, `treegrid` column headers. When simulating sort with simple buttons, using dynamic `aria-label` like "Sort by X (ascending)" is the correct and supported approach. Additionally, filter buttons that change the content below them can benefit from `aria-pressed` to act as a toggle or indicate the currently active filter.
**Action:** Do not use `aria-sort` on generic buttons; build the sorting state into a descriptive `aria-label` or use a native listbox/table header. Use `aria-pressed` for toggle-like filter buttons.
