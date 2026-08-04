## 2024-05-26 - Dynamic Aria-labels for State changes
**Learning:** Added dynamic aria-labels (`aria-label={copiedCode === code.code ? "Code copied" : "Copy code"}`) makes for a much better screen reader experience.
**Action:** Use conditional aria-labels on toggles and copy-type buttons instead of static ones where the icon alone indicates state.

## 2024-05-26 - Accessible toggle states for custom switches and filters
**Learning:** Custom UI components that act as toggles or switches need ARIA roles and states to be correctly interpreted by screen readers. A filter button acts as a toggle state, whereas custom UI switches need the `role="switch"` and `aria-checked` to be understood as such.
**Action:** Use `aria-pressed={state}` on `<button>` elements functioning as filters (e.g., 'show favorites only') and use `role="switch"` with `aria-checked={boolean}` on custom toggle controls.
